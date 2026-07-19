import { useState } from "react";
import { authService } from "../features/auth/authService";
import {useNavigate} from "react-router-dom";
import {NotificationModal} from "../layouts/components/Modal";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: "info",
        title: "",
        message: ""
    });

    const handleCloseModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        // Nếu là thành công, có thể chuyển hướng user đi nơi khác sau khi họ bấm đóng modal
        if (modalConfig.type === "success") {
            navigate("/login");
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            const response = await authService.createForgotPwRequest({
                email,
            });

            console.log(response);

            setModalConfig({
                isOpen: true,
                type: "success",
                title: "Thành công!",
                message: response?.data?.response || response?.data || "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn khôi phục mật khẩu trong hộp thư đến."
            });
        } catch (err) {
            console.log(err);

            setModalConfig({
                isOpen: true,
                type: "error",
                title: "Đã xảy ra lỗi",
                message: err?.response?.data?.message || "Đường dẫn hết hạn hoặc không hợp lệ."
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-black text-[#e2e2e2] min-h-screen flex flex-col relative font-sans antialiased overflow-hidden selection:bg-neutral-700 selection:text-white">

            {/* Hiệu ứng mờ nền (Ambient Gradient Blur) */}
            <div
                className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none z-0"
                style={{
                    background: 'radial-gradient(circle, rgba(62, 107, 237, 0.15) 0%, rgba(0,0,0,0) 70%)',
                    filter: 'blur(80px)'
                }}
            />


            {/* Main Form Canvas */}
            <main className="flex-grow flex items-center justify-center px-5 z-10">
                <div className="w-full max-w-md space-y-8 animate-[fadeInUp_0.7s_ease-out]">

                    {/* Tiêu đề biểu mẫu */}
                    <div className="text-center space-y-3">
                        <h2 className="text-[28px] md:text-[32px] font-bold text-white">
                            Quên mật khẩu?
                        </h2>
                        <p className="text-neutral-400 text-base">
                            Nhập địa chỉ email của bạn để nhận hướng dẫn khôi phục mật khẩu.
                        </p>
                    </div>

                    {/* Form nhập liệu */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300 ml-1" htmlFor="email">
                                Email
                            </label>
                            <div
                                className={`bg-[#1A1A1A] border rounded-lg overflow-hidden transition-all duration-200 ${
                                    isFocused
                                        ? 'border-[#e2e2e2] shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                                        : 'border-[#333333]'
                                }`}
                            >
                                <input
                                    className="w-full bg-transparent border-none text-white placeholder:text-neutral-600 p-4 focus:ring-0 text-base focus:outline-none"
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="username@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                />
                            </div>
                        </div>

                        {/* Nút hành động */}
                        <button
                            className={`w-full py-4 bg-[#e2e2e2] text-black font-bold rounded-lg transition-all duration-200 text-base shadow-lg ${
                                isLoading
                                    ? 'opacity-70 cursor-not-allowed'
                                    : 'hover:opacity-90 active:scale-[0.98]'
                            }`}
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    {/* Các liên kết điều hướng phụ */}
                    <div className="pt-4 flex flex-col items-center gap-6">
                        <button
                            className="flex items-center gap-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors duration-200 group"
                            onClick={() => navigate('/login')}
                        >
                            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                               Quay lại đăng nhập
                            </span>

                        </button>

                        <div className="w-full h-[1px] bg-neutral-800 opacity-50"></div>

                        <div className="flex gap-4">
                            <button className="p-3 bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors border border-neutral-800">
                                <span className="material-symbols-outlined text-neutral-400">help</span>
                            </button>
                            <button className="p-3 bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors border border-neutral-800">
                                <span className="material-symbols-outlined text-neutral-400">language</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>


            <NotificationModal
                isOpen={modalConfig.isOpen}
                onClose={handleCloseModal}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText="Đồng ý"
            />
        </div>
    );
};

export default ForgotPassword;