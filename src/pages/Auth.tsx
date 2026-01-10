import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ArrowLeft, Sprout, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthService } from "@/services/auth.service";
import { ZaloService } from "@/services/zalo.service";

// --- COUNTRY CODES ---
const COUNTRY_CODES = [
  { code: "+84", country: "Việt Nam", iso: "vn" },
  { code: "+1", country: "United States", iso: "us" },
  { code: "+44", country: "United Kingdom", iso: "gb" },
  { code: "+81", country: "Japan", iso: "jp" },
  { code: "+82", country: "South Korea", iso: "kr" },
  { code: "+86", country: "China", iso: "cn" },
  { code: "+65", country: "Singapore", iso: "sg" },
  { code: "+60", country: "Malaysia", iso: "my" },
  { code: "+66", country: "Thailand", iso: "th" },
  { code: "+62", country: "Indonesia", iso: "id" },
  { code: "+63", country: "Philippines", iso: "ph" },
  { code: "+91", country: "India", iso: "in" },
  { code: "+49", country: "Germany", iso: "de" },
  { code: "+33", country: "France", iso: "fr" },
  { code: "+39", country: "Italy", iso: "it" },
  { code: "+34", country: "Spain", iso: "es" },
  { code: "+61", country: "Australia", iso: "au" },
  { code: "+64", country: "New Zealand", iso: "nz" },
  { code: "+7", country: "Russia", iso: "ru" },
  { code: "+55", country: "Brazil", iso: "br" },
  { code: "+52", country: "Mexico", iso: "mx" },
  { code: "+971", country: "UAE", iso: "ae" },
  { code: "+966", country: "Saudi Arabia", iso: "sa" },
];


// --- VALIDATION SCHEMAS ---

const registerSchema = z
  .object({
    fullname: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
    username: z
      .string()
      .min(3, "Username phải có ít nhất 3 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Username không được chứa khoảng trắng hoặc ký tự đặc biệt (trừ _)"),
    email: z.string().email("Email không đúng định dạng"),
    countryCode: z.string().min(1, "Vui lòng chọn mã quốc gia"),
    phone: z
      .string()
      .regex(/^[0-9]{9,15}$/, "Số điện thoại không đúng định dạng (9-15 số)"),
    password: z
      .string()
      .min(6, "Mật khẩu phải có tối thiểu 6 ký tự")
      .regex(/^[a-zA-Z0-9]+$/, "Mật khẩu không được chứa ký tự đặc biệt"),
    confirmPassword: z.string(),
    role: z.enum(["farmer", "trader"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  identifier: z.string().min(1, "Vui lòng nhập Username hoặc SĐT"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

const forgotPasswordSchema = z.object({
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
});

const newPasswordSchema = z
  .object({
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự").regex(/^[a-zA-Z0-9]+$/, "Không chứ ký tự đặc biệt"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

// --- COMPONENT ---

const Auth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Registration States
  const [regStep, setRegStep] = useState<"form" | "otp">("form");
  const [tempRegData, setTempRegData] = useState<z.infer<typeof registerSchema> | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null); // In real app, verify on server
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password States
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<"phone" | "otp" | "new-pass">("phone");
  const [forgotPhone, setForgotPhone] = useState("");

  // Forms
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "farmer",
      fullname: "",
      username: "",
      email: "",
      countryCode: "+84",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const forgotForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const newPassForm = useForm<z.infer<typeof newPasswordSchema>>({
    resolver: zodResolver(newPasswordSchema),
  });

  // --- HANDLERS ---

  // 1. REGISTER FLOW
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    try {
      // Combine country code with phone
      const fullPhone = `${values.countryCode}${values.phone}`;

      // Check existence
      const isUserTaken = AuthService.checkExists("username", values.username);
      if (isUserTaken) {
        toast.error("Tài khoản đã tồn tại (Username bị trùng). Vui lòng đăng nhập.");
        return;
      }
      const isPhoneTaken = AuthService.checkExists("phone", fullPhone);
      if (isPhoneTaken) {
        toast.error("Số điện thoại đã được đăng ký. Vui lòng đăng nhập.");
        return;
      }
      const isEmailTaken = AuthService.checkExists("email", values.email);
      if (isEmailTaken) {
        toast.error("Email đã được sử dụng.");
        return;
      }

      // Send OTP
      const res = await ZaloService.sendOTP(fullPhone);
      if (res.success) {
        toast.success(res.message);
        setGeneratedOtp(res.otp || null); // Store OTP
        // Store values with full phone number
        setTempRegData({ ...values, phone: fullPhone });
        setRegStep("otp");
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };


  const onRegisterOtpVerify = async () => {
    if (!tempRegData || !generatedOtp) return;
    setIsLoading(true);
    try {
      if (otpValue !== generatedOtp) {
        toast.error("Mã OTP không chính xác");
        return;
      }

      // Create Account - exclude confirmPassword and countryCode (already merged into phone)
      const dataToSave = {
        fullname: tempRegData.fullname,
        username: tempRegData.username,
        email: tempRegData.email,
        phone: tempRegData.phone,
        password: tempRegData.password,
        role: tempRegData.role,
      };
      await AuthService.register(dataToSave);

      toast.success("Đăng ký thành công! Đang chuyển hướng...");

      // Navigate
      setTimeout(() => {
        navigate(tempRegData.role === "farmer" ? "/farmer/dashboard" : "/trader/dashboard");
      }, 1000);

    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };


  // 2. LOGIN FLOW
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      const res = await AuthService.login(values.identifier, values.password);
      if (res.success && res.user) {
        toast.success(res.message);
        navigate(res.user.role === "farmer" ? "/farmer/dashboard" : "/trader/dashboard");
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. FORGOT PASSWORD FLOW
  const onForgotPhoneSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    setIsLoading(true);
    const exists = AuthService.checkExists("phone", values.phone);
    if (!exists) {
      toast.error("Số điện thoại chưa được đăng ký");
      setIsLoading(false);
      return;
    }

    setForgotPhone(values.phone);
    const res = await ZaloService.sendOTP(values.phone);
    setIsLoading(false);

    if (res.success) {
      toast.success("Đã gửi mã OTP");
      setGeneratedOtp(res.otp || null);
      setForgotStep("otp");
    }
  };

  const onForgotOtpVerify = () => {
    if (otpValue === generatedOtp) {
      setForgotStep("new-pass");
      setOtpValue("");
    } else {
      toast.error("OTP sai");
    }
  };

  const onNewPasswordSubmit = async (values: z.infer<typeof newPasswordSchema>) => {
    setIsLoading(true);
    await AuthService.resetPassword(forgotPhone, values.password);
    setIsLoading(false);
    toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập.");
    setShowForgot(false);
    setForgotStep("phone");
    setActiveTab("login");
  };

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-foreground">R</span>
            </div>
            <CardTitle className="text-2xl gradient-text">Rise of Ledger Utopia</CardTitle>
          </CardHeader>
          <CardContent>
            {regStep === "otp" ? (
              // --- OTP VERIFICATION UI (Register) ---
              <div className="space-y-6 text-center">
                <h3 className="text-lg font-semibold">Xác thực OTP</h3>
                <p className="text-sm text-muted-foreground">
                  Mã xác thực đã được gửi tới Zalo của số <b>{tempRegData?.phone}</b>
                </p>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setRegStep("form")}>
                    Quay lại
                  </Button>
                  <Button className="flex-1 gradient-primary" onClick={onRegisterOtpVerify} disabled={isLoading || otpValue.length < 6}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Xác nhận
                  </Button>
                </div>
              </div>
            ) : (
              // --- MAIN TABS ---
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="register">Đăng ký</TabsTrigger>
                  <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                </TabsList>

                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="fullname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Họ và tên <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="Nguyễn Văn A" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="farmer_pro" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số điện thoại <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <FormField
                                  control={registerForm.control}
                                  name="countryCode"
                                  render={({ field: countryField }) => (
                                    <Select onValueChange={countryField.onChange} defaultValue={countryField.value}>
                                      <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Mã">
                                          {(() => {
                                            const selected = COUNTRY_CODES.find(c => c.code === countryField.value);
                                            return selected ? (
                                              <span className="flex items-center gap-2">
                                                <img src={`https://flagcdn.com/w20/${selected.iso}.png`} alt={selected.country} className="w-5 h-auto" />
                                                {selected.code}
                                              </span>
                                            ) : "Mã";
                                          })()}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {COUNTRY_CODES.map((c) => (
                                          <SelectItem key={c.code} value={c.code}>
                                            <span className="flex items-center gap-2">
                                              <img src={`https://flagcdn.com/w20/${c.iso}.png`} alt={c.country} className="w-5 h-auto" />
                                              {c.code}
                                            </span>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>

                                  )}
                                />
                                <Input placeholder="912345678" {...field} className="flex-1" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />


                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mật khẩu <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Xác nhận <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chọn vai trò</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-2 gap-4"
                              >
                                <FormItem>
                                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/10">
                                    <FormControl>
                                      <RadioGroupItem value="farmer" className="sr-only" />
                                    </FormControl>
                                    <div className="flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all border-border hover:border-muted-foreground">
                                      <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                                        <Sprout className="w-5 h-5 text-success" />
                                      </div>
                                      <span className="font-semibold text-foreground">Nông dân</span>
                                    </div>
                                  </FormLabel>
                                </FormItem>
                                <FormItem>
                                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/10">
                                    <FormControl>
                                      <RadioGroupItem value="trader" className="sr-only" />
                                    </FormControl>
                                    <div className="flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all border-border hover:border-muted-foreground">
                                      <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-secondary" />
                                      </div>
                                      <span className="font-semibold text-foreground">Thương nhân</span>
                                    </div>
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Tạo tài khoản
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="identifier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username hoặc SĐT</FormLabel>
                            <FormControl>
                              <Input placeholder="farmer_pro hoặc 0912345678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mật khẩu</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Đăng nhập
                      </Button>

                      <div className="text-center">
                        <Button
                          variant="link"
                          type="button"
                          className="text-sm text-primary"
                          onClick={() => {
                            setForgotStep("phone");
                            setForgotPhone("");
                            setOtpValue("");
                            setShowForgot(true);
                          }}
                        >
                          Bạn đã quên mật khẩu?
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            )}

            <div className="mt-6 p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <p className="text-xs text-warning">
                Đây là ứng dụng mô phỏng để học tập - Không sử dụng tiền thật
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgot} onOpenChange={setShowForgot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quên mật khẩu</DialogTitle>
            <DialogDescription>Lấy lại mật khẩu qua số điện thoại</DialogDescription>
          </DialogHeader>

          {forgotStep === "phone" && (
            <Form {...forgotForm}>
              <form onSubmit={forgotForm.handleSubmit(onForgotPhoneSubmit)} className="space-y-4">
                <FormField
                  control={forgotForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập số điện thoại đã đăng ký" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
                </Button>
              </form>
            </Form>
          )}

          {forgotStep === "otp" && (
            <div className="space-y-4 text-center">
              <p>Nhập mã OTP gửi tới {forgotPhone}</p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button onClick={onForgotOtpVerify} className="w-full" disabled={otpValue.length < 6}>Xác thực</Button>
            </div>
          )}

          {forgotStep === "new-pass" && (
            <Form {...newPassForm}>
              <form onSubmit={newPassForm.handleSubmit(onNewPasswordSubmit)} className="space-y-4">
                <FormField
                  control={newPassForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu mới</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Mật khẩu mới" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newPassForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Nhập lại mật khẩu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                </Button>
              </form>
            </Form>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
