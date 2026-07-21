import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  Library,
  PlusSquare,
  Heart,
  Headphones,
  Mic2,
  Disc,
  Users,
  LayoutGrid,
  LayoutDashboard,
  Music2,
  ChevronDown,
  ChevronRight,
  MoreVertical, // 🟢 Icon ba chấm cho tùy chọn playlist
  Edit3, // 🟢 Icon sửa
  Trash2, // 🟢 Icon xóa
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../features/auth/useAuthStore";
import { usePlaylistStore } from "../../features/playlist/usePlaylistStore";
import CreatePlaylistModal from "./CreatePlaylistModal";

const Sidebar = () => {
  const { role, userId } = useAuthStore();
  const { playlists, fetchMyPlaylists, updatePlaylist, deletePlaylist } =
    usePlaylistStore(); // 🟢 Lấy thêm hàm sửa/xóa từ store

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);

  // 🟢 States quản lý Menu hành động (Sửa/Xóa) của Playlist
  const [activeMenuPlaylistId, setActiveMenuPlaylistId] = useState(null);
  const menuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "overview";
  const isAdminPage = location.pathname === "/admin";

  useEffect(() => {
    if (userId && role !== "admin" && role !== "artist") {
      fetchMyPlaylists();
    }
  }, [userId, role]);

  // 🟢 Đóng menu ba chấm khi click ra ngoài màn hình
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuPlaylistId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdminTabChange = (tabName) => {
    navigate(`/admin?tab=${tabName}`);
  };

  // 🟢 Hàm xử lý Sửa tên Playlist nhanh bằng prompt
  const handleRename = async (e, id, currentName) => {
    e.preventDefault();
    e.stopPropagation(); // Không cho nhảy sang trang chi tiết playlist khi bấm nút
    setActiveMenuPlaylistId(null);

    const newName = prompt("Nhập tên mới cho danh sách phát:", currentName);
    if (!newName || newName.trim() === "" || newName === currentName) return;

    const result = await updatePlaylist(id, { name: newName.trim() });
    if (result.success) {
      alert("🎉 Đã cập nhật tên playlist thành công!");
    } else {
      alert("❌ Cập nhật tên thất bại.");
    }
  };

  // 🟢 Hàm xử lý Xóa Playlist kèm confirm
  const handleDelete = async (e, id, name) => {
    e.preventDefault();
    e.stopPropagation(); // Không cho nhảy sang trang chi tiết playlist khi bấm nút
    setActiveMenuPlaylistId(null);

    if (
      window.confirm(`⚠️ Bạn có chắc chắn muốn xóa playlist "${name}" không?`)
    ) {
      const result = await deletePlaylist(id);
      if (result.success) {
        alert("🗑️ Đã xóa playlist thành công!");
        // Nếu đang đứng ở đúng trang playlist vừa xóa thì đá user về trang chủ
        if (location.pathname === `/playlist/${id}`) {
          navigate("/");
        }
      } else {
        alert("❌ Xóa playlist thất bại.");
      }
    }
  };

  return (
    <div className="w-64 bg-[#0d131a] p-6 flex flex-col h-full border-r border-white/[0.05] hidden md:flex font-sans text-slate-400">
      {/* LOGO BRANDING */}
      <Link
        to="/"
        className="flex items-center gap-3 mb-8 cursor-pointer group"
      >
        <img
          src="/favicon.svg"
          alt="Music4 Logo"
          className="w-10 h-10 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] group-hover:scale-105 transition-transform"
        />
        <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          MUSIC 4
        </h1>
      </Link>

      {/* THANH ĐIỀU HƯỚNG CHUNG */}
      <nav className="flex flex-col gap-4 font-medium">
        <Link
          to="/"
          className={`flex items-center gap-4 hover:text-sky-400 transition-all ${!isAdminPage && location.pathname === "/" ? "text-sky-400 font-semibold" : ""}`}
        >
          <Home size={22} /> Trang chủ
        </Link>

      </nav>

      {/* DANH SÁCH MENU DÀNH RIÊNG CHO ADMIN */}
      {role === "admin" && (
        <div className="mt-8 pt-6 border-t border-white/[0.05] flex flex-col gap-2 font-medium">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
            Quản trị hệ thống
          </p>
          <button
            onClick={() => handleAdminTabChange("overview")}
            className={`flex items-center gap-4 py-2 px-3 rounded-xl text-sm font-semibold transition-all w-full text-left bg-transparent border-none outline-none cursor-pointer ${isAdminPage && currentTab === "overview" ? "bg-white/[0.06] text-white border-l-2 border-sky-400 rounded-l-none pl-3" : "hover:text-white hover:bg-white/[0.03]"}`}
          >
            <LayoutDashboard size={18} /> Tổng quan
          </button>
          <button
            onClick={() => handleAdminTabChange("users")}
            className={`flex items-center gap-4 py-2 px-3 rounded-xl text-sm font-semibold transition-all w-full text-left bg-transparent border-none outline-none cursor-pointer ${isAdminPage && currentTab === "users" ? "bg-white/[0.06] text-white border-l-2 border-sky-400 rounded-l-none pl-3" : "hover:text-white hover:bg-white/[0.03]"}`}
          >
            <Users size={18} /> Người dùng
          </button>
          <button
            onClick={() => handleAdminTabChange("artists")}
            className={`flex items-center gap-4 py-2 px-3 rounded-xl text-sm font-semibold transition-all w-full text-left bg-transparent border-none outline-none cursor-pointer ${isAdminPage && currentTab === "artists" ? "bg-white/[0.06] text-white border-l-2 border-sky-400 rounded-l-none pl-3" : "hover:text-white hover:bg-white/[0.03]"}`}
          >
            <Mic2 size={18} /> Nghệ sĩ
          </button>
          <button
            onClick={() => handleAdminTabChange("categories")}
            className={`flex items-center gap-4 py-2 px-3 rounded-xl text-sm font-semibold transition-all w-full text-left bg-transparent border-none outline-none cursor-pointer ${isAdminPage && currentTab === "categories" ? "bg-white/[0.06] text-white border-l-2 border-sky-400 rounded-l-none pl-3" : "hover:text-white hover:bg-white/[0.03]"}`}
          >
            <LayoutGrid size={18} /> Thể loại
          </button>
        </div>
      )}

      {/* DANH SÁCH PLAYLIST CHO NGƯỜI NGHE */}
      {role !== "artist" && role !== "admin" && (
        <div className="mt-8 pt-6 border-t border-white/[0.05] flex flex-col gap-1 font-medium">
          {/* Nút Bài hát đã thích */}
          <Link
            to="/favorites"
            className={`flex items-center gap-4 py-2 px-3 rounded-xl text-sm transition-all group ${location.pathname === "/favorites" ? "bg-white/[0.06] text-white font-semibold" : "hover:text-white hover:bg-white/[0.03]"}`}
          >
            <div className="bg-white/[0.04] border border-white/[0.02] p-1.5 rounded-lg text-slate-300">
              <Heart size={18} />
            </div>
            Bài hát đã thích
          </Link>
          <div
            onClick={() => navigate("/explore")}
            className="flex items-center gap-4 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/[0.05] p-3 rounded-lg cursor-pointer transition-colors"
          >
            <Disc size={24} />
            <span>Khám phá</span>
          </div>
          {/* TIÊU ĐỀ DROPDOWN "Playlist của tôi" */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between py-2 px-3 rounded-xl text-sm transition-all w-full text-left bg-transparent border-none outline-none cursor-pointer hover:text-white hover:bg-white/[0.03]"
          >
            <span className="flex items-center gap-4">
              <div className="bg-white/[0.04] border border-white/[0.02] p-1.5 rounded-lg text-slate-300">
                <Music2
                  size={18}
                  className={isDropdownOpen ? "text-sky-400" : "text-slate-300"}
                />
              </div>
              <span
                className={isDropdownOpen ? "text-sky-400 font-semibold" : ""}
              >
                Playlist của tôi
              </span>
            </span>
            <span className="text-slate-500 pr-1">
              {isDropdownOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </span>
          </button>

          {/* NỘI DUNG BÊN TRONG DROPDOWN */}
          {isDropdownOpen && (
            <div className="mt-1 flex flex-col gap-1 transition-all duration-300">
              {/* Nút Tạo Playlist mới */}
              <button
                onClick={() =>
                  userId
                    ? setIsModalOpen(true)
                    : alert("Vui lòng đăng nhập để tạo playlist!")
                }
                className="flex items-center gap-4 py-2 px-3 pl-11 rounded-xl text-xs transition-all w-full text-left bg-transparent border-none outline-none cursor-pointer hover:text-white hover:bg-white/[0.03]"
              >
                <PlusSquare size={16} className="text-slate-400" />
                <span className="font-semibold text-slate-400 hover:text-white">
                  Tạo Playlist mới
                </span>
              </button>

              {/* Danh sách Playlist con có nút Ba chấm Tùy chọn */}
              <div
                className="max-h-[260px] overflow-y-auto custom-scrollbar flex flex-col gap-1 mt-1"
                ref={menuRef}
              >
                <ul className="flex flex-col gap-1 text-sm p-0 m-0 list-none">
                  {playlists.length > 0 ? (
                    playlists.map((pl) => {
                      const isPlaylistActive =
                        location.pathname === `/playlist/${pl.id}`;
                      const isMenuOpen = activeMenuPlaylistId === pl.id;

                      return (
                        <li key={pl.id} className="w-full relative group/item">
                          <Link
                            to={`/playlist/${pl.id}`}
                            className={`flex items-center justify-between py-2 px-3 pl-11 rounded-xl text-xs font-medium transition-all no-underline ${
                              isPlaylistActive
                                ? "bg-white/[0.06] text-white font-semibold border-l-2 border-sky-400 rounded-l-none pl-[42px]"
                                : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                            }`}
                          >
                            <span className="truncate mr-2">🎵 {pl.name}</span>

                            {/* 🟢 Nút Ba chấm (Chỉ hiện ra rõ nét khi hover chuột vào dòng playlist đó) */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveMenuPlaylistId(
                                  isMenuOpen ? null : pl.id,
                                );
                              }}
                              className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-white rounded-md hover:bg-white/[0.08] transition-all bg-transparent border-none cursor-pointer"
                            >
                              <MoreVertical size={14} />
                            </button>
                          </Link>

                          {/* 🟢 MENU DROPDOWN NHỎ THẢ XUỐNG KHI BẤM BA CHẤM */}
                          {isMenuOpen && (
                            <div className="absolute right-2 top-9 bg-[#161f2c] border border-white/[0.08] rounded-lg shadow-xl z-50 py-1 w-28 flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
                              <button
                                onClick={(e) => handleRename(e, pl.id, pl.name)}
                                className="flex items-center gap-2 px-3 py-1.5 text-left text-slate-300 hover:bg-white/[0.06] hover:text-white text-[11px] font-medium bg-transparent border-none cursor-pointer w-full"
                              >
                                <Edit3 size={12} className="text-sky-400" /> Sửa
                                tên
                              </button>
                              <button
                                onClick={(e) => handleDelete(e, pl.id, pl.name)}
                                className="flex items-center gap-2 px-3 py-1.5 text-left text-rose-400 hover:bg-rose-500/10 hover:text-rose-400 text-[11px] font-medium bg-transparent border-none cursor-pointer w-full"
                              >
                                <Trash2 size={12} /> Xóa bỏ
                              </button>
                            </div>
                          )}
                        </li>
                      );
                    })
                  ) : (
                    <li className="text-xs text-slate-600 italic py-2 px-3 pl-11">
                      Chưa có danh sách phát
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL TẠO PLAYLIST */}
      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Sidebar;
