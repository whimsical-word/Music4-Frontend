import React, { useState, useEffect } from "react";
import { X, Heart, Star, Plus, ListMusic, MessageSquare, Trash2, Edit2 } from "lucide-react";
import { engagementService } from "../../features/player/engagementService";
import { useAuthStore } from "../../features/auth/useAuthStore";
import axiosClient from "../../app/axios/axiosClient";
import MusicImage from "./MusicImage.jsx";

const TrackEngagementModal = ({ track, onClose }) => {
    const { userId, role } = useAuthStore();
    const isArtist = role?.toLowerCase() === "artist";

    const [isLiked, setIsLiked] = useState(false);
    const [rating, setRating] = useState(0);
    const [savedRating, setSavedRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isRatingLoading, setIsRatingLoading] = useState(false);
    const [averageRating, setAverageRating] = useState(0);

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState("");

    const [myPlaylists, setMyPlaylists] = useState([]);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
    const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");

    useEffect(() => {
        if (!track?.id || !userId) return;

        const loadModalData = async () => {
            try {
                const [likeRes, commentRes, ratingRes, playlistRes, avgRatingRes] = await Promise.all([
                    engagementService.checkIsLiked(track.id),
                    engagementService.getCommentsByTrack(track.id),
                    engagementService.getTrackRating ? engagementService.getTrackRating(track.id, userId) : { rating: 0 },
                    !isArtist ? axiosClient.get("/playlists/my-playlists") : { data: [] },
                    engagementService.getAverageRating ? engagementService.getAverageRating(track.id) : axiosClient.get(`/ratings/average/${track.id}`).catch(() => ({ average: 0 }))
                ]);

                setIsLiked(likeRes.liked);
                setComments(commentRes);
                setMyPlaylists(playlistRes.data || playlistRes || []);

                const responseData = avgRatingRes.data ?? avgRatingRes;
                const avgScore = responseData.average ?? responseData.data ?? 0;
                setAverageRating(Number(avgScore));

                if (ratingRes) {
                    const savedScore = ratingRes.rating ?? ratingRes.score ?? 0;
                    setRating(savedScore);
                    setSavedRating(savedScore);
                }
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
            }
        };

        loadModalData();
    }, [track, userId, isArtist]);

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;
        try {
            await axiosClient.post("/playlists", { name: newPlaylistName });
            setNewPlaylistName("");
            setIsCreating(false);
            const res = await axiosClient.get("/playlists/my-playlists");
            setMyPlaylists(res.data || []);
        } catch (err) {
            alert("Không thể tạo playlist.");
        }
    };

    const handleLike = async (e) => {
        if (isArtist) return;
        e.stopPropagation();
        try {
            await engagementService.toggleLikeTrack(track.id);
            setIsLiked(!isLiked);
        } catch (err) { alert("Lỗi thực hiện thao tác."); }
    };

    const handleSaveRating = async () => {
        if (isArtist || rating === 0) return;
        setIsRatingLoading(true);
        try {
            await engagementService.rateTrack(track.id, rating, userId);
            setSavedRating(rating);

            const avgRatingRes = engagementService.getAverageRating
                ? await engagementService.getAverageRating(track.id)
                : await axiosClient.get(`/ratings/average/${track.id}`).catch(() => ({ average: 0 }));

            const responseData = avgRatingRes.data ?? avgRatingRes;
            const avgScore = responseData.average ?? responseData.data ?? 0;
            setAverageRating(Number(avgScore));

            alert("Đánh giá thành công!");
        } catch (err) {
            alert("Lỗi khi gửi đánh giá.");
        } finally {
            setIsRatingLoading(false);
        }
    };

    const handleAddToPlaylist = async (e) => {
        e.preventDefault();
        if (isArtist || !selectedPlaylistId) return;
        setIsAddingToPlaylist(true);
        try {
            await axiosClient.post(`/playlists/${selectedPlaylistId}/tracks`, { trackId: track.id });
            alert("Đã thêm vào playlist!");
            setSelectedPlaylistId("");
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || "Bài hát đã có trong playlist này!";
            alert(typeof errorMsg === 'string' ? errorMsg : "Không thể thêm bài hát vào playlist.");
        } finally {
            setIsAddingToPlaylist(false);
        }
    };

    const handleSendComment = async (e) => {
        e.preventDefault();
        if (isArtist || !newComment.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const res = await engagementService.addComment(track.id, newComment.trim(), userId, null);
            const createdComment = res?.data ?? res ?? {
                commentId: Date.now(),
                userId: userId,
                commenterName: "Bạn",
                content: newComment.trim(),
                createdAt: new Date().toISOString()
            };

            setComments([createdComment, ...comments]);
            setNewComment("");
        } catch (err) {
            alert("Không thể gửi bình luận.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (targetId) => {
        let rawId = typeof targetId === 'object' && targetId !== null
            ? (targetId.commentId || targetId.id)
            : targetId;

        if (rawId !== undefined && rawId !== null) {
            rawId = String(rawId).split(':')[0];
        }

        if (!rawId) return;

        if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
        try {
            await axiosClient.delete(`/comments/${rawId}`);
            setComments(comments.filter(c => {
                const currentId = String(c.commentId || c.id).split(':')[0];
                return currentId !== String(rawId);
            }));
        } catch (err) {
            console.error("Lỗi xóa bình luận:", err);
            alert("Không thể xóa bình luận.");
        }
    };

    const handleUpdateComment = async (targetId) => {
        let rawId = typeof targetId === 'object' && targetId !== null
            ? (targetId.commentId || targetId.id)
            : targetId;

        if (rawId !== undefined && rawId !== null) {
            rawId = String(rawId).split(':')[0];
        }

        if (!editContent.trim() || !rawId) return;

        try {
            await axiosClient.put(`/comments/${rawId}`, { content: editContent.trim() });

            setComments(comments.map(c => {
                const currentId = String(c.commentId || c.id).split(':')[0];
                if (currentId === String(rawId)) {
                    return { ...c, content: editContent.trim() };
                }
                return c;
            }));

            setEditingCommentId(null);
            setEditContent("");
        } catch (err) {
            console.error("Lỗi cập nhật bình luận:", err);
            alert("Không thể cập nhật bình luận.");
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-[#181818] border border-[#282828] w-full max-w-md rounded-2xl p-6 relative text-white shadow-2xl my-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
                    <X size={20} />
                </button>

                <div className="flex items-center gap-4 mb-6 border-b border-[#282828] pb-6">
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                        <MusicImage src={track.img} type="track" alt={track.name} className="w-14 h-14 object-cover" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg truncate">{track.name}</h3>
                        <p className="text-xs text-gray-400">Tương tác {isArtist && "(Xem)"}</p>
                    </div>
                </div>

                <div className="mb-6 bg-[#202020] p-4 rounded-xl border border-[#2c2c2c] text-center">
                    <div className="flex items-center justify-center gap-2 mb-4 bg-black/20 py-2 rounded-lg">
                        <Star size={16} className="text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold">{averageRating > 0 ? averageRating.toFixed(1) : "Chưa có"}</span>
                        <span className="text-xs text-gray-500">/ 5.0</span>
                    </div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Đánh giá</h4>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" disabled={isArtist} onClick={() => setRating(star)}
                                    onMouseEnter={() => !isArtist && setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                                    className={`transition-transform ${isArtist ? "cursor-default" : "cursor-pointer hover:scale-110"}`}>
                                <Star size={28} className={star <= (hoverRating || rating) ? "text-amber-400 fill-amber-400" : "text-zinc-600"} />
                            </button>
                        ))}
                    </div>
                    {!isArtist && (
                        <button onClick={handleSaveRating} disabled={rating === 0 || isRatingLoading} className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-2 rounded-full text-xs transition-colors disabled:opacity-50">
                            {isRatingLoading ? "Đang lưu..." : "Gửi đánh giá"}
                        </button>
                    )}
                </div>

                {!isArtist && (
                    <div className="space-y-4 mb-6">
                        <button onClick={handleLike} className="w-full bg-[#202020] border border-[#2c2c2c] rounded-xl p-4 flex items-center justify-center gap-2 text-sm font-semibold hover:border-gray-500 transition-colors">
                            <Heart size={18} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "text-red-500" : ""} />
                            {isLiked ? "Đã yêu thích" : "Yêu thích"}
                        </button>

                        <div className="bg-[#202020] border border-[#2c2c2c] rounded-xl p-3 space-y-3">
                            <div className="flex items-center gap-2">
                                <ListMusic size={18} className="text-sky-400" />
                                <span className="text-sm font-semibold">Danh sách phát</span>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={selectedPlaylistId}
                                    onChange={(e) => setSelectedPlaylistId(e.target.value)}
                                    className="flex-1 bg-[#282828] text-white text-xs rounded-lg px-2 py-2 outline-none"
                                >
                                    <option value="">Chọn playlist...</option>
                                    {myPlaylists.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <button onClick={handleAddToPlaylist} disabled={!selectedPlaylistId || isAddingToPlaylist} className="bg-sky-600 hover:bg-sky-500 px-4 rounded-lg text-sm font-bold disabled:opacity-50">
                                    Thêm
                                </button>
                            </div>
                            {!isCreating ? (
                                <button
                                    onClick={() => setIsCreating(true)} className="text-[11px] text-sky-400 hover:text-sky-300 underline">+ Tạo playlist mới
                                </button>) : (
                                <div className="flex gap-2">
                                    <input autoFocus placeholder="Tên playlist..." className="flex-1 bg-[#121212] text-xs px-3 py-2 rounded border border-[#3e3e3e] outline-none focus:border-sky-500" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)}/>
                                    <button onClick={handleCreatePlaylist} disabled={!newPlaylistName.trim()} className={`px-3 rounded-lg text-[11px] font-bold transition-all ${
                                        newPlaylistName.trim() ? "bg-sky-600 hover:bg-sky-500 text-white cursor-pointer" : "bg-[#2b2b2b] text-gray-500 cursor-not-allowed"
                                    }`}
                                    >Lưu</button>

                                    <button
                                        onClick={() => {setIsCreating(false);setNewPlaylistName("");}}
                                        className="px-3 text-[11px] text-gray-400 hover:text-white"
                                    >Hủy</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div>
                    <h4 className="text-sm font-bold mb-4 flex items-center gap-2"><MessageSquare size={16} /> Bình luận ({comments.length})</h4>
                    {!isArtist && (
                        <form onSubmit={handleSendComment} className="flex gap-2 mb-4">
                            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Viết bình luận..." className="flex-1 bg-[#202020] border border-[#2c2c2c] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                            <button type="submit" disabled={isSubmitting || !newComment.trim()} className="bg-blue-600 hover:bg-blue-700 px-5 rounded-lg text-sm font-semibold disabled:opacity-50">Gửi</button>
                        </form>
                    )}
                    <div className="space-y-3">
                        {comments.length > 0 ? comments.map((c, index) => {
                            let rawCId = c.commentId || c.id || index;
                            const cId = String(rawCId).split(':')[0];

                            // Xác thực quyền sở hữu động qua ID người dùng (hỗ trợ cả trường hợp DTO trả về userId hoặc khớp trực tiếp)
                            const commentUserId = c.userId || c.commenterId;
                            const isMyComment = commentUserId ? Number(commentUserId) === Number(userId) : (c.commenterName === "Bạn");
                            const isEditing = editingCommentId === cId;

                            return (
                                <div key={cId} className="bg-[#202020] border border-[#2c2c2c] rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-blue-400">{c.commenterName}</span>
                                        {isMyComment && !isArtist && (
                                            <div className="flex items-center gap-2">
                                                {!isEditing ? (
                                                    <>
                                                        <button
                                                            onClick={() => { setEditingCommentId(cId); setEditContent(c.content); }}
                                                            className="text-gray-400 hover:text-sky-400 transition-colors"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteComment(cId)}
                                                            className="text-gray-400 hover:text-red-400 transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => setEditingCommentId(null)}
                                                        className="text-xs text-gray-400 hover:text-white"
                                                    >
                                                        Hủy
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="flex gap-2 mt-2">
                                            <input
                                                type="text"
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="flex-1 bg-[#121212] text-xs px-3 py-1.5 rounded border border-[#3e3e3e] outline-none focus:border-sky-500 text-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateComment(cId)}
                                                className="bg-sky-600 hover:bg-sky-500 px-3 py-1 rounded text-xs font-bold text-white cursor-pointer"
                                            >
                                                Lưu
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-200">{c.content}</div>
                                    )}
                                </div>
                            );
                        }) : <p className="text-center text-gray-500 text-sm py-4">Chưa có bình luận.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackEngagementModal;