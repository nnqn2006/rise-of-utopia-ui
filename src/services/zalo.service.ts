export const ZaloService = {
    // Simulate sending OTP via Zalo ZNS
    sendOTP: async (phone: string): Promise<{ success: boolean; message: string; otp?: string }> => {
        return new Promise((resolve) => {
            console.log(`[ZaloService] Connecting to ZNS API for phone: ${phone}...`);

            setTimeout(() => {
                // Generate a random 6-digit OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();

                console.log(`%c[ZaloService] 📨 SENT OTP to ${phone}: ${otp}`, "color: #0088FF; font-weight: bold; font-size: 14px;");
                console.log(`%c[ZaloService] (In production, this would be a real ZNS message)`, "color: gray; font-style: italic;");

                resolve({
                    success: true,
                    message: "Mã OTP đã được gửi qua Zalo!",
                    otp: otp // Returning OTP for demo purposes so FE can verify easily if needed, or stored in "session"
                });
            }, 1500); // Simulate network delay
        });
    },

    verifyOTP: async (inputOtp: string, actualOtp: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(inputOtp === actualOtp);
            }, 500);
        });
    }
};
