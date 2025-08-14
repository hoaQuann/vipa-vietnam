// File: script.js (Phiên bản gộp và đã sửa lỗi)
// =================================================================
// | PHẦN 1: ĐỊNH NGHĨA HÀM GỌI API (từ get-recommendation.js) |
// =================================================================

/**
 * Hàm này gửi một yêu cầu đến API của Google Gemini.
 * Nó được thiết kế để chạy an toàn trên phía client (trình duyệt).
 * @param {string} prompt - Câu lệnh prompt để gửi đến AI.
 * @returns {Promise<object>} - Đối tượng JSON trả về từ API của Google.
 */
async function getRecommendation(prompt) {
    // =================================================================================
    // |   QUAN TRỌNG: BẠN CẦN THÊM API KEY CỦA MÌNH VÀO ĐÂY                           |
    // | 1. Truy cập https://aistudio.google.com/app/apikey để tạo một API key mới.   |
    // | 2. Sao chép API key đó và dán vào giữa hai dấu ngoặc kép bên dưới.           |
    // |    Ví dụ: const apiKey = "AIzaSy...YOUR_KEY_HERE...";                         |
    // =================================================================================
    const apiKey = "AIzaSyAr74Tw1T942FzgjbhcLqvvbz1DA2VOjYs"; // <-- THAY API KEY CỦA BẠN VÀO ĐÂY
  
    // Kiểm tra xem người dùng đã thêm API key chưa
    if (apiKey === "" || apiKey === "YOUR_API_KEY_HERE") {
      // Hiển thị lỗi ngay trên giao diện modal thay vì chỉ ở console
      const aiResponseContainer = document.getElementById('ai-response');
      if(aiResponseContainer) {
          aiResponseContainer.innerHTML = `<p class="text-red-600 font-bold">Lỗi cấu hình: API Key chưa được cung cấp.</p><p class="text-gray-700 mt-2">Vui lòng làm theo hướng dẫn trong file <strong>script.js</strong> để thêm khóa API của Google AI và thử lại.</p>`;
          document.getElementById('loading-spinner').classList.add('hidden');
      }
      // Dừng hàm tại đây
      return;
    }
  
    // ĐÃ SỬA LỖI: Nhúng thẳng tên model vào URL để tránh lỗi "modelName is not defined".
    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{ parts: [{ "text": prompt }] }]
    };
  
    const fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    };
  
    try {
      const response = await fetch(googleApiUrl, fetchOptions);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi từ Google API:", errorData);
        throw new Error(errorData.error?.message || `Lỗi HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi thực hiện yêu cầu đến Google AI:', error);
      // Ném lại lỗi để hàm getAIRecommendations có thể bắt được
      throw error;
    }
  }
  
  
  // =================================================================
  // |      PHẦN 2: LOGIC CHÍNH CỦA ỨNG DỤNG (script.js gốc)      |
  // =================================================================
  
  // Sử dụng 'load' để đảm bảo TẤT CẢ tài nguyên (script, ảnh, css) đã tải xong.
  window.addEventListener('load', () => {
      
      // --- PHẦN 0: KHAI BÁO BIẾN VÀ ĐIỀU HƯỚNG ---
      const infographicSection = document.getElementById('infographic-section');
      const checklistSection = document.getElementById('checklist-section');
      const resultsSection = document.getElementById('results-section');
      
      const startChecklistBtn = document.getElementById('start-checklist-btn');
      const viewResultsBtn = document.getElementById('view-results-btn');
      const backToCtaBtn = document.getElementById('back-to-checklist-btn');
  
      // Nút điều hướng chính
      if (startChecklistBtn) {
          startChecklistBtn.addEventListener('click', () => {
              infographicSection.classList.add('hidden');
              checklistSection.classList.remove('hidden');
              window.scrollTo(0, 0);
          });
      }
  
      if (viewResultsBtn) {
          viewResultsBtn.addEventListener('click', () => {
              checklistSection.classList.add('hidden');
              resultsSection.classList.remove('hidden');
              window.scrollTo(0, 0);
          });
      }
  
      if (backToCtaBtn) {
          backToCtaBtn.addEventListener('click', () => {
              resultsSection.classList.add('hidden');
              checklistSection.classList.remove('hidden');
              window.scrollTo(0, 0);
          });
      }
  
  
      // --- PHẦN 1: LOGIC TRANG GIỚI THIỆU (INFOGRAPHIC) ---
      const ctx = document.getElementById('weightingChart');
      if (ctx) {
          new Chart(ctx.getContext('2d'), {
              type: 'doughnut',
              data: {
                  labels: ['Sản xuất Thông minh', 'Quản lý Năng suất', 'Hệ thống hạ tầng cho CĐS', 'Quản lý Doanh nghiệp'],
                  datasets: [{
                      data: [15, 35, 15, 35],
                      backgroundColor: ['#004AAD', '#0076D1', '#00AEEF', '#80D8F7'],
                      borderColor: '#ffffff',
                      borderWidth: 4,
                      hoverOffset: 8
                  }]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                      legend: { display: false },
                      tooltip: {
                          callbacks: {
                              label: function(context) {
                                  let label = context.label || '';
                                  if (label) {
                                      label += ': ';
                                  }
                                  if (context.parsed !== null) {
                                      label += context.parsed + '%';
                                  }
                                  return label;
                              }
                          }
                      }
                  },
                  cutout: '60%'
              }
          });
      }
  
      // --- PHẦN 2: LOGIC TRANG CHECKLIST & KẾT QUẢ ---
      
      document.querySelectorAll('.score-radio').forEach(radio => {
          radio.addEventListener('change', handleRadioChange);
      });
  
      const getRecommendationsBtn = document.getElementById('get-recommendations-btn');
      if(getRecommendationsBtn) getRecommendationsBtn.addEventListener('click', getAIRecommendations);
      
      const closeModalBtn = document.getElementById('close-modal-btn');
      if(closeModalBtn) closeModalBtn.addEventListener('click', () => {
          document.getElementById('ai-modal').classList.add('hidden');
      });
  
      const exportBtn = document.getElementById('exportBtn');
      if(exportBtn) exportBtn.addEventListener('click', exportCSV);
  
      // Thêm sự kiện cho nút xuất Word
      const exportWordBtn = document.getElementById('exportWordBtn');
      if(exportWordBtn) exportWordBtn.addEventListener('click', exportWord);
  
      updateAllTotals();
  });
  
  
  // --- CÁC HÀM CHO CHECKLIST ---
  
  function handleRadioChange(event) {
      const radio = event.target;
      const indicatorId = radio.dataset.indicator;
      const score = radio.value;
      const scoreDisplay = document.getElementById(`score-display-${indicatorId}`);
      if (scoreDisplay) scoreDisplay.textContent = score;
      updateAllTotals();
  }
  
  function updateAllTotals() {
      const pillarScores = { '1': [], '2': [], '3': [], '4': [] };
  
      document.querySelectorAll('.score-radio:checked').forEach(radio => {
          const indicatorId = radio.dataset.indicator;
          const pillar = indicatorId.split('.')[0];
          const score = parseInt(radio.value);
          if (pillar && pillarScores[pillar]) {
              pillarScores[pillar].push(score);
          }
      });
  
      const pillarAvgs = {};
      let totalVipaScore = 0;
      const weights = { 1: 0.25, 2: 0.25, 3: 0.25, 4: 0.25 };
  
      for (let i = 1; i <= 4; i++) {
          const indicatorCount = document.querySelectorAll(`input[name^="score_${i}."][type="radio"]`).length / 5;
          const scores = pillarScores[i];
          const sum = scores.reduce((a, b) => a + b, 0);
          const avg = indicatorCount > 0 ? sum / indicatorCount : 0;
          
          pillarAvgs[i] = avg;
  
          const pillarAvgEl = document.getElementById(`pillar-avg-${i}`);
          if(pillarAvgEl) pillarAvgEl.textContent = avg.toFixed(2);
          
          const summaryPillarAvgEl = document.getElementById(`summary-pillar-${i}-avg`);
          if(summaryPillarAvgEl) summaryPillarAvgEl.textContent = avg.toFixed(2);
          
          const weightedScore = avg * weights[i];
          const weightedScoreEl = document.getElementById(`summary-pillar-${i}-weighted`);
          if(weightedScoreEl) weightedScoreEl.textContent = weightedScore.toFixed(2);
          
          totalVipaScore += weightedScore;
      }
      
      const totalVipaScoreEl = document.getElementById('total-vipa-score');
      if(totalVipaScoreEl) totalVipaScoreEl.textContent = totalVipaScore.toFixed(2);
  
      let rank = 'Chưa xác định';
      const viewResultsBtn = document.getElementById('view-results-btn');
      
      if (document.querySelectorAll('.score-radio:checked').length > 0) {
          if (viewResultsBtn) viewResultsBtn.classList.remove('hidden');
          if (totalVipaScore >= 1.0 && totalVipaScore <= 1.79) rank = 'Cấp 1: Khởi tạo';
          else if (totalVipaScore >= 1.8 && totalVipaScore <= 2.59) rank = 'Cấp 2: Bắt đầu';
          else if (totalVipaScore >= 2.6 && totalVipaScore <= 3.39) rank = 'Cấp 3: Hình thành';
          else if (totalVipaScore >= 3.4 && totalVipaScore <= 4.19) rank = 'Cấp 4: Nâng cao';
          else if (totalVipaScore >= 4.2 && totalVipaScore <= 5.0) rank = 'Cấp 5: Dẫn đầu';
      } else {
          if (viewResultsBtn) viewResultsBtn.classList.add('hidden');
      }
      const finalRankEl = document.getElementById('final-rank');
      if(finalRankEl) finalRankEl.textContent = rank;
  }
  
  function collectFullAssessmentData() {
      const data = {
          generalInfo: {
              tenDoanhNghiep: document.getElementById('info-ten-dn').value,
              diaChi: document.getElementById('info-dia-chi').value,
              nguoiLienHe: document.getElementById('info-nguoi-lien-he').value,
              sanPhamChuChot: document.getElementById('info-san-pham-chu-chot').value, // Đổi tên trường
              ngayDanhGia: document.getElementById('info-ngay-danh-gia').value
          },
          detailedScores: [],
          summary: {
              pillar1_avg: document.getElementById('summary-pillar-1-avg').textContent,
              pillar2_avg: document.getElementById('summary-pillar-2-avg').textContent,
              pillar3_avg: document.getElementById('summary-pillar-3-avg').textContent,
              pillar4_avg: document.getElementById('summary-pillar-4-avg').textContent,
              totalVipaScore: document.getElementById('total-vipa-score').textContent,
              finalRank: document.getElementById('final-rank').textContent,
          }
      };
      document.querySelectorAll('.indicator-block').forEach(row => {
          const indicatorTitleEl = row.querySelector('b');
          const noteInput = row.querySelector('.note-input');
          const indicatorId = noteInput.dataset.indicator;
          const selectedRadio = document.querySelector(`input[name="score_${indicatorId}"]:checked`);
          if (indicatorTitleEl) {
              data.detailedScores.push({
                  indicator: indicatorTitleEl.innerText.trim(),
                  score: selectedRadio ? selectedRadio.value : null,
                  selectionText: selectedRadio ? selectedRadio.nextElementSibling.innerText.trim() : null,
                  note: noteInput ? noteInput.value : ''
              });
          }
      });
      return data;
  }
  
  async function getAIRecommendations() {
      const aiModal = document.getElementById('ai-modal');
      const loadingSpinner = document.getElementById('loading-spinner');
      const aiResponseContainer = document.getElementById('ai-response');
      
      aiModal.classList.remove('hidden');
      loadingSpinner.classList.remove('hidden');
      aiResponseContainer.innerHTML = '';
  
      const assessmentData = collectFullAssessmentData();
      const summaryScores = assessmentData.summary;
      // Prompt mới: đưa ngành nghề/sản phẩm chủ chốt vào và yêu cầu AI gợi ý phù hợp đặc thù ngành
      let prompt = `Bạn là một chuyên gia tư vấn chiến lược kinh doanh cho các doanh nghiệp tại tỉnh Kiên Giang, Việt Nam. Một doanh nghiệp có tên "${assessmentData.generalInfo.tenDoanhNghiep || 'Một doanh nghiệp'}" vừa hoàn thành bài đánh giá mức độ sẵn sàng chuyển đổi số (ViPA) và có kết quả như sau:\n`;
      prompt += `- Sản phẩm/dịch vụ chủ chốt: ${assessmentData.generalInfo.sanPhamChuChot || '[Chưa nhập]'}\n`;
      prompt += `- Tổng điểm ViPA: ${assessmentData.summary.totalVipaScore} - Mức độ: ${assessmentData.summary.finalRank}\n`;
      prompt += `- Điểm các trụ cột:\n`;
      prompt += `  - Quản lý Doanh nghiệp: ${assessmentData.summary.pillar1_avg}\n`;
      prompt += `  - Quản lý Năng suất: ${assessmentData.summary.pillar2_avg}\n`;
      prompt += `  - Hệ thống hạ tầng cho CĐS: ${assessmentData.summary.pillar3_avg}\n`;
      prompt += `  - Sản xuất Thông minh: ${assessmentData.summary.pillar4_avg}\n`;
      
      const lowScoringCriteria = assessmentData.detailedScores
          .filter(c => c.score && parseFloat(c.score) < 3)
          .sort((a, b) => parseFloat(a.score) - parseFloat(b.score))
          .slice(0, 5);
  
      if (lowScoringCriteria.length > 0) {
          prompt += `- Các lĩnh vực cần cải thiện nhất (điểm thấp nhất):\n`;
          lowScoringCriteria.forEach(item => {
              prompt += `  - ${item.indicator} (Điểm: ${item.score}): ${item.selectionText}\n`;
          });
      }
  
      prompt += `\nDựa trên kết quả này và đặc thù ngành nghề (sản phẩm/dịch vụ chủ chốt: ${assessmentData.generalInfo.sanPhamChuChot || '[Chưa nhập]'}), hãy cung cấp một kế hoạch hành động chiến lược cho doanh nghiệp này.\n`;
      prompt += `Kế hoạch cần bao gồm:\n`;
      prompt += `1.  **Phân tích tổng quan:** Tóm tắt ngắn gọn điểm mạnh, điểm yếu dựa trên điểm số và đặc thù ngành nghề.\n`;
      prompt += `2.  **Lộ trình hành động ưu tiên:** Đề xuất 3-5 bước hành động cụ thể, sắp xếp theo thứ tự ưu tiên. Lưu ý: tập trung nòng cốt ở 2 trụ cột là Quản lý Doanh nghiệp và Quản lý Năng suất (Hạ tầng cho CĐS và Sản xuất Thông minh là đích đến cuối cùng, không quá tập trung) và phù hợp với ngành nghề/sản phẩm chủ chốt. Với mỗi bước, giải thích rõ 'Tại sao' (lợi ích) và 'Làm thế nào' (các bước triển khai cụ thể).\n`;
      prompt += `3.  **Gợi ý đặc thù ngành:** Đưa ra các gợi ý, giải pháp, ví dụ thực tiễn phù hợp với ngành nghề/sản phẩm chủ chốt của doanh nghiệp.\n\n`;
      prompt += `Vui lòng trình bày câu trả lời bằng tiếng Việt, sử dụng định dạng Markdown để dễ đọc, bao gồm tiêu đề, in đậm và danh sách.`;
  
      try {
          const result = await getRecommendation(prompt);
          if (result) {
              let text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Không nhận được phản hồi hợp lệ từ AI.";
              aiResponseContainer.innerHTML = marked.parse(text);
              // Lưu lại nội dung trả lời AI để xuất file Word và CSV
              window.lastAIRecommendationText = text;
          }
      } catch (error) {
          console.error("Lỗi khi gọi AI:", error);
          aiResponseContainer.innerHTML = `<p class="text-red-500">Đã xảy ra lỗi: ${error.message}. Vui lòng kiểm tra lại và thử lại.</p>`;
      } finally {
          loadingSpinner.classList.add('hidden');
      }
  }
  
  function exportCSV() {
      let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
      const data = collectFullAssessmentData();
      const generalInfo = [
          `"Tên Doanh nghiệp:","${data.generalInfo.tenDoanhNghiep}"`,
          `"Địa chỉ:","${data.generalInfo.diaChi}"`,
          `"Người liên hệ:","${data.generalInfo.nguoiLienHe}"`,
          `"Sản phẩm/dịch vụ chủ chốt:","${data.generalInfo.sanPhamChuChot}"`,
          `"Ngày thực hiện bộ tiêu chí:","${data.generalInfo.ngayDanhGia}"`
      ];
      csvContent += generalInfo.join("\r\n") + "\r\n\r\n";
      const tableHeaders = `"Chỉ số","Mức độ lựa chọn","Điểm","Bằng chứng / Ghi chú"\r\n`;
      csvContent += tableHeaders;
      data.detailedScores.forEach(item => {
          let rowData = [
              `"${item.indicator}"`,
              `"${(item.selectionText || '').replace(/"/g, '""')}"`,
              `"${item.score || '0'}"`,
              `"${(item.note || '').replace(/"/g, '""')}"`
          ];
          csvContent += rowData.join(",") + "\r\n";
      });
      csvContent += "\r\n\r\nBẢNG TỔNG HỢP KẾT QUẢ\r\n";
      const summaryHeaders = `"Trụ cột","Điểm Trung bình","Trọng số (%)","Điểm theo Trọng số"\r\n`;
      csvContent += summaryHeaders;
      csvContent += `"1. Quản lý Doanh nghiệp","${data.summary.pillar1_avg}","25%","${(parseFloat(data.summary.pillar1_avg) * 0.25).toFixed(2)}"\r\n`;
      csvContent += `"2. Quản lý Năng suất","${data.summary.pillar2_avg}","25%","${(parseFloat(data.summary.pillar2_avg) * 0.25).toFixed(2)}"\r\n`;
      csvContent += `"3. Hệ thống hạ tầng cho CĐS","${data.summary.pillar3_avg}","25%","${(parseFloat(data.summary.pillar3_avg) * 0.25).toFixed(2)}"\r\n`;
      csvContent += `"4. Sản xuất Thông minh","${data.summary.pillar4_avg}","25%","${(parseFloat(data.summary.pillar4_avg) * 0.25).toFixed(2)}"\r\n`;
      csvContent += `,,,TỔNG ĐIỂM ViPA,"${data.summary.totalVipaScore}"\r\n`;
      csvContent += `,,,KẾT LUẬN,"${data.summary.finalRank}"\r\n`;
      
      if (window.lastAIRecommendationText) {
          const cleanedAiText = window.lastAIRecommendationText.replace(/"/g, '""').replace(/\n/g, '\r\n');
          csvContent += `\r\n\r\n"LỘ TRÌNH ĐỀ XUẤT TỪ AI"\r\n`;
          csvContent += `"${cleanedAiText}"\r\n`;
      }
  
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      const fileName = data.generalInfo.tenDoanhNghiep ? data.generalInfo.tenDoanhNghiep.replace(/ /g, '_') : 'Khong_ten';
      link.setAttribute("download", `VIPA_Checklist_${fileName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }
  
  function exportWord() {
      if (typeof htmlDocx === 'undefined' || typeof saveAs === 'undefined') {
          console.error("Lỗi: Thư viện html-docx-js hoặc FileSaver.js chưa được tải xong.");
          alert("Không thể xuất file Word do thư viện bị lỗi. Vui lòng tải lại trang và thử lại.");
          return;
      }

      try {
          const data = collectFullAssessmentData();

          // PHẦN A: Thông tin chung
          let html = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Báo cáo ViPA</title></head><body>`;
          html += `<h1>BÁO CÁO ĐÁNH GIÁ MỨC ĐỘ SẴN SÀNG CHUYỂN ĐỔI SỐ (ViPA)</h1>`;
          html += `<h2>PHẦN A: THÔNG TIN CHUNG</h2>`;
          html += `<table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;"><tbody>`;
          html += `<tr><td style="width: 30%;"><b>Tên Doanh nghiệp</b></td><td>${data.generalInfo.tenDoanhNghiep || ''}</td></tr>`;
          html += `<tr><td><b>Địa chỉ</b></td><td>${data.generalInfo.diaChi || ''}</td></tr>`;
          html += `<tr><td><b>Người liên hệ</b></td><td>${data.generalInfo.nguoiLienHe || ''}</td></tr>`;
          html += `<tr><td><b>Sản phẩm/dịch vụ chủ chốt</b></td><td>${data.generalInfo.sanPhamChuChot || ''}</td></tr>`;
          html += `<tr><td><b>Ngày thực hiện bộ tiêu chí</b></td><td>${data.generalInfo.ngayDanhGia || ''}</td></tr>`;
          html += `</tbody></table>`;

          // PHẦN B: Bảng chấm điểm chi tiết
          html += `<h2>PHẦN B: BẢNG CHẤM ĐIỂM CHI TIẾT</h2>`;
          html += `<table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;"><thead><tr><th style="width: 25%;">Chỉ số</th><th style="width: 45%;">Mức độ lựa chọn</th><th style="width: 10%;">Điểm</th><th>Bằng chứng/Ghi chú</th></tr></thead><tbody>`;
          const indicatorLabels = [];
          const indicatorScores = [];
          data.detailedScores.forEach((item, idx) => {
              html += `<tr><td><b>${item.indicator || ''}</b></td><td>${item.selectionText || ''}</td><td style="text-align:center;">${item.score || '0'}</td><td>${item.note || ''}</td></tr>`;
              indicatorLabels.push(item.indicator || `Câu ${idx+1}`);
              indicatorScores.push(Number(item.score) || 0);
          });
          html += `</tbody></table>`;

          // PHẦN C: Biểu đồ điểm các chỉ số (16 câu hỏi)
          html += `<h2>PHẦN C: BIỂU ĐỒ ĐIỂM CÁC CHỈ SỐ (16 CÂU HỎI)</h2>`;
          // Tạo canvas tạm để vẽ biểu đồ
          let chartImg = '';
          let tempCanvas = document.createElement('canvas');
          tempCanvas.width = 900; tempCanvas.height = 400;
          document.body.appendChild(tempCanvas);
          let chart = new Chart(tempCanvas.getContext('2d'), {
              type: 'bar',
              data: {
                  labels: indicatorLabels,
                  datasets: [{
                      label: 'Điểm từng chỉ số',
                      data: indicatorScores,
                      backgroundColor: '#0076D1',
                      borderColor: '#004AAD',
                      borderWidth: 2
                  }]
              },
              options: {
                  responsive: false,
                  plugins: {
                      legend: { display: false },
                      title: { display: true, text: 'Biểu đồ điểm các chỉ số (16 câu hỏi)' }
                  },
                  scales: {
                      y: { beginAtZero: true, max: 5, title: { display: true, text: 'Điểm' } },
                      x: { title: { display: true, text: 'Chỉ số' }, ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 } }
                  }
              }
          });
          // Đợi Chart.js vẽ xong (bắt buộc với một số trình duyệt)
          setTimeout(() => {
              try {
                  chartImg = `<p style="text-align:center;"><img src="${tempCanvas.toDataURL('image/png')}" alt="Biểu đồ điểm chỉ số" style="width:800px; height:auto;"/></p>`;
              } catch (e) {
                  chartImg = '<p><i>[Lỗi: Không thể hiển thị biểu đồ chỉ số]</i></p>';
              }
              chart.destroy();
              tempCanvas.remove();

              // Tiếp tục xuất các phần còn lại
              let htmlRest = '';
              htmlRest += chartImg;

              // PHẦN D: Bảng tổng hợp kết quả
              htmlRest += `<h2>PHẦN D: BẢNG TỔNG HỢP KẾT QUẢ</h2>`;
              htmlRest += `<table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;"><thead><tr><th>Trụ cột</th><th>Điểm Trung bình</th><th>Trọng số (%)</th><th>Điểm theo Trọng số</th></tr></thead><tbody>`;
              htmlRest += `<tr><td>1. Quản lý Doanh nghiệp</td><td style="text-align:center;">${data.summary.pillar1_avg}</td><td style="text-align:center;">25%</td><td style="text-align:center;">${(parseFloat(data.summary.pillar1_avg) * 0.25).toFixed(2)}</td></tr>`;
              htmlRest += `<tr><td>2. Quản lý Năng suất</td><td style="text-align:center;">${data.summary.pillar2_avg}</td><td style="text-align:center;">25%</td><td style="text-align:center;">${(parseFloat(data.summary.pillar2_avg) * 0.25).toFixed(2)}</td></tr>`;
              htmlRest += `<tr><td>3. Hệ thống hạ tầng cho CĐS</td><td style="text-align:center;">${data.summary.pillar3_avg}</td><td style="text-align:center;">25%</td><td style="text-align:center;">${(parseFloat(data.summary.pillar3_avg) * 0.25).toFixed(2)}</td></tr>`;
              htmlRest += `<tr><td>4. Sản xuất Thông minh</td><td style="text-align:center;">${data.summary.pillar4_avg}</td><td style="text-align:center;">25%</td><td style="text-align:center;">${(parseFloat(data.summary.pillar4_avg) * 0.25).toFixed(2)}</td></tr>`;
              htmlRest += `<tr><td colspan='3' style='text-align:right;'><b>TỔNG ĐIỂM ViPA</b></td><td style="text-align:center;"><b>${data.summary.totalVipaScore}</b></td></tr>`;
              htmlRest += `<tr><td colspan='3' style='text-align:right;'><b>KẾT LUẬN MỨC ĐỘ SẴN SÀNG</b></td><td style="text-align:center;"><b>${data.summary.finalRank}</b></td></tr>`;
              htmlRest += `</tbody></table>`;

              // PHẦN E: Lộ trình AI
              if (window.lastAIRecommendationText) {
                  htmlRest += `<h2>PHẦN E: LỘ TRÌNH HÀNH ĐỘNG DO AI ĐỀ XUẤT</h2>`;
                  const aiHtmlContent = window.marked ? marked.parse(window.lastAIRecommendationText) : `<p>${window.lastAIRecommendationText.replace(/\n/g, '<br>')}</p>`;
                  htmlRest += `<div>${aiHtmlContent}</div>`;
              }
              htmlRest += `</body></html>`;

              // Kết hợp và xuất file Word
              var blob = htmlDocx.asBlob(html + htmlRest, {orientation: 'portrait'});
              const fileName = data.generalInfo.tenDoanhNghiep ? data.generalInfo.tenDoanhNghiep.replace(/ /g, '_') : 'Khong_ten';
              saveAs(blob, `VIPA_Report_${fileName}.docx`);
          }, 500); // Đợi 500ms để Chart.js vẽ xong
      } catch (error) {
          console.error("Đã xảy ra lỗi nghiêm trọng khi tạo file Word:", error);
          alert("Rất tiếc, đã có lỗi xảy ra trong quá trình tạo báo cáo. Vui lòng thử lại.");
      }
  }
  