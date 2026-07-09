import React, { useState, useEffect } from "react";
import { X, Heart, MessageSquare, Star } from "lucide-react";
import { engagementService } from "../../features/player/engagementService";
import { useAuthStore } from "../../features/auth/useAuthStore";

const TrackEngagementModal = ({ track, onClose }) => {
    const { userId, role } = useAuthStore();

    const [isLiked, setIsLiked] = useState(false);
    const [rating, setRating] = useState(0); // Số sao đang chọn tạm thời trên UI
    const [savedRating, setSavedRating] = useState(0); // 🟢 STATE MỚI: Lưu số sao thực tế đã ghi nhận trong DB
    const [hoverRating, setHoverRating] = useState(0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRatingLoading, setIsRatingLoading] = useState(false);

    useEffect(() => {
        if (!track?.id || !userId) return;

        const loadModalData = async () => {
            try {
                const [likeRes, commentRes, ratingRes] = await Promise.all([
                    engagementService.checkIsLiked(track.id),
                    engagementService.getCommentsByTrack(track.id),
                    engagementService.getTrackRating ? engagementService.getTrackRating(track.id, userId) : { rating: 0 }
                ]);

                setIsLiked(likeRes.liked);
                setComments(commentRes);

                if (ratingRes) {
                    const savedScore = ratingRes.rating !== undefined ? ratingRes.rating : ratingRes.score;
                    if (savedScore) {
                        setRating(savedScore);
                        setSavedRating(savedScore); // 🟢 Set điểm cũ từ DB vào state theo dõi bản ghi gốc
                    }
                }
            } catch (error) {
                console.error("Lỗi tải thông tin Modal:", error);
            }
        };

        loadModalData();
    }, [track, userId]);

    const handleLike = async (e) => {
        e.stopPropagation();
        try {
            await engagementService.toggleLikeTrack(track.id);
            setIsLiked(!isLiked);
        } catch (error) {
            alert("Không thể thực hiện thao tác Thích. Vui lòng kiểm tra lại đăng nhập!");
        }
    };

    const handleSaveRating = async () => {
        if (rating === 0) return;

        setIsRatingLoading(true);
        try {
            if (engagementService.rateTrack) {
                await engagementService.rateTrack(track.id, rating, userId);
                setSavedRating(rating); // 🟢 Đồng bộ savedRating bằng với số sao vừa gửi thành công để khóa nút
                alert("Đánh giá của bạn đã được lưu thành công!");
            }
        } catch (error) {
            console.error("Lỗi đánh giá bài hát:", error);
            alert("Không thể lưu đánh giá sao. Vui lòng thử lại!");
        } finally {
            setIsRatingLoading(false);
        }
    };

    const handleSendComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await engagementService.addComment(
                track.id,
                newComment.trim(),
                role === "listener" ? userId : null,
                role === "artist" ? userId : null
            );

            const newCommentObj = {
                commentId: Date.now(),
                commenterName: localStorage.getItem('username') || "Bạn",
                commenterRole: "Thành viên",
                commenterImg: null,
                content: newComment.trim(),
                createdAt: new Date().toISOString()
            };

            setComments([newCommentObj, ...comments]);
            setNewComment("");
        } catch (error) {
            alert("Gửi bình luận thất bại. Vui lòng thử lại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#181818] border border-[#282828] w-full max-w-lg rounded-2xl overflow-hidden p-6 relative text-white shadow-2xl">

                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors border-none bg-transparent cursor-pointer">
                    <X size={22} />
                </button>

                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#282828]">
                    <img src={track.img} alt={track.name} className="w-16 h-16 object-cover rounded-md shadow-md" />
                    <div>
                        <h3 className="font-bold text-lg truncate max-w-[300px]">{track.name}</h3>
                        <p className="text-xs text-gray-400">Tương tác bài hát</p>
                    </div>
                </div>

                {/* KHỐI RATING KIỂM SOÁT ĐỘ SÁNG CỦA NÚT GỬI */}
                <div className="mb-4 bg-[#202020] p-4 rounded-xl text-center border border-[#2c2c2c]">
                    <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Đánh giá của bạn</h4>

                    <div className="flex items-center justify-center gap-2 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => {
                            const isStarred = star <= (hoverRating || rating);
                            return (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="bg-transparent border-none cursor-pointer p-1 transition-transform active:scale-110"
                                >
                                    <Star
                                        size={28}
                                        className={`transition-all duration-150 ${
                                            isStarred
                                                ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                                                : "text-zinc-600"
                                        }`}
                                    />
                                </button>
                            );
                        })}
                    </div>

                    {/* Nút gửi đánh giá - Tối lại khi không có thay đổi (rating === savedRating) */}
                    <button
                        onClick={handleSaveRating}
                        disabled={rating === 0 || isRatingLoading || rating === savedRating}
                        className="bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold px-6 py-1.5 rounded-full text-xs transition-all border-none cursor-pointer uppercase tracking-tighter"
                    >
                        {isRatingLoading ? "Đang lưu..." : "Gửi đánh giá"}
                    </button>
                </div>

                <div className="mb-4 bg-[#202020] p-4 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-medium">Yêu thích bài hát này</span>
                    <button
                        onClick={(e) => handleLike(e)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm border-none cursor-pointer transition-all"
                        style={{
                            backgroundColor: isLiked ? "#ef4444" : "#282828",
                            color: isLiked ? "#fff" : "#a7a7a7"
                        }}
                    >
                        <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                        {isLiked ? "Đã Thích" : "Yêu thích"}
                    </button>
                </div>

                <div>
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-300">
                        <MessageSquare size={16} /> Cộng đồng bình luận ({comments.length})
                    </h4>

                    <form onSubmit={handleSendComment} className="flex gap-2 mb-4">
                        <input
                            type="text"
                            placeholder="Viết bình luận của bạn..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1 bg-[#282828] border border-transparent focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 font-bold px-4 rounded-xl text-sm transition-colors border-none cursor-pointer text-white"
                        >
                            Gửi
                        </button>
                    </form>

                    <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment.commentId} className="bg-[#202020] p-3 rounded-xl border border-[#2c2c2c]">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-blue-400">
                                                {comment.commenterName || "Người dùng ẩn danh"}
                                            </span>
                                            {comment.commenterRole && (
                                                <span className="text-[9px] bg-white/10 px-1 rounded text-gray-400">
                                                    {comment.commenterRole}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-500">
                                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('vi-VN') : "Vừa xong"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-200">
                                        {comment.content || "Nội dung trống"}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-xs text-gray-500 border border-dashed border-[#282828] rounded-xl">
                                Chưa có bình luận nào. Hãy là người đầu tiên!
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TrackEngagementModal;