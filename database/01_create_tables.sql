-- =====================================================
-- RISE OF UTOPIA - DATABASE SCHEMA
-- Chạy script này trong Supabase SQL Editor
-- =====================================================

-- =====================================================
-- TABLE 1: user_assets (Tài sản chung)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  usdg_balance DECIMAL(18,2) DEFAULT 100.00,
  land_area INTEGER DEFAULT 100,
  reputation_points INTEGER DEFAULT 1000,
  reputation_level VARCHAR(50) DEFAULT 'Tân thủ',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE 2: trader_data (Dữ liệu Trader)
-- =====================================================
CREATE TABLE IF NOT EXISTS trader_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Token balances (bắt đầu = 0)
  token_balances JSONB DEFAULT '{
    "GAO": {"amount": 0, "cost_basis": 0},
    "FRUIT": {"amount": 0, "cost_basis": 0},
    "VEG": {"amount": 0, "cost_basis": 0},
    "GRAIN": {"amount": 0, "cost_basis": 0}
  }'::jsonb,
  
  -- Inventory từ Store (bắt đầu = 0)
  inventory JSONB DEFAULT '{
    "GAO": {"amount": 0, "avg_price": 0},
    "FRUIT": {"amount": 0, "avg_price": 0},
    "VEG": {"amount": 0, "avg_price": 0},
    "GRAIN": {"amount": 0, "avg_price": 0}
  }'::jsonb,
  
  -- Pool thanh khoản RIÊNG cho Trader (tỷ lệ 50:50)
  pool_state JSONB DEFAULT '{
    "GAO/USDG": {"token_reserve": 10000, "usdg_reserve": 10000},
    "FRUIT/USDG": {"token_reserve": 10000, "usdg_reserve": 10000},
    "VEG/USDG": {"token_reserve": 10000, "usdg_reserve": 10000},
    "GRAIN/USDG": {"token_reserve": 10000, "usdg_reserve": 10000}
  }'::jsonb,
  
  -- Statistics
  total_trades INTEGER DEFAULT 0,
  total_volume DECIMAL(18,2) DEFAULT 0,
  total_profit_loss DECIMAL(18,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lịch sử swap của Trader
CREATE TABLE IF NOT EXISTS trader_swap_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  from_token VARCHAR(20) NOT NULL,
  to_token VARCHAR(20) NOT NULL,
  from_amount DECIMAL(18,4) NOT NULL,
  to_amount DECIMAL(18,4) NOT NULL,
  slippage DECIMAL(5,2),
  profit_loss DECIMAL(18,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trader_swap_user ON trader_swap_history(user_id);
CREATE INDEX IF NOT EXISTS idx_trader_swap_created ON trader_swap_history(created_at DESC);

-- =====================================================
-- TABLE 3: farmer_data (Dữ liệu Farmer)
-- =====================================================
CREATE TABLE IF NOT EXISTS farmer_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- 12 ô đất trống (100m²)
  farm_plots JSONB DEFAULT '[
    {"id": 1, "status": "empty", "seed_type": null, "planted_at": null, "harvest_time": 0},
    {"id": 2, "status": "empty", "seed_type": null, "planted_at": null, "harvest_time": 0},
    {"id": 3, "status": "empty", "seed_type": null, "planted_at": null, "harvest_time": 0},
    {"id": 4, "status": "empty", "seed_type": null, "planted_at": null, "harvest_time": 0},
    {"id": 5, "status": "empty", "seed_type": null, "planted_at": null, "harvest_time": 0},
    {"id": 6, "status": "empty", "seed_type": null, "planted_at": null, "harvest_time": 0},
    {"id": 7, "status": "empty", "seed_type": null, "planted_at": null, "harvest_time": 0},
    {"id": 8, "status": "empty", "seed_type": null, "planted_at": null, "harvest_time": 0},
    {"id": 9, "status": "empty", "seed_type": null, "planted_at": null, "harvest_time": 0},
    {"id": 10, "status": "empty", "seed_type": null, "planted_at": null, "harvest_time": 0},
    {"id": 11, "status": "empty", "seed_type": null, "planted_at": null, "harvest_time": 0},
    {"id": 12, "status": "empty", "seed_type": null, "planted_at": null, "harvest_time": 0}
  ]'::jsonb,
  
  -- Kho hạt giống (bắt đầu = 0)
  seed_warehouse JSONB DEFAULT '{"GAO": 0, "FRUIT": 0, "VEG": 0, "GRAIN": 0}'::jsonb,
  
  -- Kho nông sản (bắt đầu = 0)
  harvest_warehouse JSONB DEFAULT '{
    "GAO": {"amount": 0, "cost_basis": 0},
    "FRUIT": {"amount": 0, "cost_basis": 0},
    "VEG": {"amount": 0, "cost_basis": 0},
    "GRAIN": {"amount": 0, "cost_basis": 0}
  }'::jsonb,
  
  -- Pool thanh khoản RIÊNG cho Farmer (tỷ lệ 50:50)
  pool_state JSONB DEFAULT '{
    "GAO/USDG": {"token_reserve": 10000, "usdg_reserve": 10000, "total_lp": 10000},
    "FRUIT/USDG": {"token_reserve": 10000, "usdg_reserve": 10000, "total_lp": 10000},
    "VEG/USDG": {"token_reserve": 10000, "usdg_reserve": 10000, "total_lp": 10000},
    "GRAIN/USDG": {"token_reserve": 10000, "usdg_reserve": 10000, "total_lp": 10000}
  }'::jsonb,
  
  -- Vị thế LP của Farmer
  liquidity_positions JSONB DEFAULT '{
    "GAO/USDG": {"lp_amount": 0, "staked_lp": 0, "sim_earned": 0},
    "FRUIT/USDG": {"lp_amount": 0, "staked_lp": 0, "sim_earned": 0},
    "VEG/USDG": {"lp_amount": 0, "staked_lp": 0, "sim_earned": 0},
    "GRAIN/USDG": {"lp_amount": 0, "staked_lp": 0, "sim_earned": 0}
  }'::jsonb,
  
  -- Statistics
  total_harvests INTEGER DEFAULT 0,
  total_sim_earned DECIMAL(18,4) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lịch sử hoạt động farming
CREATE TABLE IF NOT EXISTS farmer_activity_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  token_type VARCHAR(20),
  amount DECIMAL(18,4),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_farmer_activity_user ON farmer_activity_history(user_id);
CREATE INDEX IF NOT EXISTS idx_farmer_activity_created ON farmer_activity_history(created_at DESC);

-- =====================================================
-- TRIGGER: Tự động khởi tạo khi user đăng ký
-- =====================================================
CREATE OR REPLACE FUNCTION initialize_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Tạo user_assets với giá trị mặc định
  INSERT INTO user_assets (user_id) VALUES (NEW.id);
  
  -- Tạo trader_data (tay trắng + pool riêng)
  INSERT INTO trader_data (user_id) VALUES (NEW.id);
  
  -- Tạo farmer_data (tay trắng + pool riêng)
  INSERT INTO farmer_data (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Xóa trigger cũ nếu có
DROP TRIGGER IF EXISTS on_user_created ON users;

-- Tạo trigger mới
CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE user_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE trader_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE trader_swap_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_activity_history ENABLE ROW LEVEL SECURITY;

-- Policies cho user_assets
DROP POLICY IF EXISTS "Users read own assets" ON user_assets;
DROP POLICY IF EXISTS "Users update own assets" ON user_assets;
CREATE POLICY "Users read own assets" ON user_assets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own assets" ON user_assets FOR UPDATE USING (user_id = auth.uid());

-- Policies cho trader_data
DROP POLICY IF EXISTS "Users read own trader_data" ON trader_data;
DROP POLICY IF EXISTS "Users update own trader_data" ON trader_data;
CREATE POLICY "Users read own trader_data" ON trader_data FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own trader_data" ON trader_data FOR UPDATE USING (user_id = auth.uid());

-- Policies cho trader_swap_history
DROP POLICY IF EXISTS "Users read own swaps" ON trader_swap_history;
DROP POLICY IF EXISTS "Users insert own swaps" ON trader_swap_history;
CREATE POLICY "Users read own swaps" ON trader_swap_history FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users insert own swaps" ON trader_swap_history FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policies cho farmer_data
DROP POLICY IF EXISTS "Users read own farmer_data" ON farmer_data;
DROP POLICY IF EXISTS "Users update own farmer_data" ON farmer_data;
CREATE POLICY "Users read own farmer_data" ON farmer_data FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own farmer_data" ON farmer_data FOR UPDATE USING (user_id = auth.uid());

-- Policies cho farmer_activity_history
DROP POLICY IF EXISTS "Users read own farm activities" ON farmer_activity_history;
DROP POLICY IF EXISTS "Users insert own farm activities" ON farmer_activity_history;
CREATE POLICY "Users read own farm activities" ON farmer_activity_history FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users insert own farm activities" ON farmer_activity_history FOR INSERT WITH CHECK (user_id = auth.uid());

-- =====================================================
-- HOÀN THÀNH!
-- =====================================================
