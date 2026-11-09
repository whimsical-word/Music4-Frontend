/**
 * Tiện ích kiểm tra và ràng buộc dữ liệu tải lên (File & Form Validation)
 * Ngăn chặn người dùng cố tình thay đổi input type / accept trong F12 hoặc gửi file giả mạo / vượt dung lượng.
 */

export const MAX_AUDIO_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;  // 5MB

export const ALLOWED_AUDIO_EXTENSIONS = ["mp3", "wav"];
export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];

/**
 * Kiểm tra file âm thanh (Audio)
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateAudioFile = (file) => {
  if (!file) {
    return { valid: false, error: "Vui lòng chọn file âm thanh!" };
  }

  if (file.size === 0) {
    return { valid: false, error: `File "${file.name}" rỗng (0 bytes), vui lòng chọn file hợp lệ!` };
  }

  if (file.size > MAX_AUDIO_BYTES) {
    const currentMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File âm thanh "${file.name}" (${currentMB}MB) vượt quá dung lượng tối đa cho phép là 50MB!`,
    };
  }

  const ext = (file.name || "").split(".").pop().toLowerCase();
  if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File "${file.name}" không hợp lệ! Hệ thống chỉ chấp nhận file nhạc định dạng .mp3 hoặc .wav.`,
    };
  }

  if (file.type && !file.type.startsWith("audio/") && file.type !== "application/octet-stream") {
    return {
      valid: false,
      error: `Tệp "${file.name}" không phải định dạng âm thanh chuẩn!`,
    };
  }

  return { valid: true };
};

/**
 * Kiểm tra file hình ảnh (Image)
 * @param {File} file
 * @param {number} maxMB
 * @param {string} fieldName
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateImageFile = (file, maxMB = 5, fieldName = "Ảnh bìa") => {
  if (!file) {
    return { valid: false, error: `Vui lòng chọn ${fieldName.toLowerCase()}!` };
  }

  if (file.size === 0) {
    return { valid: false, error: `${fieldName} rỗng (0 bytes), vui lòng chọn file hợp lệ!` };
  }

  const maxBytes = maxMB * 1024 * 1024;
  if (file.size > maxBytes) {
    const currentMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `${fieldName} (${currentMB}MB) vượt quá dung lượng tối đa cho phép là ${maxMB}MB!`,
    };
  }

  const ext = (file.name || "").split(".").pop().toLowerCase();
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `${fieldName} không hợp lệ! Chỉ chấp nhận định dạng .jpg, .jpeg, .png, .webp, .gif.`,
    };
  }

  if (file.type && !file.type.startsWith("image/") && file.type !== "application/octet-stream") {
    return {
      valid: false,
      error: `${fieldName} không phải định dạng hình ảnh chuẩn!`,
    };
  }

  return { valid: true };
};

/**
 * Trích xuất thông báo lỗi rõ ràng từ phản hồi của Backend
 * @param {any} error
 * @param {string} defaultMessage
 * @returns {string}
 */
export const getApiErrorMessage = (error, defaultMessage = "Đã xảy ra lỗi, vui lòng thử lại sau!") => {
  if (!error) return defaultMessage;

  if (error.response && error.response.data) {
    const data = error.response.data;

    // 1. Dạng { errors: { field1: "lỗi 1", field2: "lỗi 2" } }
    if (data.errors && typeof data.errors === "object") {
      const messages = Object.values(data.errors).filter(Boolean);
      if (messages.length > 0) return messages.join(" | ");
    }

    // 2. Dạng object thuần chứa field-errors mà không có message
    if (typeof data === "object" && !data.message) {
      const messages = Object.values(data).filter((v) => typeof v === "string");
      if (messages.length > 0) return messages.join(" | ");
    }

    // 3. Dạng { message: "..." }
    if (data.message && typeof data.message === "string") {
      // Nếu message chứa chuỗi JSON lồng nhau (e.g. từ Feign client)
      const jsonMatch = data.message.match(/"message"\s*:\s*"([^"]+)"/);
      if (jsonMatch && jsonMatch[1]) {
        return jsonMatch[1];
      }
      return data.message;
    }

    if (typeof data === "string") return data;
  }

  if (error.message && typeof error.message === "string") {
    return error.message;
  }

  return defaultMessage;
};
