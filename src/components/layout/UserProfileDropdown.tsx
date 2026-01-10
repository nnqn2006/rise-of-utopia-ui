import { useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Camera, UserPen, ChevronDown, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { AuthService, User } from "@/services/auth.service";
import { toast } from "sonner";

export function UserProfileDropdown() {
    const location = useLocation();
    const [user, setUser] = useState<User | null>(AuthService.getCurrentUser());
    const [showAvatarDialog, setShowAvatarDialog] = useState(false);
    const [showUsernameDialog, setShowUsernameDialog] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Avatar cropper states
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    // Get current role from URL
    const currentRole = location.pathname.startsWith("/farmer") ? "Nông dân" : "Thương nhân";

    // Get user initials for avatar fallback
    const getInitials = () => {
        if (!user) return "?";
        const name = user.fullname || user.username;
        return name.substring(0, 2).toUpperCase();
    };

    // Handle file selection
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target?.result as string);
                setZoom(1);
            };
            reader.readAsDataURL(file);
        }
    };

    // Crop and save avatar
    const handleSaveAvatar = useCallback(async () => {
        if (!selectedImage || !canvasRef.current) return;

        setIsLoading(true);
        try {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Create image element
            const img = new Image();
            img.crossOrigin = "anonymous";

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = selectedImage;
            });

            // Canvas size (square)
            const size = 200;
            canvas.width = size;
            canvas.height = size;

            // Calculate scaled dimensions
            const scale = zoom;
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;

            // Center the image
            const offsetX = (size - scaledWidth) / 2;
            const offsetY = (size - scaledHeight) / 2;

            // Clear and draw
            ctx.clearRect(0, 0, size, size);
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

            // Convert to base64
            const avatarData = canvas.toDataURL("image/jpeg", 0.8);

            // Save to database
            const result = await AuthService.updateAvatar(avatarData);
            if (result.success) {
                toast.success(result.message);
                setUser(AuthService.getCurrentUser());
                setShowAvatarDialog(false);
                setSelectedImage(null);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật avatar");
        } finally {
            setIsLoading(false);
        }
    }, [selectedImage, zoom]);

    // Handle username change
    const handleSaveUsername = async () => {
        if (!newUsername.trim()) {
            toast.error("Vui lòng nhập tên người dùng");
            return;
        }

        if (newUsername.length < 3) {
            toast.error("Tên người dùng phải có ít nhất 3 ký tự");
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
            toast.error("Tên người dùng không được chứa ký tự đặc biệt");
            return;
        }

        setIsLoading(true);
        try {
            const result = await AuthService.updateUsername(newUsername);
            if (result.success) {
                toast.success(result.message);
                setUser(AuthService.getCurrentUser());
                setShowUsernameDialog(false);
                setNewUsername("");
            } else {
                toast.error(result.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer text-left">
                        <Avatar className="w-10 h-10 rounded-lg">
                            <AvatarImage src={user.avatar} alt={user.username} />
                            <AvatarFallback className="rounded-lg bg-primary/20 text-primary font-semibold">
                                {getInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                            <p className="text-sm font-medium text-foreground truncate">{user.username}</p>
                            <p className="text-xs text-muted-foreground">{currentRole}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onClick={() => setShowAvatarDialog(true)} className="cursor-pointer">
                        <Camera className="w-4 h-4 mr-2" />
                        Đổi ảnh đại diện
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => {
                            setNewUsername(user.username);
                            setShowUsernameDialog(true);
                        }}
                        className="cursor-pointer"
                    >
                        <UserPen className="w-4 h-4 mr-2" />
                        Đổi tên người dùng
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Avatar Dialog */}
            <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Đổi ảnh đại diện</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {/* Preview area */}
                        <div className="flex flex-col items-center gap-4">
                            {selectedImage ? (
                                <>
                                    {/* Preview with zoom */}
                                    <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary/20 bg-muted">
                                        <img
                                            ref={(el) => { imageRef.current = el; }}
                                            src={selectedImage}
                                            alt="Preview"
                                            className="absolute inset-0 w-full h-full object-cover"
                                            style={{
                                                transform: `scale(${zoom})`,
                                                transformOrigin: "center",
                                            }}
                                        />
                                    </div>

                                    {/* Zoom slider */}
                                    <div className="w-full flex items-center gap-3">
                                        <ZoomOut className="w-4 h-4 text-muted-foreground" />
                                        <Slider
                                            value={[zoom]}
                                            onValueChange={(values) => setZoom(values[0])}
                                            min={0.5}
                                            max={3}
                                            step={0.1}
                                            className="flex-1"
                                        />
                                        <ZoomIn className="w-4 h-4 text-muted-foreground" />
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full"
                                    >
                                        Chọn ảnh khác
                                    </Button>
                                </>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-48 h-48 rounded-full border-2 border-dashed border-muted-foreground/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                                >
                                    <Camera className="w-12 h-12 text-muted-foreground mb-2" />
                                    <span className="text-sm text-muted-foreground">Chọn ảnh từ máy tính</span>
                                </div>
                            )}
                        </div>

                        {/* Hidden canvas for cropping */}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowAvatarDialog(false);
                            setSelectedImage(null);
                        }}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSaveAvatar}
                            disabled={!selectedImage || isLoading}
                            className="gradient-primary"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Lưu
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Username Dialog */}
            <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Đổi tên người dùng</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-username">Tên người dùng mới</Label>
                            <Input
                                id="new-username"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="Nhập tên người dùng mới"
                            />
                            <p className="text-xs text-muted-foreground">
                                Chỉ chứa chữ cái, số và dấu gạch dưới (_). Tối thiểu 3 ký tự.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUsernameDialog(false)}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSaveUsername}
                            disabled={isLoading}
                            className="gradient-primary"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Lưu
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
