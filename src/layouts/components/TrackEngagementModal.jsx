import React, { useState, useEffect } from "react";
import { X, Heart, MessageSquare } from "lucide-react";
import { engagementService } from "../../features/player/engagementService";
import { useAuthStore } from "../../features/auth/useAuthStore";// 🟢 Import store để lấy ID người dùng

const TrackEngagementModal = ({ track, onClose }) => {
    // 🌟 Lấy đúng thuộc tính 'id' từ useAuthStore và đổi tên thành 'currentUserId' để truyền sang service
    const { id: currentUserId } = useAuthStore();

    const [isLiked, setIsLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Tải dữ liệu ban đầu khi mở Modal lên
    useEffect(() => {
        if (!track?.id) return;

        const loadModalData = async () => {
            try {
                // Chạy song song kiểm tra Tim và lấy danh sách Comment
                const [likeRes, commentRes] = await Promise.all([
                    engagementService.checkIsLiked(track.id),
                    engagementService.getCommentsByTrack(track.id)
                ]);
                setIsLiked(likeRes.liked);
                setComments(commentRes);
            } catch (error) {
                console.error("Lỗi tải thông tin Modal:", error);
            }
        };

        loadModalData();
    }, [track]);

    // Xử lý hành động bấm nút Yêu Thích
    const handleLike = async (e) => {
        e.stopPropagation(); // Ngăn chặn tối đa việc lan truyền click ra trang chủ
        try {
            await engagementService.toggleLikeTrack(track.id);
            setIsLiked(!isLiked); // Đảo trạng thái ngay trên giao diện
        } catch (error) {
            alert("Không thể thực hiện thao tác Thích. Vui lòng kiểm tra lại đăng nhập!");
        }
    };

    // Xử lý gửi bình luận
    const handleSendComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Gọi API gửi lên Backend
            await engagementService.addComment(track.id, newComment.trim(), currentUserId);


            const newCommentObj = {
                id: Date.now(), // Tạo key tạm thời tránh trùng lặp log React
                content: newComment.trim(),
                user: {
                    username: localStorage.getItem('username') || "Thành viên"
                }
            };

            // Đẩy comment mới vừa gán lên đầu danh sách hiển thị
            setComments([newCommentObj, ...comments]);
            setNewComment(""); // Xóa sạch text trong ô input
        } catch (error) {
            alert("Gửi bình luận thất bại. Vui lòng thử lại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#181818] border border-[#282828] w-full max-w-lg rounded-2xl overflow-hidden p-6 relative text-white shadow-2xl">

                {/* Header nút đóng */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors border-none bg-transparent cursor-pointer">
                    <X size={22} />
                </button>

                {/* Thông tin bài hát */}
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#282828]">
                    <img src={track.img} alt={track.name} className="w-16 h-16 object-cover rounded-md shadow-md" />
                    <div>
                        <h3 className="font-bold text-lg truncate max-w-[300px]">{track.name}</h3>
                        <p className="text-xs text-gray-400">Tương tác bài hát</p>
                    </div>
                </div>

                {/* Khối chức năng Thả Tim */}
                <div className="mb-6 bg-[#202020] p-4 rounded-xl flex items-center justify-between">
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

                {/* Khối Bình Luận */}
                <div>
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-300">
                        <MessageSquare size={16} /> Cộng đồng bình luận ({comments.length})
                    </h4>

                    {/* Form gửi comment */}
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

                    {/* Danh sách bình luận */}
                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment.id} className="bg-[#202020] p-3 rounded-xl border border-[#2c2c2c]">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-blue-400">
                                            {comment.user?.username || comment.username || "Thành viên"}
                                        </span>
                                        <span className="text-[10px] text-gray-500">Vừa xong</span>
                                    </div>
                                    <p className="text-sm text-gray-200">
                                        {comment.content || comment.commentText || comment.text || "Nội dung trống"}
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