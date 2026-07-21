import { useState } from "react";
import { authService } from "../features/auth/authService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Music, Eye, EyeOff, ArrowLeft } from "lucide-react";

export const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không trùng khớp.');
            return;
        }

        try {
            setIsLoading(true);

            const response = await authService.resetPassword({
                token: token,
                newPassword: password,
            });

            console.log(response);
            navigate('/login');
        } catch (err) {
            console.log(err);
            setError(err?.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
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
                    <p className="text-xs text-[#a7a7a7] mt-1 uppercase tracking-widest">Đặt lại mật khẩu</p>
                </div>

                {/* Thông báo lỗi */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Form Đặt lại mật khẩu */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Mật khẩu mới */}
                    <div>
                        <label className="block text-xs font-semibold text-[#a7a7a7] uppercase tracking-wider mb-2">Mật khẩu mới</label>
                        <div className="relative flex items-center bg-[#1e1e1e] border border-[#282828] rounded-full px-5 py-3.5 focus-within:border-blue-500 transition-all">
                            <Lock className="text-[#a7a7a7] mr-3" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới"
                                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-[#535353] autofill:bg-transparent autofill:text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-[#a7a7a7] hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Xác nhận mật khẩu mới */}
                    <div>
                        <label className="block text-xs font-semibold text-[#a7a7a7] uppercase tracking-wider mb-2">Xác nhận mật khẩu mới</label>
                        <div className="relative flex items-center bg-[#1e1e1e] border border-[#282828] rounded-full px-5 py-3.5 focus-within:border-blue-500 transition-all">
                            <Lock className="text-[#a7a7a7] mr-3" size={18} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu mới"
                                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-[#535353] autofill:bg-transparent autofill:text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-[#a7a7a7] hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Nút hành động */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-full transition-all duration-300 transform active:scale-98 flex items-center justify-center text-sm tracking-wider cursor-pointer border-none"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : "ĐẶT LẠI MẬT KHẨU"}
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
        </div>
    );
};