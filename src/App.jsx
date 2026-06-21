import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import RegisterPage from "./pages/RegisterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AllTracksPage from "./pages/AllTracksPage.jsx";
import AllArtistsPage from "./pages/AllArtistsPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import PlaylistPage from "./pages/PlaylistPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import ArtistProfilePage from "./pages/ArtistProfilePage.jsx";
import { CreateTrackPage } from "./pages/CreateTrackPage";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import LikedSongsPage from "./pages/LikedSongsPage.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* MainLayout bọc ngoài cùng làm gốc */}
                <Route path="/" element={<MainLayout />}>
                    {/* Các route con bên trong không cần bắt đầu bằng dấu "/" để tránh lỗi redirect sai tầng */}
                    <Route index element={<HomePage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="tracks" element={<AllTracksPage />} />
                    <Route path="artists" element={<AllArtistsPage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="playlist/:id" element={<PlaylistPage />} />
                    <Route path="history" element={<HistoryPage />} />
                    <Route path="artist/:id" element={<ArtistProfilePage />} />
                    <Route path="studio/upload" element={<CreateTrackPage />} />
                    <Route path="admin" element={<AdminDashboardPage />} />

                    {/* Thêm các Route khác vào đây, ví dụ: */}
                    {/* <Route path="search" element={<SearchPage />} /> */}
                    <Route path="favorites" element={<LikedSongsPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;