import { useState } from "react";
import { authService } from "../features/auth/authService";
import {useNavigate, useSearchParams} from "react-router-dom";

export const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [focusedField, setFocusedField] = useState(null);

    // Error state để thông báo nếu mật khẩu không khớp hoặc có lỗi từ API
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Kiểm tra mật khẩu khớp nhau ở client trước khi gửi API
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không trùng khớp.');
            return;
        }

        try {
            setIsLoading(true);

            // Gọi API dịch vụ reset password (truyền token và password mới)
            const response = await authService.resetPassword({
                token: token,
                newPassword: password,
            });

            console.log(response);
            // Sau khi thành công, chuyển hướng về trang đăng nhập
            navigate('/login');
        } catch (err) {
            console.log(err);
            setError(err?.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
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
                            Đặt lại mật khẩu
                        </h2>
                        <p className="text-neutral-400 text-base">
                            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
                        </p>
                    </div>

                    {/* Form nhập liệu */}
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Hiển thị lỗi nếu có */}
                        {error && (
                            <div className="bg-red-950/30 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center animate-pulse">
                                {error}
                            </div>
                        )}

                        {/* Input: Mật khẩu mới */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300 ml-1" htmlFor="password">
                                Mật khẩu mới
                            </label>
                            <div
                                className={`bg-[#1A1A1A] border rounded-lg overflow-hidden transition-all duration-200 ${
                                    focusedField === 'password'
                                        ? 'border-[#e2e2e2] shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                                        : 'border-[#333333]'
                                }`}
                            >
                                <input
                                    className="w-full bg-transparent border-none text-white placeholder:text-neutral-600 p-4 focus:ring-0 text-base focus:outline-none"
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </div>
                        </div>

                        {/* Input: Xác nhận mật khẩu mới */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300 ml-1" htmlFor="confirmPassword">
                                Xác nhận mật khẩu mới
                            </label>
                            <div
                                className={`bg-[#1A1A1A] border rounded-lg overflow-hidden transition-all duration-200 ${
                                    focusedField === 'confirmPassword'
                                        ? 'border-[#e2e2e2] shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                                        : 'border-[#333333]'
                                }`}
                            >
                                <input
                                    className="w-full bg-transparent border-none text-white placeholder:text-neutral-600 p-4 focus:ring-0 text-base focus:outline-none"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onFocus={() => setFocusedField('confirmPassword')}
                                    onBlur={() => setFocusedField(null)}
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
                            {isLoading ? 'Updating...' : 'Reset Password'}
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
        </div>
    );
};