import { useState, useEffect } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import { Edit2, Clock, Music, X, Camera, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '../features/auth/useAuthStore';
import { useFollowStore } from '../features/follow/useFollowStore';
import axiosClient from '../app/axios/axiosClient';
import MusicImage from '../layouts/components/MusicImage';
import {NotificationModal} from "../layouts/components/Modal";


const ProfilePage = () => {
    const navigate = useNavigate();
    const {updateProfile, userId, username, img, role } = useAuthStore();
    const { id } = useParams();
    const { followedArtistIds, fetchFollowedArtists } = useFollowStore();
    const [followedArtistsDetails, setFollowedArtistsDetails] = useState([]);
    const [isLoadingFollowings, setIsLoadingFollowings] = useState(false);

    const [isExpanded, setIsExpanded] = useState(false);

    const [profile, setProfile] = useState({
        name: username || '',
        avatar: img || null
    });

    const isOwner = role === "listener" && Number(userId) === Number(id);


    const targetUserId = id || userId;


    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: "info",
        title: "",
        message: ""
    });
    const handleCloseModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    const [playlists, setPlaylists] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [editName, setEditName] = useState(username || '');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImg, setPreviewImg] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);


    useEffect(() => {
        if (userId) {
            fetchFollowedArtists();
        }
    }, [fetchFollowedArtists, userId]);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!followedArtistIds || followedArtistIds.length === 0) {
                setFollowedArtistsDetails([]);
                return;
            }
            setIsLoadingFollowings(true);
            try {
                const res = await axiosClient.get('/artists/all');
                const allArtists = res.data || [];
                const matched = allArtists.filter(artist => followedArtistIds.includes(Number(artist.id)));
                setFollowedArtistsDetails(matched);
            } catch (err) {
                console.error("Lỗi lấy chi tiết nghệ sĩ follow:", err);
            } finally {
                setIsLoadingFollowings(false);
            }
        };
        fetchDetails();
    }, [followedArtistIds]);

    useEffect(() => {
        if (!targetUserId) return; // Đổi userId thành targetUserId

        const fetchProfileAndPlaylist = async () => {
            setIsLoadingProfile(true);

            try {
                const [profileRes, playlistRes] = await Promise.all([
                    axiosClient.get(`/users/${targetUserId}`),
                    axiosClient.get(`/playlists/my-playlists`),
                ]);

                console.log("Current userId:", userId);

                const apiName = profileRes.data.name || username;
                const apiAvatar = profileRes.data.img || img;

                setProfile({
                    name: apiName,
                    avatar: apiAvatar,
                })

                setPlaylists(playlistRes.data || []);



                console.log("Name " + profileRes.data.name);
                console.log("Avatar " + profileRes.data.avatar);

                setEditName(apiName);
            } catch (error) {
                console.error("Lỗi tải thông tin cá nhân:", error);
                setProfile({ name: username, avatar: img });
                setEditName(username || '');
            } finally {
                setIsLoadingProfile(false);
            }
        };
        fetchProfileAndPlaylist();
    }, [userId, img, username, targetUserId]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImg(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        console.log("Current userId:", userId);
        setIsUpdating(true);
        try {
            const formData = new FormData();
            if (editName && editName.trim() !== '') {
                formData.append('name', editName.trim());
            }

            if (selectedFile) {
                formData.append('img', selectedFile);
            }
            const res = await axiosClient.patch(`/users/${userId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const updatedUser = res.data;
            const updatedAvatarUrl = updatedUser.img || profile.avatar;
            const updatedName = updatedUser.name || editName;

            setProfile({
                name: updatedName,
                avatar: updatedAvatarUrl
            });

            setModalConfig({
                isOpen: true,
                type: "success",
                title: "Thành công!",
                message: "Chỉnh sửa hồ sơ thành công."
            });

            setIsEditModalOpen(false);

            updateProfile(updatedName, updatedAvatarUrl);

            if (previewImg) {
                URL.revokeObjectURL(previewImg);
                setPreviewImg(null);
                setSelectedFile(null);
            }
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            setModalConfig({
                isOpen: true,
                type: "error",
                title: "Đã xảy ra lỗi",
                message: "Chỉnh sửa hồ sơ thất bại. Detais:" + error?.response?.data?.message || "Vui lòng thử lại sau."
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const fallbackAvatar = `https://ui-avatars.com/api/?name=${username || 'U'}&background=0D8BFF&color=fff&size=256`;

    //  Nếu chưa bấm xem thêm, chỉ lấy tối đa 5 phần tử đầu tiên
    const displayedArtists = isExpanded
        ? followedArtistsDetails
        : followedArtistsDetails.slice(0, 5);

    return (
        <div className="bg-[#121212] min-h-screen text-white font-sans pb-32">

            {/* HEADER GRADIENT */}
            <div className="bg-gradient-to-b from-[#535353] to-[#121212] h-[340px] px-8 flex items-end pb-8">
                <div className="flex items-center gap-6">
                    <div
                        onClick={() => isOwner && setIsEditModalOpen(true)}
                        className={`relative w-48 h-48 rounded-full shadow-2xl group bg-[#282828] ${isOwner ? 'cursor-pointer' : ''}`}
                    >
                        <MusicImage
                            src={profile.avatar && profile.avatar !== 'null' ? profile.avatar : fallbackAvatar}
                            type="user"
                            alt="Profile"
                            className={`w-full h-full rounded-full transition-all duration-300 ${isOwner ? 'group-hover:brightness-50' : ''}`}
                        />
                        {/* Chỉ hiển thị lớp phủ "Chọn ảnh" nếu là chủ sở hữu */}
                        {isOwner && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
                                <Edit2 size={32} className="mb-2"/>
                                <span className="text-sm font-bold">Chọn ảnh</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm font-bold uppercase tracking-widest">Hồ sơ</p>
                        <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter">{profile.name}</h1>
                        <p className="text-sm text-[#a7a7a7] flex items-center gap-4">
                            <span>{playlists.length} Danh sách phát công khai</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-blue-400">
                                <Users size={16}/> Đang follow {followedArtistIds.length} nghệ sĩ
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-8 py-4 space-y-12 animate-fadeIn">

                {/* NÚT LỊCH SỬ NGHE NHẠC */}
                {/* Chỉ render Nút Lịch sử nếu là Chủ sở hữu */}
                {isOwner && (
                    <section>
                        <button onClick={() => navigate('/history')} className="flex items-center gap-3 bg-[#181818] hover:bg-[#282828] border border-[#282828] hover:border-[#535353] px-6 py-4 rounded-full transition-all cursor-pointer shadow-md">
                            <Clock size={20} className="text-blue-500"/>
                            <span className="font-bold">Xem Lịch sử Nghe Nhạc Gần Đây</span>
                        </button>
                    </section>
                )}

                {/*DANH SÁCH NGHỆ SĨ ĐANG THEO DÕI ĐỘNG (ĐÃ THÊM LOGIC ẨN/HIỆN) */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Nghệ sĩ đang theo dõi ({followedArtistsDetails.length})</h2>

                        {/* Hiện nút bấm Xem tất cả / Thu gọn nếu số lượng nghệ sĩ lớn hơn 5 */}
                        {followedArtistsDetails.length > 5 && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-sm font-bold text-[#a7a7a7] hover:text-white flex items-center gap-1 cursor-pointer transition-colors bg-transparent border-none"
                            >
                                {isExpanded ? (
                                    <>Thu gọn <ChevronUp size={16} /></>
                                ) : (
                                    <>Xem tất cả <ChevronDown size={16} /></>
                                )}
                            </button>
                        )}
                    </div>

                    {isLoadingFollowings ? (
                        <p className="text-[#a7a7a7] text-sm animate-pulse">Đang tải danh sách theo dõi...</p>
                    ) : followedArtistsDetails.length === 0 ? (
                        <p className="text-[#a7a7a7] text-sm">Bạn chưa theo dõi nghệ sĩ nào.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 transition-all duration-500">
                            {/* Render danh sách đã cắt thông qua biến displayedArtists */}
                            {displayedArtists.map(artist => (
                                <div
                                    key={artist.id}
                                    onClick={() => navigate(`/artist/${artist.id}`)}
                                    className="bg-[#181818] p-5 rounded-xl hover:bg-[#282828] transition-all duration-300 cursor-pointer group text-center animate-fadeIn"
                                >
                                    <div className="w-full mb-4 shadow-lg bg-[#282828] rounded-full overflow-hidden aspect-square">
                                        <MusicImage
                                            src={artist.img}
                                            type="artist"
                                            alt={artist.name}
                                            className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <h4 className="font-bold text-base truncate">{artist.name}</h4>
                                    <p className="text-sm text-[#a7a7a7] mt-1">Nghệ sĩ</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* PLAYLIST ĐÃ TẠO */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 hover:underline cursor-pointer">Playlist của bạn</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {playlists.map(pl => (
                            <div key={pl.id} onClick={() => navigate(`/playlist/${pl.id}`)} className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all duration-300 cursor-pointer group">
                                <div className="w-full aspect-square rounded-md overflow-hidden mb-4 shadow-lg bg-[#282828] flex items-center justify-center">
                                    <MusicImage
                                        src={pl.img || pl.image}
                                        type="playlist"
                                        alt={pl.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h4 className="font-bold text-base truncate">{pl.name}</h4>
                                <p className="text-sm text-[#a7a7a7] mt-1">Của {username}</p>
                            </div>
                        ))}
                    </div>
                </section>

            </div>

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fadeIn">
                    <div className="bg-[#282828] p-6 rounded-xl w-[450px] shadow-2xl relative">
                        <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-[#a7a7a7] hover:text-white cursor-pointer bg-transparent border-none">
                            <X size={24}/>
                        </button>
                        <h2 className="text-2xl font-bold mb-6">Chi tiết hồ sơ</h2>
                        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6">
                            <div className="flex justify-center">
                                <label className="relative w-32 h-32 rounded-full cursor-pointer group shadow-lg border-2 border-transparent hover:border-blue-500 transition-all">
                                    {previewImg ? (
                                        <img src={previewImg} alt="Preview" className="w-full h-full object-cover rounded-full group-hover:brightness-50"/>
                                    ) : (
                                        <MusicImage src={profile.avatar && profile.avatar !== 'null' ? profile.avatar : fallbackAvatar} type="user" className="w-full h-full rounded-full group-hover:brightness-50 transition-all"/>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full">
                                        <Camera size={28} className="text-white"/>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange}/>
                                </label>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[#a7a7a7] mb-2 block uppercase tracking-wider">Tên hiển thị</label>
                                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-[#3e3e3e] border border-transparent focus:border-blue-500 rounded px-4 py-3 text-white outline-none"/>
                            </div>
                            <button type="submit" disabled={isUpdating} className="bg-white text-black font-bold py-3 rounded-full hover:scale-105 transition-transform disabled:opacity-50 cursor-pointer border-none">
                                {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

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

export default ProfilePage;