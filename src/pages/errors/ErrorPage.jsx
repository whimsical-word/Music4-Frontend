import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  LockKeyhole,
  ShieldAlert,
  Music2,
} from "lucide-react";
import { useErrorStore } from "../../features/error/useErrorStore";

const errorConfig = {
  401: {
    icon: LockKeyhole,
    title: "Unauthorized",
    description: "You need to be signed in to access this page.",
    subDescription: "Please log in and try again.",
  },

  403: {
    icon: ShieldAlert,
    title: "Access Denied",
    description: "You don't have permission to access this resource.",
    subDescription: "You may not have the required permissions.",
  },

  404: {
    icon: Music2,
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist.",
    subDescription:
      "It may have been moved, deleted, or the URL might be incorrect.",
  },
};

const ErrorPage = ({ status }) => {
  const navigate = useNavigate();
  const clearError = useErrorStore((state) => state.clearError);

  const config = errorConfig[status] || errorConfig[404];
  const Icon = config.icon;

  const handleHome = () => {
    clearError();
    navigate("/");
  };

  const handleBack = () => {
    clearError();
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -top-40 -left-40 pointer-events-none" />

      <div className="absolute w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -bottom-40 -right-40 pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full text-center">
        {/* Music4 Logo */}
        <Link
          to="/"
          onClick={clearError}
          className="flex items-center justify-center gap-3 mb-12 cursor-pointer group"
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

        {/* Error Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />

            <div className="relative w-24 h-24 rounded-3xl bg-[#181818] border border-[#282828] flex items-center justify-center shadow-2xl">
              <Icon size={44} strokeWidth={1.5} className="text-blue-500" />
            </div>
          </div>
        </div>

        {/* Status */}
        <h1 className="text-[100px] leading-none font-black tracking-tighter text-white/95">
          {status}
        </h1>

        <h2 className="mt-5 text-2xl md:text-3xl font-bold">{config.title}</h2>

        <p className="mt-4 text-[#a7a7a7] text-base leading-relaxed">
          {config.description}
        </p>

        <p className="mt-1 text-[#6f6f6f] text-sm">{config.subDescription}</p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9">
          <button
            onClick={handleBack}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#282828] hover:bg-[#333333] text-white font-semibold transition-all duration-200"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <button
            onClick={handleHome}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-semibold transition-all duration-200 shadow-lg shadow-blue-500/20"
          >
            <Home size={18} />
            Go Home
          </button>
        </div>

        <p className="mt-12 text-xs text-[#555555]">
          Music4 · Your music, your world.
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;
