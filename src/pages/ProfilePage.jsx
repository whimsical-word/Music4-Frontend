import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Edit2, Clock, Music, X, Camera} from 'lucide-react';
import {useAuthStore} from '../features/auth/useAuthStore';
import axiosClient from '../app/axios/axiosClient';
import MusicImage from '../layouts/components/MusicImage';

const ProfilePage = () => {
    const IMAGE_URL = "https://music4-v3-storage-kenz.s3.ap-southeast-1.amazonaws.com/";
    const navigate = useNavigate();
    const {id: userId, username, img} = useAuthStore();

    const [profile, setProfile] = useState({
        name: username || '',
        avatar: img || null
    });

    console.log("ProfilePage: userId = " + userId + ", username = " + username + ", img = " + img);

    const [playlists, setPlaylists] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [editName, setEditName] = useState(username || '');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImg, setPreviewImg] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    const favoriteArtists = [
        {
            id: 1,
            name: 'Tiên Tiên',
            img: 'https://images.unsplash.com/photo-1516280440502-a2f1b402e8d3?q=80&w=200&auto=format&fit=crop'
        },
        {
            id: 2,
            name: 'Phùng Khánh Linh',
            img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop'
        },
        {
            id: 3,
            name: 'Thịnh Suy',
            img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'
        },
    ];

    useEffect(() => {
        if (!userId) return;

        const fetchProfileAndPlaylist = async () => {
            setIsLoadingProfile(true);

            try {
                const [profileRes, playlistRes] = await Promise.all([
                    axiosClient.get(`/users/${userId}`), // API lấy chi tiết user từ DB
                    // axiosClient.get('/playlists/me')     // API lấy playlist
                ]);

                setProfile({
                    name: profileRes.data.name,
                    avatar: profileRes.data.img || img,
                })

                setPreviewImg(profile.avatar)

                console.log("Name " + profileRes.data.name);
                console.log("Avatar " + profileRes.data.avatar);

                setEditName(profileRes.data.name);
                // setPlaylists(playlistRes.data || []);
            } catch (error) {
                console.error("Lỗi tải playlist:", error);
                setProfile({name: username, avatar: img});
                setEditName(username || '');
            } finally {
                setIsLoadingProfile(false)
            }
        };
        fetchProfileAndPlaylist();
    }, [userId, name, img]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // URL.createObjectURL sinh ra link dạng blob:http... để xem trước ảnh local
            setPreviewImg(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const formData = new FormData();
            if(editName && editName.trim() !== ''){
                formData.append('name', editName.trim());
            }

            if (selectedFile) {
                formData.append('img', selectedFile);
            }

            // Gọi API Update Avatar
            const res = await axiosClient.patch(`/users/${userId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const updatedUser = res.data;
            const updatedAvatarUrl = updatedUser.img || profile.avatar;
            const updatedName = updatedUser.name || editName;

            setProfile({
                name: updatedName,
                avatar: IMAGE_URL + updatedAvatarUrl
            });

            // const accessToken = localStorage.getItem('accessToken');
            // const refreshToken = localStorage.getItem('refreshToken');
            // const role = localStorage.getItem('role');


            alert("Cập nhật hồ sơ thành công! Vui lòng đăng nhập lại để làm mới phiên (hoặc cập nhật Zustand Store).");
            setIsEditModalOpen(false);
            // if (previewImg) {
            //     URL.revokeObjectURL(previewImg);
            //     setPreviewImg(null);
            //     setSelectedFile(null);
            // }
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            alert(error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Hàm tạo link UI Avatar động dựa theo Username (chạy khi người dùng chưa up avatar)
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${username || 'U'}&background=0D8BFF&color=fff&size=256`;

    return (
        <div className="bg-[#121212] min-h-screen text-white font-sans pb-32">

            {/* HEADER GRADIENT*/}
            <div className="bg-gradient-to-b from-[#535353] to-[#121212] h-[340px] px-8 flex items-end pb-8">
                <div className="flex items-center gap-6">
                    {/* KHU VỰC AVATAR CÓ THỂ CLICK ĐỂ SỬA */}
                    <div
                        onClick={() => setIsEditModalOpen(true)}
                        className="relative w-48 h-48 rounded-full shadow-2xl group cursor-pointer bg-[#282828]"
                    >
                        <MusicImage
                            src={profile.avatar && profile.avatar !== 'null' ? profile.avatar : fallbackAvatar}
                            type="user"
                            alt="Profile"
                            className="w-full h-full rounded-full group-hover:brightness-50 transition-all duration-300"
                        />
                        <div
                            className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
                            <Edit2 size={32} className="mb-2"/>
                            <span className="text-sm font-bold">Chọn ảnh</span>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <p className="text-sm font-bold uppercase tracking-widest">Hồ sơ</p>
                        <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter">{profile.name}</h1>
                        <p className="text-sm text-[#a7a7a7] flex items-center gap-2">
                            <span>{playlists.length} Danh sách phát công khai</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-8 py-4 space-y-12 animate-fadeIn">

                {/* NÚT LỊCH SỬ NGHE NHẠC (Chuyển sang HistoryPage) */}
                <section>
                    <button
                        onClick={() => navigate('/history')}
                        className="flex items-center gap-3 bg-[#181818] hover:bg-[#282828] border border-[#282828] hover:border-[#535353] px-6 py-4 rounded-full transition-all cursor-pointer shadow-md"
                    >
                        <Clock size={20} className="text-blue-500"/>
                        <span className="font-bold">Xem Lịch sử Nghe Nhạc Gần Đây</span>
                    </button>
                </section>

                {/* DANH SÁCH NGHỆ SĨ YÊU THÍCH (Hiển thị hình tròn) */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 hover:underline cursor-pointer">Top nghệ sĩ tháng này</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {favoriteArtists.map(artist => (
                            <div
                                key={artist.id}
                                onClick={() => navigate(`/artist/${artist.id}`)}
                                className="bg-[#181818] p-5 rounded-xl hover:bg-[#282828] transition-all duration-300 cursor-pointer group text-center"
                            >
                                <div className="w-full mb-4 shadow-lg bg-[#282828] rounded-full overflow-hidden">
                                    <MusicImage
                                        src={artist.img}
                                        type="artist"
                                        alt={artist.name}
                                        className="w-full rounded-full group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <h4 className="font-bold text-base truncate">{artist.name}</h4>
                                <p className="text-sm text-[#a7a7a7] mt-1">Artist</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* PLAYLIST ĐÃ TẠO */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 hover:underline cursor-pointer">Playlist của bạn</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {playlists.map(pl => (
                            <div
                                key={pl.id}
                                onClick={() => navigate(`/playlist/${pl.id}`)}
                                className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all duration-300 cursor-pointer group"
                            >
                                <div
                                    className="w-full aspect-square rounded-md overflow-hidden mb-4 shadow-lg bg-[#282828] flex items-center justify-center">
                                    <Music size={40} className="text-[#535353]"/>
                                </div>
                                <h4 className="font-bold text-base truncate">{pl.name}</h4>
                                <p className="text-sm text-[#a7a7a7] mt-1">Của {username}</p>
                            </div>
                        ))}
                    </div>
                </section>

            </div>

            {/* MODAL POPUP CHỈNH SỬA THÔNG TIN */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fadeIn">
                    <div className="bg-[#282828] p-6 rounded-xl w-[450px] shadow-2xl relative">
                        <button onClick={() => setIsEditModalOpen(false)}
                                className="absolute top-4 right-4 text-[#a7a7a7] hover:text-white cursor-pointer bg-transparent border-none">
                            <X size={24}/>
                        </button>
                        <h2 className="text-2xl font-bold mb-6">Chi tiết hồ sơ</h2>

                        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6">
                            <div className="flex justify-center">
                                <label
                                    className="relative w-32 h-32 rounded-full cursor-pointer group shadow-lg border-2 border-transparent hover:border-blue-500 transition-all">
                                    {/* Sử dụng ảnh preview local nếu có, ngược lại dùng MusicImage hiển thị ảnh hiện tại
                                    */}
                                    {previewImg ? (
                                        <img src={previewImg} alt="Preview"
                                             className="w-full h-full object-cover rounded-full group-hover:brightness-50"/>
                                    ) : (
                                        <MusicImage
                                            src={profile.avatar && profile.avatar !== 'null' ? profile.avatar : fallbackAvatar}
                                            type="user"
                                            className="w-full h-full rounded-full group-hover:brightness-50 transition-all"
                                        />
                                    )}
                                    <div
                                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full">
                                        <Camera size={28} className="text-white"/>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange}/>
                                </label>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-[#a7a7a7] mb-2 block uppercase tracking-wider">Tên
                                    hiển thị</label>
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
                                className="bg-white text-black font-bold py-3 rounded-full hover:scale-105 transition-transform disabled:opacity-50 cursor-pointer border-none"
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

export default ProfilePage;