import { supabase } from "@/lib/supabase";

export interface User {
    id: string;
    username: string;
    fullname: string;
    email: string;
    phone: string;
    password: string;
    role: "farmer" | "trader";
    created_at?: string;
}

const CURRENT_USER_KEY = "utopia_current_user";

export const AuthService = {
    // Check if user exists by field
    checkExists: async (field: keyof User, value: string): Promise<boolean> => {
        const { data, error } = await supabase
            .from("users")
            .select("id")
            .eq(field, value)
            .limit(1);

        if (error) {
            console.error("Error checking existence:", error);
            return false;
        }
        return data && data.length > 0;
    },

    // Register new user
    register: async (userData: Omit<User, "id" | "created_at">): Promise<{ success: boolean; message: string }> => {
        try {
            // Check duplicates
            const usernameExists = await AuthService.checkExists("username", userData.username);
            if (usernameExists) {
                return { success: false, message: "Username đã tồn tại" };
            }

            const emailExists = await AuthService.checkExists("email", userData.email);
            if (emailExists) {
                return { success: false, message: "Email đã tồn tại" };
            }

            const phoneExists = await AuthService.checkExists("phone", userData.phone);
            if (phoneExists) {
                return { success: false, message: "Số điện thoại đã tồn tại" };
            }

            // Insert new user
            const { data, error } = await supabase
                .from("users")
                .insert([userData])
                .select()
                .single();

            if (error) {
                console.error("Registration error:", error);
                return { success: false, message: "Lỗi đăng ký: " + error.message };
            }

            // Auto login after register
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data));

            return { success: true, message: "Đăng ký thành công!" };
        } catch (error) {
            console.error("Registration error:", error);
            return { success: false, message: "Có lỗi xảy ra khi đăng ký" };
        }
    },

    // Login user
    login: async (identifier: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
        try {
            // Try to find by username or phone
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .or(`username.eq.${identifier},phone.eq.${identifier}`)
                .eq("password", password)
                .limit(1)
                .single();

            if (error || !data) {
                return { success: false, message: "Thông tin đăng nhập không chính xác" };
            }

            // Save to localStorage for session
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data));

            return { success: true, message: "Đăng nhập thành công", user: data };
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: "Có lỗi xảy ra khi đăng nhập" };
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem(CURRENT_USER_KEY);
    },

    // Get current user from localStorage (for session)
    getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem(CURRENT_USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    // Reset password
    resetPassword: async (phone: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
        try {
            const { data, error } = await supabase
                .from("users")
                .update({ password: newPassword })
                .eq("phone", phone)
                .select()
                .single();

            if (error || !data) {
                return { success: false, message: "Số điện thoại không tồn tại trong hệ thống" };
            }

            return { success: true, message: "Đặt lại mật khẩu thành công" };
        } catch (error) {
            console.error("Reset password error:", error);
            return { success: false, message: "Có lỗi xảy ra" };
        }
    }
};
