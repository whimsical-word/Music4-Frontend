import React, { useState, useEffect } from 'react';
import { useFavoriteStore } from '../features/favorite/useFavoriteStore';
import { usePlayerStore } from '../features/player/usePlayerStore';
import { Heart, MoreHorizontal } from 'lucide-react';
import MusicImage from "../layouts/components/MusicImage";
import TrackEngagementModal from "../layouts/components/TrackEngagementModal";

const LikedSongsPage = () => {
    const { likedTracks, fetchLikedTracks, isLoading } = useFavoriteStore();
    const playTrack = usePlayerStore((state) => state.playTrack);
    const [selectedTrack, setSelectedTrack] = useState(null);

    useEffect(() => {
        fetchLikedTracks();
    }, [fetchLikedTracks]);

    if (isLoading) {
        return (
            <div className="p-6 bg-[#0d131a] min-h-screen flex items-center justify-center font-sans text-white">
                <div className="w-10 h-10 border-4 border-white/[0.05] border-t-sky-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    const handlePlayLikedTrack = (currentTrack) => {
        // Chuẩn hóa danh sách phát để khớp với định dạng Store
        const normalizedPlaylist = likedTracks.map(track => ({
            ...track,
            id: track.trackId,
            name: track.trackName,
            img: track.img,
            artists: track.artistName
                ? [{ name: track.artistName }]
                : []
        }));

        // Tìm bài hiện tại trong danh sách đã chuẩn hóa để phát
        const trackToPlay = normalizedPlaylist.find(t => t.id === currentTrack.trackId);
        playTrack(trackToPlay, normalizedPlaylist);
    };

    return (
        <div className="p-6 pb-32 font-sans text-slate-100 bg-[#0d131a] min-h-screen selection:bg-sky-600 selection:text-white">
            <div className="mb-10 p-8 rounded-xl bg-gradient-to-r from-red-950/40 to-[#131e2e] border border-white/[0.05] shadow-md flex items-end gap-6 relative overflow-hidden">
                <div className="w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-2xl flex-shrink-0 z-10">
                    <Heart size={54} fill="white" className="text-white" />
                </div>
                <div className="relative z-10">
                    <span className="text-xs font-bold uppercase tracking-widest text-red-400">Playlist</span>
                    <h1 className="text-3xl md:text-5xl font-black mt-1 mb-2 text-white tracking-tight">Bài hát đã thích</h1>
                    <p className="text-xs text-slate-400 font-medium">{likedTracks.length} bài hát của bạn</p>
                </div>
            </div>

            <div className="bg-[#0f1722] border border-white/[0.05] p-6 rounded-2xl shadow-2xl space-y-1">
                {likedTracks.length > 0 ? (
                    likedTracks.map((fav, index) => {
                        const trackTitle = fav.trackName;
                        const artistName = fav.artistName;

                        return (
                            <div
                                key={fav.favoriteId}
                                onClick={() => handlePlayLikedTrack(fav)}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer"
                            >
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    <span className="text-slate-500 w-5 text-center text-sm font-medium font-mono">
                                        {index + 1 < 10 ? `0${index + 1}` : index + 1}
                                    </span>

                                    <div className="w-11 h-11 flex-shrink-0">
                                        <MusicImage
                                            src={fav.img}
                                            type="track"
                                            alt={trackTitle}
                                            className="w-11 h-11 object-cover rounded-md shadow-md"
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1 px-1">
                                        <h4 className="font-bold text-sm text-slate-200 truncate group-hover:text-sky-400 transition-colors">
                                            {trackTitle}
                                        </h4>
                                        {artistName && (
                                            <p className="text-xs text-slate-400 mt-1 truncate">
                                                {artistName}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTrack(fav);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white p-2 border-none bg-transparent cursor-pointer"
                                >
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-16 text-sm text-slate-500">Danh sách trống.</div>
                )}
            </div>

            {selectedTrack && (
                <TrackEngagementModal
                    track={selectedTrack}
                    onClose={() => {
                        setSelectedTrack(null);
                        fetchLikedTracks();
                    }}
                />
            )}
        </div>
    );
};

export default LikedSongsPage;