import React, { useState } from "react";
import { X } from "lucide-react";
import { usePlaylistStore } from "../../features/playlist/usePlaylistStore";

const CreatePlaylistModal = ({ isOpen, onClose }) => {
    const { createPlaylist } = usePlaylistStore();
    const [playlistName, setPlaylistName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!playlistName.trim()) return;

        setIsSubmitting(true);
        const result = await createPlaylist({
            name: playlistName,
            description: description,
        });
        setIsSubmitting(false);

        if (result.success) {
            alert("🎉 Tạo playlist mới thành công!");
            setPlaylistName("");
            setDescription("");
            onClose();
        } else {
            alert(`❌ Thất bại: ${result.message}`);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs">
            <div className="bg-[#0f1722] border border-white/[0.08] w-full max-w-md p-6 rounded-2xl shadow-2xl relative text-white">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/[0.08] transition-colors cursor-pointer bg-transparent border-none"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold mb-5 tracking-tight text-slate-100">Tạo playlist mới</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Tên danh sách phát <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            placeholder="Ví dụ: Nhạc Chill Cuối Tuần..."
                            className="w-full bg-[#16222f] border border-white/[0.06] focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Mô tả</label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Thêm một vài dòng mô tả..."
                            className="w-full bg-[#16222f] border border-white/[0.06] focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !playlistName.trim()}
                            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-400 text-white text-sm font-bold rounded-full border-none cursor-pointer shadow-md"
                        >
                            {isSubmitting ? "Đang tạo..." : "Tạo ngay"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePlaylistModal;