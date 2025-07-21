// File: get-recommendation.js
// Nhiệm vụ: Chứa hàm để gọi API của Google AI trực tiếp từ trình duyệt.

/**
 * Hàm này gửi một yêu cầu đến API của Google Gemini.
 * Nó được thiết kế để chạy an toàn trên phía client (trình duyệt).
 * @param {string} prompt - Câu lệnh prompt để gửi đến AI.
 * @returns {Promise<object>} - Đối tượng JSON trả về từ API của Google.
 */
async function getRecommendation(prompt) {
  // LƯU Ý QUAN TRỌNG: API Key được để trống. 
  // Môi trường thực thi (Canvas) sẽ tự động chèn một khóa hợp lệ và an toàn vào đây khi chạy.
  // Bạn không cần phải thay đổi gì ở dòng này.
  const apiKey = "AIzaSyAr74Tw1T942FzgjbhcLqvvbz1DA2VOjYs"; 

  // URL của API Gemini, sử dụng model 'gemini-pro'.
  const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  
  // Dữ liệu gửi đi (payload) theo định dạng yêu cầu của API.
  const payload = {
    contents: [{ parts: [{ "text": prompt }] }]
  };

  // Cấu hình cho yêu cầu fetch.
  const fetchOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };

  try {
    // Thực hiện yêu cầu fetch đến API.
    const response = await fetch(googleApiUrl, fetchOptions);

    // Nếu yêu cầu không thành công (ví dụ: lỗi mạng, lỗi từ server),
    // phân tích lỗi và ném ra để xử lý ở nơi gọi hàm.
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ Google API:", errorData);
      throw new Error(errorData.error?.message || `Lỗi HTTP: ${response.status}`);
    }

    // Nếu thành công, trả về dữ liệu JSON.
    return await response.json();
  } catch (error) {
    console.error('Lỗi khi thực hiện yêu cầu đến Google AI:', error);
    // Ném lại lỗi để hàm gọi nó (trong script.js) có thể bắt và hiển thị thông báo cho người dùng.
    throw error;
  }
}
// Đã xóa các dòng import/export không cần thiết để script hoạt động đúng.
