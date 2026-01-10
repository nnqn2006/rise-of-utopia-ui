
export interface User {
    id: string;
    username: string;
    fullname: string;
    email: string;
    phone: string;
    password: string;
    role: "farmer" | "trader";
    createdAt: string;
}

const STORAGE_KEY = "utopia_users";
const CURRENT_USER_KEY = "utopia_current_user";

export const AuthService = {
    getUsers: (): User[] => {
        const usersStr = localStorage.getItem(STORAGE_KEY);
        return usersStr ? JSON.parse(usersStr) : [];
    },

    saveUser: (user: User) => {
        const users = AuthService.getUsers();
        users.push(user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    },

    checkExists: (field: keyof User, value: string): boolean => {
        const users = AuthService.getUsers();
        return users.some((u) => u[field] === value);
    },

    register: async (userData: Omit<User, "id" | "createdAt">): Promise<{ success: boolean; message: string }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Check duplicates again just in case
                if (AuthService.checkExists("username", userData.username)) {
                    resolve({ success: false, message: "Username đã tồn tại" });
                    return;
                }
                if (AuthService.checkExists("email", userData.email)) {
                    resolve({ success: false, message: "Email đã tồn tại" });
                    return;
                }
                if (AuthService.checkExists("phone", userData.phone)) {
                    resolve({ success: false, message: "Số điện thoại đã tồn tại" });
                    return;
                }

                const newUser: User = {
                    ...userData,
                    id: Math.random().toString(36).substr(2, 9),
                    createdAt: new Date().toISOString(),
                };

                AuthService.saveUser(newUser);
                // Auto login after register
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

                resolve({ success: true, message: "Đăng ký thành công!" });
            }, 800);
        });
    },

    login: async (identifier: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const users = AuthService.getUsers();
                // Check username or phone
                const user = users.find(
                    (u) => (u.username === identifier || u.phone === identifier) && u.password === password
                );

                if (user) {
                    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
                    resolve({ success: true, message: "Đăng nhập thành công", user });
                } else {
                    resolve({ success: false, message: "Thông tin đăng nhập không chính xác" });
                }
            }, 800);
        });
    },

    logout: () => {
        localStorage.removeItem(CURRENT_USER_KEY);
    },

    getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem(CURRENT_USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    resetPassword: async (phone: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const users = AuthService.getUsers();
                const userIndex = users.findIndex((u) => u.phone === phone);

                if (userIndex === -1) {
                    resolve({ success: false, message: "Số điện thoại không tồn tại trong hệ thống" });
                    return;
                }

                users[userIndex].password = newPassword;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
                resolve({ success: true, message: "Đặt lại mật khẩu thành công" });
            }, 800);
        });
    }
};
