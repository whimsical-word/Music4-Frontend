import  { useEffect } from "react";
import { CircleCheck, CircleX, Info } from "lucide-react";

export const NotificationModal = ({
                                      isOpen,
                                      onClose,
                                      type = "info", // "success" | "error" | "info"
                                      title,
                                      message,
                                      confirmText = "Xác nhận"
                                  }) => {

    // Đóng modal bằng phím Escape (Tăng trải nghiệm UX)
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Định nghĩa màu sắc và icon dựa trên `type` để dùng chung cho mọi trường hợp
    const typeConfig = {
        success: {
            icon: <CircleCheck />,
            iconColor: "text-emerald-400",
            bgColor: "bg-emerald-950/20",
            borderColor: "border-emerald-500/30"
        },
        error: {
            icon: <CircleX />,
            iconColor: "text-red-400",
            bgColor: "bg-red-950/20",
            borderColor: "border-red-500/30"
        },
        info: {
            icon: <Info/>,
            iconColor: "text-blue-400",
            bgColor: "bg-blue-950/20",
            borderColor: "border-blue-500/30"
        }
    };

    const config = typeConfig[type] || typeConfig.info;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans antialiased">
            {/* Lớp nền mờ tối (Backdrop Overlay) */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
                onClick={onClose}
            />

            {/* Khung Modal chính (Canvas) */}
            <div
                className={`relative w-full max-w-sm bg-[#121212] border ${config.borderColor} rounded-xl p-6 shadow-2xl z-10 transition-all transform scale-100 animate-[fadeInUp_0.3s_ease-out]`}
            >
                <div className="flex flex-col items-center text-center space-y-4">

                    {/* Icon bọc trong vòng tròn màu dịu tiệp với nền tối */}
                    <div className={`p-3 rounded-full ${config.bgColor} ${config.iconColor}`}>
                        <span className="material-symbols-outlined text-[32px] block">
                            {config.icon}
                        </span>
                    </div>

                    {/* Tiêu đề & Nội dung */}
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white tracking-wide">
                            {title}
                        </h3>
                        <p className="text-neutral-400 text-sm leading-relaxed whitespace-pre-line">
                            {message}
                        </p>
                    </div>

                    {/* Nút hành động */}
                    <button
                        onClick={onClose}
                        className="w-full mt-2 py-3 bg-[#e2e2e2] hover:bg-white text-black font-semibold rounded-lg transition-all duration-200 text-sm active:scale-[0.98] shadow-md"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};