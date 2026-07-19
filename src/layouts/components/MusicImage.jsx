import React from 'react';

// Cấu hình URL gốc từ S3 bucket của bạn
const S3_BASE_URL = "https://music4-v3-storage-kenz.s3.ap-southeast-1.amazonaws.com/";

const MusicImage = ({ src, type = 'track', className = '', alt = 'Music Art', style = {} }) => {

    // Hàm xử lý logic đường dẫn ảnh
    const getImageUrl = () => {
        if (!src || src === 'null') {
            return type === 'artist'
                ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"
                : "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop";
        }

        if (src.startsWith('http')) {
            return src;
        }

        return `${S3_BASE_URL}${src}`;
    };

    const fallbackImage = type === 'artist'
        ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"
        : "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop";

    // 🔥 CHUẨN HÓA KÍCH THƯỚC VÀ BO GÓC THEO TYPE ĐỂ TÁI SỬ DỤNG SẠCH SẼ
    const getTypeClasses = () => {
        switch (type) {
            case 'artist':
                return 'rounded-full';
            case 'album':
                return 'rounded-md w-full h-full max-w-[160px] max-h-[160px] md:max-w-[168px] md:max-h-[168px]';
            case 'track':
            default:
                return 'rounded-md w-full h-full';
        }
    };

    return (
        <img
            src={getImageUrl()}
            alt={alt}
            className={`aspect-square object-cover ${getTypeClasses()} ${className}`}
            style={style}
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImage;
            }}
        />
    );
};

export default MusicImage;