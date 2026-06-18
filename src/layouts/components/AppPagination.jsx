import React from "react";

export function AppPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  let items = [];

  for (let number = 1; number <= totalPages; number++) {
    const isActive = number === currentPage + 1;
    items.push(
      <button
        key={number}
        onClick={() => onPageChange(number - 1)}
        className={`px-3 py-1 mx-1 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? "bg-blue-600 text-white shadow-md"
            : "bg-[#181818] text-[#a7a7a7] hover:bg-[#282828] hover:text-white border border-transparent hover:border-[#3e3e3e]"
        }`}
      >
        {number}
      </button>,
    );
  }

  return (
    <div className="flex justify-center items-center mt-10 space-x-2">
      {/* Nút về trang đầu */}
      <button
        disabled={currentPage === 0}
        onClick={() => onPageChange(0)}
        className="px-3 py-1 rounded-md text-sm font-medium bg-[#181818] text-[#a7a7a7] hover:bg-[#282828] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-[#3e3e3e]"
      >
        &laquo;
      </button>

      {/* Nút lùi 1 trang */}
      <button
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1 rounded-md text-sm font-medium bg-[#181818] text-[#a7a7a7] hover:bg-[#282828] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-[#3e3e3e]"
      >
        &lsaquo;
      </button>

      {/* Danh sách số trang */}
      {items}

      {/* Nút tiến 1 trang */}
      <button
        disabled={currentPage === totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1 rounded-md text-sm font-medium bg-[#181818] text-[#a7a7a7] hover:bg-[#282828] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-[#3e3e3e]"
      >
        &rsaquo;
      </button>

      {/* Nút đến trang cuối */}
      <button
        disabled={currentPage === totalPages - 1}
        onClick={() => onPageChange(totalPages - 1)}
        className="px-3 py-1 rounded-md text-sm font-medium bg-[#181818] text-[#a7a7a7] hover:bg-[#282828] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-[#3e3e3e]"
      >
        &raquo;
      </button>
    </div>
  );
}
