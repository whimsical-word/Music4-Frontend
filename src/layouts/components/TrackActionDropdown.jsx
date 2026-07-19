import React, { useState, useEffect, useRef } from "react";
import { MoreHorizontal, Plus, ListMusic } from "lucide-react";
import { usePlaylistStore } from "../../features/playlist/usePlaylistStore";

const TrackActionDropdown = ({ trackId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { playlists, addTrackToPlaylist } = usePlaylistStore();
    const dropdownRef = useRef(null);

    // Đóng dropdown khi click ra ngoài vùng menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAddToPlaylist = async (playlistId, playlistName) => {

        const result = await addTrackToPlaylist(playlistId, trackId);
        if (result.success) {
            alert(`🎉 Đã thêm bài hát vào playlist "${playlistName}"!`);
        } else {
            alert(`❌ Thêm thất bại: ${result.message}`);
        }
        setIsOpen(false); // Thêm xong thì đóng menu lại
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Nút Ba Chấm kích hoạt Dropdown */}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Ngăn chặn sự kiện click dòng làm phát nhạc
                    setIsOpen(!isOpen);
                }}
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/[0.08] transition-colors cursor-pointer bg-transparent border-none outline-none"
                title="Tùy chọn bài hát"
            >
                <MoreHorizontal size={18} />
            </button>

            {/* Vùng hiển thị Danh sách menu lựa chọn */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0f1722] border border-white/[0.08] rounded-xl shadow-2xl z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3.5 py-1.5 border-b border-white/[0.04]">
                        Thêm vào danh sách phát
                    </p>

                    <div className="max-h-48 overflow-y-auto custom-scrollbar py-1">
                        {playlists.length > 0 ? (
                            playlists.map((pl) => (
                                <button
                                    key={pl.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToPlaylist(pl.id, pl.name);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-sm text-slate-300 hover:text-sky-400 hover:bg-white/[0.04] transition-colors flex items-center gap-2 cursor-pointer bg-transparent border-none outline-none"
                                >
                                    <ListMusic size={14} className="text-slate-500" />
                                    <span className="truncate">{pl.name}</span>
                                </button>
                            ))
                        ) : (
                            <p className="text-xs text-slate-500 px-3.5 py-2 italic">
                                Bạn chưa có playlist nào. Hãy tạo ở thanh sidebar!
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackActionDropdown;