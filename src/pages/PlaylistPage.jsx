 import React, { useState, useEffect } from 'react';
 import { useParams, useNavigate } from 'react-router-dom';
 import { Play, ArrowLeft, Clock } from 'lucide-react';
 import { usePlayerStore } from '../features/player/usePlayerStore';
//
const PlaylistPage = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     // const playTrack = usePlayerStore(state => state.playTrack);
//
//     const [playlist, setPlaylist] = useState({ name: 'Đang tải...', tracks: [] });
//
//     useEffect(() => {
//         // Tương lai: Gọi API axiosClient.get(`/playlists/${id}/tracks`)
//         // Tạm thời mock data để bạn thấy giao diện
//         setPlaylist({
//             name: `Playlist #${id}`,
//             tracks: [] // Sẽ map bài hát ở đây
//         });
//     }, [id]);
//
//     return (
//         <div className="bg-[#121212] min-h-screen text-white pb-32">
//             <div className="bg-gradient-to-b from-[#282828] to-[#121212] p-8 flex items-end gap-6 h-[300px]">
//                 <div className="w-48 h-48 bg-[#3e3e3e] shadow-2xl flex items-center justify-center rounded-sm">
//                     <span className="text-6xl">🎵</span>
//                 </div>
//                 <div>
//                     <p className="text-xs font-bold uppercase tracking-wider">Playlist</p>
//                     <h1 className="text-5xl md:text-7xl font-black mt-2 mb-4">{playlist.name}</h1>
//                 </div>
//             </div>
//
//             <div className="p-8">
//                 <button className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border-none shadow-lg mb-8">
//                     <Play size={24} fill="currentColor" className="text-black ml-1" />
//                 </button>
//
//                 {/* BẢNG BÀI HÁT */}
//                 <div className="w-full text-[#a7a7a7] text-sm">
//                     <div className="grid grid-cols-12 gap-4 pb-2 border-b border-[#282828] mb-4 px-4">
//                         <div className="col-span-1">#</div>
//                         <div className="col-span-8">Tiêu đề</div>
//                         <div className="col-span-3 text-right"><Clock size={16} className="inline-block" /></div>
//                     </div>
//
//                     {playlist.tracks.length > 0 ? (
//                         playlist.tracks.map((track, index) => (
//                             <div key={index} className="grid grid-cols-12 gap-4 p-4 hover:bg-[#282828] rounded-md transition-colors cursor-pointer group">
//                                 <div className="col-span-1 flex items-center">{index + 1}</div>
//                                 <div className="col-span-8 text-white">{track.name}</div>
//                                 <div className="col-span-3 text-right">0:00</div>
//                             </div>
//                         ))
//                     ) : (
//                         <div className="text-center py-10">Danh sách phát này hiện chưa có bài hát nào.</div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
 };
// Tish chưa làm nên để lại
export default PlaylistPage;