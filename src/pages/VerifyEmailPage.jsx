import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Đang xác thực tài khoản của bạn...');

    useEffect(() => {
        let isMounted = true;

        if (!token) {
            setStatus('error');
            setMessage('Mã xác thực không hợp lệ hoặc bị thiếu!');
            return;
        }

        const controller = new AbortController();

        fetch(`http://localhost:8080/api/v1/verify-email?token=${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal
        })
            .then(async (res) => {
                const data = await res.json();
                if (isMounted) {
                    if (res.ok) {
                        setStatus('success');
                        setMessage(data.message || 'Xác thực tài khoản thành công!');
                    } else {
                        setStatus('error');
                        setMessage(data.message || 'Xác thực thất bại!');
                    }
                }
            })
            .catch((err) => {
                if (err.name !== 'AbortError' && isMounted) {
                    setStatus('error');
                    setMessage('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
                }
            });

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [token]);

    return (
        /* Dùng h-fullThay vì min-h-screen để vừa khít vùng <main> của MainLayout */
        <div className="h-full w-full flex items-center justify-center bg-black text-white p-4 font-sans overflow-hidden">
            <div className="w-full max-w-md bg-[#121212] border border-neutral-800 rounded-2xl p-8 text-center shadow-2xl">

                {/* State 1: Loading */}
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-neutral-800 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                        <h2 className="text-xl font-bold text-white mb-2">Đang xác thực...</h2>
                        <p className="text-sm text-neutral-400">{message}</p>
                    </div>
                )}

                {/* State 2: Success */}
                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl font-bold mb-4 border border-emerald-500/20">
                            ✓
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Xác thực thành công!</h2>
                        <p className="text-sm text-neutral-400 mb-6">{message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all text-white font-medium rounded-xl text-sm"
                        >
                            Đăng nhập ngay
                        </button>
                    </div>
                )}

                {/* State 3: Error */}
                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl font-bold mb-4 border border-rose-500/20">
                            ✕
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Xác thực thất bại</h2>
                        <p className="text-sm text-neutral-400 mb-6">{message}</p>
                        <Link
                            to="/register"
                            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                        >
                            Quay lại Đăng ký
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}