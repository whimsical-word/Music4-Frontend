import { useState } from "react";
import { authService } from "../features/auth/authService";
import {useNavigate} from "react-router-dom";
import {NotificationModal} from "../layouts/components/Modal";
import {ArrowLeft, Mail, Music} from "lucide-react";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: "info",
        title: "",
        message: ""
    });

    const handleCloseModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
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
                message: err?.response?.data?.response || err?.data?.response || "Đường dẫn hết hạn hoặc không hợp lệ."
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-full bg-black flex items-center justify-center p-4 font-sans text-gray-100">
            <div className="w-full max-w-md bg-[#121212] border border-[#282828] p-8 rounded-2xl shadow-xl transition-all hover:border-[#3e3e3e]">

                {/* Header Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Music className="text-white" size={26} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-wider">
                        MUSIC<span className="text-blue-500">4</span>
                    </h2>
                    <p className="text-xs text-[#a7a7a7] mt-1 uppercase tracking-widest">Khôi phục mật khẩu</p>
                </div>

                {/* Form Quên mật khẩu */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-[#a7a7a7] uppercase tracking-wider mb-2">Email</label>
                        <div className="relative flex items-center bg-[#1e1e1e] border border-[#282828] rounded-full px-5 py-3.5 focus-within:border-blue-500 transition-all">
                            <Mail className="text-[#a7a7a7] mr-3" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nhập email của bạn"
                                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-[#535353] [color-scheme:dark] autofill:bg-transparent autofill:text-white autofill:[transition:background-color_9999s_ease-in-out_0s]"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-full transition-all duration-300 transform active:scale-98 flex items-center justify-center text-sm tracking-wider cursor-pointer border-none"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : "GỬI LIÊN KẾT KHÔI PHỤC"}
                    </button>
                </form>

                {/* Quay lại đăng nhập */}
                <div className="mt-8 text-center text-xs text-[#a7a7a7] border-t border-[#282828] pt-6">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-white hover:text-blue-400 hover:underline bg-transparent border-none p-0 cursor-pointer transition-colors inline-flex items-center gap-1.5 font-medium"
                    >
                        <ArrowLeft size={14} /> Quay lại đăng nhập
                    </button>
                </div>

            </div>

            {/* Modal thông báo */}
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