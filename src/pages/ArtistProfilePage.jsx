import  { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Activity, Camera, Edit2, X } from 'lucide-react';
import axiosClient from '../app/axios/axiosClient';
import { useAuthStore } from '../features/auth/useAuthStore';
import { usePlayerStore } from '../features/player/usePlayerStore';
import MusicImage from '../layouts/components/MusicImage';

const ArtistProfilePage = () => {
    const IMAGE_URL = "https://music4-v3-storage-kenz.s3.ap-southeast-1.amazonaws.com/";
    const { id } = useParams();
    const navigate = useNavigate();
    const playTrack = usePlayerStore(state => state.playTrack);

    const { id: loggedInId, role } = useAuthStore();
    const isOwner = role === 'artist' && Number(loggedInId) === Number(id);
    const [artistInfo, setArtistInfo] = useState(null);
    const [albums, setAlbums] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 🟢 Các State phục vụ cho Modal Chỉnh sửa hồ sơ
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [selectedCover, setSelectedCover] = useState(null);
    const [previewCover, setPreviewCover] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchArtistData = async () => {
            setIsLoading(true);
            try {
                const artistRes = await axiosClient.get(`/artists/${id}`);
                setArtistInfo(artistRes.data);
                setEditName(artistRes.data.name); // Nạp sẵn tên hiện tại vào form

                const albumsRes = await axiosClient.get(`/albums/artist/${id}`);
                setAlbums(albumsRes.data || []);

                    const statsRes = await axiosClient.get(`/analytics/artist/${id}/overview`);
                    setStats(statsRes.data);

            } catch (error) {
                console.error("Lỗi tải thông tin nghệ sĩ:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArtistData();
    }, [id, isOwner]);

    // 🟢 Hàm xử lý Submit Form Cập nhật
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const formData = new FormData();
            formData.append('name', editName);
            // Ý nghĩa biến: Nếu người dùng có chọn ảnh mới thì nhét vào form, nếu không thì bỏ qua
            if (selectedAvatar) formData.append('img', selectedAvatar);
            if (selectedCover) formData.append('cover', selectedCover);

            // Gọi API PATCH cập nhật thông tin Nghệ sĩ
            await axiosClient.patch(`/artists/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("Cập nhật hồ sơ Nghệ sĩ thành công!");
            setIsEditModalOpen(false);
            window.location.reload(); // F5 để cập nhật giao diện toàn cục
        } catch (error) {
            console.error("Lỗi cập nhật hồ sơ:", error);
            alert("Cập nhật thất bại.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) return <div className="p-20 flex justify-center"><div className="w-10 h-10 border-4 border-t-blue-500 rounded-full animate-spin"></div></div>;
    if (!artistInfo) return <div className="p-20 text-center text-white">Không tìm thấy thông tin nghệ sĩ.</div>;

    return (
        <div className="bg-[#121212] min-h-screen text-white font-sans pb-32 relative">

            {/* 1. KHU VỰC ẢNH BÌA VÀ AVATAR CỦA NGHỆ SĨ */}
            <div className="relative h-[40vh] min-h-[350px] flex items-end p-8">
                <div className="absolute inset-0 z-0">
                    <MusicImage
                        src={artistInfo.cover || artistInfo.img}
                        type="artist"
                        className="w-full h-full object-cover blur-sm opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent"></div>
                </div>

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-48 h-48 rounded-full shadow-2xl overflow-hidden border-4 border-[#282828] relative group">
                        <MusicImage src={artistInfo.img} type="artist" className="w-full h-full" />

                        {/* NÚT MỞ MODAL SỬA HỒ SƠ DÀNH CHO CHÍNH CHỦ */}
                        {isOwner && (
                            <div
                                onClick={() => setIsEditModalOpen(true)}
                                className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                            >
                                <Edit2 size={32} className="text-white mb-2" />
                                <span className="text-white text-sm font-bold">Sửa hồ sơ</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-blue-400 mb-2">
                            <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px]">✓</span>
                            Nghệ sĩ xác thực
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter">{artistInfo.name}</h1>
                        <div className="flex items-center gap-6">

                            {!isOwner && (
                                <button className="px-4 py-1.5 border border-[#a7a7a7] text-white rounded-full font-bold uppercase text-xs hover:border-white hover:scale-105 transition-all bg-transparent cursor-pointer">
                                    Theo dõi
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-[#a7a7a7] font-medium">
                            {artistInfo.trackTotal} Bài hát • {artistInfo.albumTotal} Album
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-8 relative z-10 space-y-12">

                {/* 2. CHỈ HIỂN THỊ DÀNH RIÊNG CHO CHÍNH CHỦ: BẢNG THỐNG KÊ */}

                    <section className="bg-[#181818] border border-[#282828] p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Activity className="text-blue-500" /> Tổng quan dữ liệu của bạn
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#282828] p-5 rounded-xl">
                                <p className="text-sm text-[#a7a7a7] uppercase tracking-wider mb-1">Tổng lượt nghe</p>
                                <p className="text-3xl font-black text-white">{stats.totalViews?.toLocaleString() || 0}</p>
                            </div>
                            <div className="bg-[#282828] p-5 rounded-xl">
                                <p className="text-sm text-[#a7a7a7] uppercase tracking-wider mb-1">Tổng người theo dõi</p>
                                <p className="text-3xl font-black text-white">{stats.totalFollowers?.toLocaleString() || 0}</p>
                            </div>
                            <div className="bg-[#282828] p-5 rounded-xl">
                                <p className="text-sm text-[#a7a7a7] uppercase tracking-wider mb-1">Lượt thả tim</p>
                                <p className="text-3xl font-black text-white">{stats.totalFavorites?.toLocaleString() || 0}</p>
                            </div>
                        </div>
                    </section>

                {/* 3. NÚT PLAY ALL */}
                <button className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border-none shadow-lg">
                    <Play size={24} fill="currentColor" className="text-black ml-1" />
                </button>

                {/* 4. DANH SÁCH ALBUM CỦA NGHỆ SĨ */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 hover:underline cursor-pointer">Album</h2>
                    {albums.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {albums.map((album) => (
                                <div key={album.id} onClick={() => navigate(`/albums/${album.id}`)} className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all duration-300 group cursor-pointer">
                                    <div className="relative aspect-square w-full mb-4 rounded-md overflow-hidden bg-[#282828] shadow-md">
                                        <MusicImage src={album.img} type="album" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-md border-none cursor-pointer">
                                                <Play size={18} fill="currentColor" className="text-black ml-0.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-white truncate text-sm mb-1 group-hover:text-blue-400 transition-colors">{album.name}</h4>
                                    <p className="text-[11px] text-[#a7a7a7] font-medium uppercase tracking-wider">{new Date(album.uploadDate).getFullYear()} • Album</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[#a7a7a7] text-sm">Nghệ sĩ này chưa phát hành album nào.</p>
                    )}
                </section>

            </div>

            {/* 🟢 5. MODAL POPUP CHỈNH SỬA THÔNG TIN */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fadeIn">
                    <div className="bg-[#282828] p-6 rounded-xl w-[500px] shadow-2xl relative">
                        <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-[#a7a7a7] hover:text-white cursor-pointer bg-transparent border-none z-20">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6">Chi tiết hồ sơ Nghệ sĩ</h2>

                        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6">

                            {/* KHU VỰC ĐỔI ẢNH BÌA (COVER) */}
                            <div className="relative h-32 w-full rounded-md overflow-hidden bg-[#3e3e3e] group shadow-inner">
                                {previewCover ? (
                                    <img src={previewCover} alt="Cover Preview" className="w-full h-full object-cover group-hover:brightness-50" />
                                ) : (
                                    <MusicImage src={artistInfo.cover || artistInfo.img} type="artist" className="w-full h-full object-cover group-hover:brightness-50" />
                                )}
                                <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer bg-black/40 transition-opacity">
                                    <Camera size={28} className="text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                        const file = e.target.files[0];
                                        if(file) { setSelectedCover(file); setPreviewCover(URL.createObjectURL(file)); }
                                    }} />
                                </label>
                                <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white font-bold tracking-wider">ẢNH BÌA</div>
                            </div>

                            {/* KHU VỰC ĐỔI AVATAR (Nằm đè lên viền dưới của Ảnh bìa) */}
                            <div className="flex justify-center -mt-16 relative z-10">
                                <label className="relative w-28 h-28 rounded-full cursor-pointer group shadow-2xl border-4 border-[#282828] hover:border-blue-500 transition-all bg-[#181818]">
                                    {previewAvatar ? (
                                        <img src={previewAvatar} alt="Avatar Preview" className="w-full h-full object-cover rounded-full group-hover:brightness-50" />
                                    ) : (
                                        <MusicImage src={artistInfo.img} type="artist" className="w-full h-full rounded-full group-hover:brightness-50 transition-all" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full bg-black/40 transition-opacity">
                                        <Camera size={24} className="text-white" />
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                        const file = e.target.files[0];
                                        if(file) { setSelectedAvatar(file); setPreviewAvatar(URL.createObjectURL(file)); }
                                    }} />
                                </label>
                            </div>

                            {/* ĐỔI TÊN */}
                            <div>
                                <label className="text-xs font-bold text-[#a7a7a7] mb-2 block uppercase tracking-wider">Tên Nghệ sĩ</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-[#3e3e3e] border border-transparent focus:border-blue-500 rounded px-4 py-3 text-white outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="bg-white text-black font-bold py-3 rounded-full hover:scale-105 transition-transform disabled:opacity-50 cursor-pointer border-none mt-2"
                            >
                                {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArtistProfilePage;