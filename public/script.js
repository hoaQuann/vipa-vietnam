// File: script.js (Phiên bản gộp)
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
  // LƯU Ý QUAN TRỌNG: API Key được để trống. 
  // Môi trường thực thi (Canvas) sẽ tự động chèn một khóa hợp lệ và an toàn vào đây khi chạy.
  const apiKey = "AIzaSyAr74Tw1T942FzgjbhcLqvvbz1DA2VOjYs"; 

  // URL của API Gemini, sử dụng model 'gemini-pro'.
  const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  
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
    throw error;
  }
}


// =================================================================
// |      PHẦN 2: LOGIC CHÍNH CỦA ỨNG DỤNG (script.js gốc)      |
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    
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
                    data: [35, 25, 25, 15],
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
    const weights = { 1: 0.15, 2: 0.25, 3: 0.25, 4: 0.35 };

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
            chuyenGiaDanhGia: document.getElementById('info-chuyen-gia').value,
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
    let prompt = `Bạn là một chuyên gia tư vấn chiến lược kinh doanh cho các doanh nghiệp tại tỉnh Kiên Giang, Việt Nam. Một doanh nghiệp có tên "${assessmentData.generalInfo.tenDoanhNghiep || 'Một doanh nghiệp'}" vừa hoàn thành bài đánh giá mức độ sẵn sàng chuyển đổi số (ViPA) và có kết quả như sau:\n`;
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

    prompt += `\nDựa trên kết quả này và bối cảnh kinh tế biển, du lịch, nông nghiệp công nghệ cao của Kiên Giang, hãy cung cấp một kế hoạch hành động chiến lược cho doanh nghiệp này. Kế hoạch cần bao gồm:\n`;
    prompt += `1.  **Phân tích tổng quan:** Tóm tắt ngắn gọn điểm mạnh, điểm yếu dựa trên điểm số.\n`;
    prompt += `2.  **Lộ trình hành động ưu tiên:** Đề xuất 3-5 bước hành động cụ thể, sắp xếp theo thứ tự ưu tiên. Với mỗi bước, giải thích rõ 'Tại sao' (lợi ích) và 'Làm thế nào' (các bước triển khai cụ thể).\n`;
    prompt += `3.  **Lưu ý đặc thù:** Đưa ra các gợi ý có tính đến đặc thù của Kiên Giang (ví dụ: ứng dụng truy xuất nguồn gốc cho thủy sản, giải pháp du lịch thông minh, logistics cảng biển...). \n\n`;
    prompt += `Vui lòng trình bày câu trả lời bằng tiếng Việt, sử dụng định dạng Markdown để dễ đọc, bao gồm tiêu đề, in đậm và danh sách.`;

    try {
        // Vì hàm getRecommendation đã được định nghĩa ở trên cùng file này,
        // nó chắc chắn sẽ tồn tại ở đây.
        const result = await getRecommendation(prompt); 
        let text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Không nhận được phản hồi hợp lệ từ AI.";
        aiResponseContainer.innerHTML = marked.parse(text);
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
        `"Chuyên gia đánh giá:","${data.generalInfo.chuyenGiaDanhGia}"`,
        `"Ngày đánh giá:","${data.generalInfo.ngayDanhGia}"`
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
    csvContent += `"1. Quản lý Doanh nghiệp","${data.summary.pillar1_avg}","15%","${(parseFloat(data.summary.pillar1_avg) * 0.15).toFixed(2)}"\r\n`;
    csvContent += `"2. Quản lý Năng suất","${data.summary.pillar2_avg}","25%","${(parseFloat(data.summary.pillar2_avg) * 0.25).toFixed(2)}"\r\n`;
    csvContent += `"3. Hệ thống hạ tầng cho CĐS","${data.summary.pillar3_avg}","25%","${(parseFloat(data.summary.pillar3_avg) * 0.25).toFixed(2)}"\r\n`;
    csvContent += `"4. Sản xuất Thông minh","${data.summary.pillar4_avg}","35%","${(parseFloat(data.summary.pillar4_avg) * 0.35).toFixed(2)}"\r\n`;
    csvContent += `,,,TỔNG ĐIỂM ViPA,"${data.summary.totalVipaScore}"\r\n`;
    csvContent += `,,,KẾT LUẬN,"${data.summary.finalRank}"\r\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = data.generalInfo.tenDoanhNghiep ? data.generalInfo.tenDoanhNghiep.replace(/ /g, '_') : 'Khong_ten';
    link.setAttribute("download", `VIPA_Checklist_${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
