import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
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
import CreateAlbumPage from "./pages/CreateAlbumPage.jsx";
import AlbumDetailPage from "./pages/AlbumDetailPage.jsx";
import LikedSongsPage from "./pages/LikedSongsPage.jsx";
import OAuth2RedirectPage from "./pages/OAuth2RedirectPage.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import { ResetPassword } from "./pages/ResetPassword.jsx";
import AllAlbumPage from "./pages/AllAlbumPage.jsx";
import RandomExplorePage from "./pages/RandomExplorePage.jsx";
import CategoryDetailPage from "./pages/CategoryDetailPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import UnauthorizedPage from "./pages/errors/UnauthorizedPage.jsx";
import ForbiddenPage from "./pages/errors/ForbiddenPage.jsx";
import NotFoundPage from "./pages/errors/NotFoundPage.jsx";
import ProtectedRoute from "./layouts/components/ProtectedRoute.jsx";
import { useErrorStore } from "./features/error/useErrorStore";

function AppContent() {
  const errorStatus = useErrorStore((state) => state.errorStatus);

  if (errorStatus === 401) {
    return <UnauthorizedPage />;
  }

  if (errorStatus === 403) {
    return <ForbiddenPage />;
  }

  if (errorStatus === 404) {
    return <NotFoundPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* ADMIN ONLY */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>

        {/* ARTIST and ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={["ARTIST", "ADMIN"]} />}>
          <Route path="/studio/upload" element={<CreateTrackPage />} />
          <Route path="/studio/album" element={<CreateAlbumPage />} />
        </Route>

        {/* PUBLIC ROUTES */}
        <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path={"/reset-password"} element={<ResetPassword />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="tracks" element={<AllTracksPage />} />
        <Route path="/albums" element={<AllAlbumPage />} />
        <Route path="/artists" element={<AllArtistsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/playlist/:id" element={<PlaylistPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/artist/:id" element={<ArtistProfilePage />} />
        <Route path="/favorites" element={<LikedSongsPage />} />
        <Route path="/albums/:albumId" element={<AlbumDetailPage />} />
        <Route path="/explore" element={<RandomExplorePage />} />
        <Route path="/categories/:id" element={<CategoryDetailPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/401" element={<UnauthorizedPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
