// File: script.js (Phiên bản cập nhật)
// =================================================================
// | PHẦN 1: ĐỊNH NGHĨA HÀM GỌI API (GIỮ NGUYÊN)                  |
// =================================================================

/**
 * Gửi yêu cầu đến API của Google Gemini.
 * @param {string} prompt - Câu lệnh prompt để gửi đến AI.
 * @returns {Promise<object>} - Đối tượng JSON trả về từ API.
 */
async function getRecommendation(prompt) {
  // API Key của bạn. Quan trọng: Giữ bí mật và không chia sẻ công khai.
  // Môi trường thực thi Canvas sẽ tự động chèn khóa hợp lệ.
  const apiKey = ""; // Chèn API Key của bạn vào đây nếu chạy độc lập

  if (apiKey === "") {
    const aiResponseContainer = document.getElementById('ai-response');
    if(aiResponseContainer) {
        aiResponseContainer.innerHTML = `<p class="text-red-600 font-bold">Lỗi cấu hình: API Key chưa được cung cấp.</p><p class="text-gray-700 mt-2">Vui lòng thêm khóa API của Google AI vào file <strong>script.js</strong> và thử lại.</p>`;
        document.getElementById('loading-spinner').classList.add('hidden');
    }
    return;
  }

  const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  
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
// |      PHẦN 2: LOGIC CHÍNH CỦA ỨNG DỤNG (ĐÃ CẬP NHẬT)        |
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
            if (validateChecklist()) {
                checklistSection.classList.add('hidden');
                resultsSection.classList.remove('hidden');
                calculateAndDisplayResults();
                window.scrollTo(0, 0);
            } else {
                // Thay thế alert bằng một thông báo tùy chỉnh
                showCustomAlert("Vui lòng hoàn thành tất cả các câu hỏi trong checklist trước khi xem kết quả.");
            }
        });
    }

    if (backToCtaBtn) {
        backToCtaBtn.addEventListener('click', () => {
            resultsSection.classList.add('hidden');
            checklistSection.classList.remove('hidden');
            window.scrollTo(0, 0);
        });
    }

    // --- PHẦN 1: INFOGRAPHIC & BIỂU ĐỒ ---
    const ctx = document.getElementById('weightingChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Quản lý Doanh nghiệp', 'Quản lý Năng suất', 'Hạ tầng cho CĐS', 'Sản xuất Thông minh'],
                datasets: [{
                    label: 'Phân bổ Trọng số',
                    data: [35, 35, 15, 15],
                    backgroundColor: ['#004AAD', '#0076D1', '#00AEEF', '#80D8F7'],
                    borderColor: '#ffffff',
                    borderWidth: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
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
    
    // --- PHẦN 2: LOGIC CHECKLIST ---
    const checklistData = [
        // Pillar 1: Quản lý Doanh nghiệp
        { id: '1.1', pillar: 1, text: 'Doanh nghiệp có chiến lược phát triển rõ ràng, được văn bản hóa và phổ biến đến các cấp liên quan.' },
        { id: '1.2', pillar: 1, text: 'Lãnh đạo cam kết và tham gia trực tiếp vào việc cải tiến, đổi mới và chuyển đổi số.' },
        { id: '1.3', pillar: 1, text: 'Văn hóa doanh nghiệp khuyến khích sự sáng tạo, học hỏi và sẵn sàng thay đổi.' },
        { id: '1.4', pillar: 1, text: 'Doanh nghiệp có kế hoạch đào tạo và phát triển nguồn nhân lực để đáp ứng yêu cầu mới.' },
        { id: '1.5', pillar: 1, text: 'Hệ thống quản lý tài chính minh bạch, hiệu quả, có ứng dụng công cụ phần mềm.' },
        { id: '1.6', pillar: 1, text: 'Quản lý chuỗi cung ứng được tối ưu hóa, có sự hợp tác chặt chẽ với nhà cung cấp và đối tác.' },
        { id: '1.7', pillar: 1, text: 'Hoạt động marketing và bán hàng có ứng dụng các công cụ số để tiếp cận khách hàng.' },
        { id: '1.8', pillar: 1, text: 'Doanh nghiệp có hệ thống quản lý rủi ro và kế hoạch kinh doanh liên tục (BCP).' },

        // Pillar 2: Quản lý Năng suất
        { id: '2.1', pillar: 2, text: 'Các quy trình hoạt động chính (sản xuất, kinh doanh) được chuẩn hóa và tài liệu hóa.' },
        { id: '2.2', pillar: 2, text: 'Doanh nghiệp đang áp dụng hoặc có kế hoạch áp dụng các Hệ thống quản lý chất lượng (như ISO 9001).' },
        { id: '2.3', pillar: 2, text: 'Các công cụ cải tiến năng suất (như 5S, Kaizen, Lean) được áp dụng một cách có hệ thống.' },
        { id: '2.4', pillar: 2, text: 'Doanh nghiệp có hệ thống đo lường, theo dõi và phân tích các chỉ số hiệu suất chính (KPIs).' },
        { id: '2.5', pillar: 2, text: 'Hoạt động quản lý bảo trì, bảo dưỡng máy móc thiết bị được thực hiện theo kế hoạch.' },
        { id: '2.6', pillar: 2, text: 'Quản lý kho và tồn kho được tối ưu hóa để giảm lãng phí và chi phí.' },
        { id: '2.7', pillar: 2, text: 'Doanh nghiệp có áp dụng các tiêu chuẩn kỹ thuật (TCVN, ISO,...) cho sản phẩm/dịch vụ.' },
        { id: '2.8', pillar: 2, text: 'Quy trình kiểm soát chất lượng sản phẩm/dịch vụ được thực hiện ở các công đoạn quan trọng.' },

        // Pillar 3: Hạ tầng cho CĐS
        { id: '3.1', pillar: 3, text: 'Hệ thống mạng máy tính (LAN, Wifi) ổn định, đáp ứng nhu cầu công việc.' },
        { id: '3.2', pillar: 3, text: 'Doanh nghiệp có sử dụng các phần mềm văn phòng và công cụ làm việc cộng tác hiệu quả.' },
        { id: '3.3', pillar: 3, text: 'Dữ liệu quan trọng của doanh nghiệp được số hóa, lưu trữ và sao lưu một cách an toàn.' },
        { id: '3.4', pillar: 3, text: 'Doanh nghiệp có các biện pháp đảm bảo an toàn thông tin, an ninh mạng cơ bản.' },
        { id: '3.5', pillar: 3, text: 'Tỷ lệ nhân viên được trang bị máy tính và có kỹ năng tin học văn phòng cơ bản ở mức cao.' },

        // Pillar 4: Sản xuất Thông minh
        { id: '4.1', pillar: 4, text: 'Doanh nghiệp có sử dụng phần mềm chuyên ngành để quản lý sản xuất (ví dụ: ERP, MES).' },
        { id: '4.2', pillar: 4, text: 'Một số công đoạn sản xuất có sử dụng các thiết bị tự động hóa, robot.' },
        { id: '4.3', pillar: 4, text: 'Dữ liệu từ máy móc, thiết bị sản xuất được thu thập (thủ công hoặc tự động) để phân tích.' },
        { id: '4.4', pillar: 4, text: 'Doanh nghiệp có nhận thức và đang tìm hiểu về các công nghệ 4.0 (như IoT, Big Data, AI).' },
        { id: '4.5', pillar: 4, text: 'Hệ thống máy móc, thiết bị có khả năng kết nối và trao đổi dữ liệu với nhau hoặc với hệ thống quản lý.' }
    ];

    const checklistForm = document.getElementById('checklist-form');
    let html = '';
    let currentPillar = 0;
    const pillarTitles = [
        "1. Quản lý Doanh nghiệp",
        "2. Quản lý Năng suất",
        "3. Hệ thống hạ tầng cho CĐS",
        "4. Sản xuất Thông minh"
    ];

    checklistData.forEach(item => {
        if (item.pillar !== currentPillar) {
            currentPillar = item.pillar;
            html += `
                <tr>
                    <td colspan="7" class="pillar-header p-3 text-lg">${pillarTitles[currentPillar - 1]}</td>
                </tr>
            `;
        }
        html += `
            <tr class="border-b hover:bg-gray-50">
                <td class="py-3 px-4 text-center">${item.id}</td>
                <td class="py-3 px-4 text-left">${item.text}</td>
                ${[1, 2, 3, 4, 5].map(score => `
                    <td class="py-3 px-4 text-center">
                        <input type="radio" name="score_${item.id}" value="${score}" class="score-radio" required>
                    </td>
                `).join('')}
            </tr>
        `;
    });
    if (checklistForm) {
        checklistForm.querySelector('tbody').innerHTML = html;
    }

    function validateChecklist() {
        for (const item of checklistData) {
            const radios = document.getElementsByName(`score_${item.id}`);
            let checked = false;
            for (const radio of radios) {
                if (radio.checked) {
                    checked = true;
                    break;
                }
            }
            if (!checked) {
                return false;
            }
        }
        return true;
    }

    function showCustomAlert(message) {
        // Tạo một div cho alert
        const alertBox = document.createElement('div');
        alertBox.style.position = 'fixed';
        alertBox.style.top = '20px';
        alertBox.style.left = '50%';
        alertBox.style.transform = 'translateX(-50%)';
        alertBox.style.padding = '15px 25px';
        alertBox.style.backgroundColor = '#f87171'; // red-400
        alertBox.style.color = 'white';
        alertBox.style.borderRadius = '8px';
        alertBox.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        alertBox.style.zIndex = '1000';
        alertBox.style.fontSize = '1rem';
        alertBox.style.fontWeight = '500';
        alertBox.textContent = message;
        
        document.body.appendChild(alertBox);

        // Tự động xóa sau 3 giây
        setTimeout(() => {
            alertBox.remove();
        }, 3000);
    }
    
    // --- PHẦN 3: TÍNH TOÁN VÀ HIỂN THỊ KẾT QUẢ ---
    function getLevel(score) {
        if (score >= 4.2) return { level: 5, name: "Dẫn đầu", color: "bg-blue-600" };
        if (score >= 3.4) return { level: 4, name: "Nâng cao", color: "bg-blue-500" };
        if (score >= 2.6) return { level: 3, name: "Hình thành", color: "bg-sky-500" };
        if (score >= 1.8) return { level: 2, name: "Bắt đầu", color: "bg-yellow-500" };
        return { level: 1, name: "Khởi tạo", color: "bg-red-500" };
    }

    let radarChart;
    function calculateAndDisplayResults() {
        const scores = { 1: [], 2: [], 3: [], 4: [] };
        checklistData.forEach(item => {
            const selectedScore = document.querySelector(`input[name="score_${item.id}"]:checked`);
            if (selectedScore) {
                scores[item.pillar].push(parseInt(selectedScore.value));
            }
        });

        const avgScores = {};
        for (let i = 1; i <= 4; i++) {
            const sum = scores[i].reduce((a, b) => a + b, 0);
            avgScores[`pillar${i}_avg`] = (sum / scores[i].length).toFixed(2);
        }

        const weights = { p1: 0.35, p2: 0.35, p3: 0.15, p4: 0.15 };
        const weightedScores = {
            p1: avgScores.pillar1_avg * weights.p1,
            p2: avgScores.pillar2_avg * weights.p2,
            p3: avgScores.pillar3_avg * weights.p3,
            p4: avgScores.pillar4_avg * weights.p4,
        };

        const totalScore = (weightedScores.p1 + weightedScores.p2 + weightedScores.p3 + weightedScores.p4).toFixed(2);
        const overallLevel = getLevel(totalScore);

        // Hiển thị điểm
        document.getElementById('vipa-score').textContent = totalScore;
        const levelElement = document.getElementById('vipa-level');
        levelElement.textContent = `Cấp ${overallLevel.level}: ${overallLevel.name}`;
        levelElement.className = `text-2xl font-bold px-4 py-2 rounded-lg text-white ${overallLevel.color}`;

        // Cập nhật bảng tóm tắt
        document.getElementById('score-p1').textContent = avgScores.pillar1_avg;
        document.getElementById('score-p2').textContent = avgScores.pillar2_avg;
        document.getElementById('score-p3').textContent = avgScores.pillar3_avg;
        document.getElementById('score-p4').textContent = avgScores.pillar4_avg;

        document.getElementById('weighted-score-p1').textContent = weightedScores.p1.toFixed(2);
        document.getElementById('weighted-score-p2').textContent = weightedScores.p2.toFixed(2);
        document.getElementById('weighted-score-p3').textContent = weightedScores.p3.toFixed(2);
        document.getElementById('weighted-score-p4').textContent = weightedScores.p4.toFixed(2);
        document.getElementById('total-weighted-score').textContent = totalScore;

        // Vẽ biểu đồ radar
        const radarCtx = document.getElementById('resultsRadarChart').getContext('2d');
        if (radarChart) {
            radarChart.destroy();
        }
        radarChart = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['QL Doanh nghiệp', 'QL Năng suất', 'Hạ tầng CĐS', 'Sản xuất TM'],
                datasets: [{
                    label: 'Điểm trung bình',
                    data: [avgScores.pillar1_avg, avgScores.pillar2_avg, avgScores.pillar3_avg, avgScores.pillar4_avg],
                    backgroundColor: 'rgba(0, 118, 209, 0.2)',
                    borderColor: 'rgba(0, 118, 209, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(0, 118, 209, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(0, 118, 209, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 5,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // --- PHẦN 4: TƯƠNG TÁC VỚI AI VÀ MODAL ---
    const getAiBtn = document.getElementById('get-ai-btn');
    const aiModal = document.getElementById('ai-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const aiResponseContainer = document.getElementById('ai-response');

    if (getAiBtn) {
        getAiBtn.addEventListener('click', getAIRecommendations);
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            aiModal.classList.add('hidden');
        });
    }
    
    /**
     * TẠO CÂU LỆNH (PROMPT) NÂNG CAO CHO AI
     * @param {object} avgScores - Đối tượng chứa điểm trung bình của các trụ cột.
     * @returns {string} - Chuỗi prompt hoàn chỉnh để gửi đến AI.
     */
    function createAIPrompt(avgScores) {
        const tcvnStandards = {
            quanLyDoanhNghiep: [
                "TCVN ISO 9001:2015 (Hệ thống quản lý chất lượng - Các yêu cầu)",
                "TCVN ISO 31000:2018 (Quản lý rủi ro - Hướng dẫn)",
                "TCVN ISO 26000:2013 (Hướng dẫn về trách nhiệm xã hội)",
                "TCVN ISO 10015:2008 (Quản lý chất lượng - Hướng dẫn đào tạo)"
            ],
            quanLyNangSuat: [
                "TCVN ISO 19011:2018 (Hướng dẫn đánh giá hệ thống quản lý)",
                "Bộ TCVN 8244 (ISO 3534) (Thống kê học - Từ vựng và ký hiệu)",
                "Bộ TCVN 9602 (ISO 13053) (Phương pháp định lượng trong cải tiến quá trình - 6-sigma)",
                "Bộ TCVN 9945 (ISO 7870) (Biểu đồ kiểm soát)",
                "Các công cụ cải tiến như 5S, Kaizen, Phân tích Sơ đồ chuỗi giá trị (VSM), Chu trình PDCA"
            ]
        };

        const prompt = `
            BẠN LÀ CHUYÊN GIA TƯ VẤN NĂNG SUẤT VÀ CHẤT LƯỢG (P&Q) VỚI HƠN 10 NĂM KINH NGHIỆM TẠI VIỆT NAM.
            
            Bối cảnh: Một doanh nghiệp vừa hoàn thành bảng tự đánh giá mức độ sẵn sàng chuyển đổi số theo phương pháp luận ViPA. Phương pháp này có 4 trụ cột với trọng số như sau:
            - Quản lý Doanh nghiệp: 35%
            - Quản lý Năng suất: 35%
            - Hệ thống hạ tầng cho Chuyển đổi số: 15%
            - Sản xuất Thông minh: 15%
            
            Mục tiêu của doanh nghiệp là xây dựng nền tảng vững chắc về Quản lý Doanh nghiệp và Quản lý Năng suất TRƯỚC KHI đầu tư mạnh vào Chuyển đổi số và Sản xuất thông minh.
            
            Kết quả đánh giá của doanh nghiệp như sau (thang điểm 5):
            - Điểm trung bình trụ cột 1 (Quản lý Doanh nghiệp): ${avgScores.pillar1_avg}
            - Điểm trung bình trụ cột 2 (Quản lý Năng suất): ${avgScores.pillar2_avg}
            - Điểm trung bình trụ cột 3 (Hạ tầng cho CĐS): ${avgScores.pillar3_avg}
            - Điểm trung bình trụ cột 4 (Sản xuất Thông minh): ${avgScores.pillar4_avg}
            
            YÊU CẦU: Dựa trên kết quả trên, hãy đưa ra một lộ trình hành động chi tiết, ưu tiên các giải pháp nền tảng.
            
            ĐỊNH DẠNG ĐẦU RA (sử dụng Markdown):
            1.  **Phân tích tổng quan:** Nhận xét ngắn gọn về điểm mạnh, điểm yếu dựa trên điểm số. Nhấn mạnh tầm quan trọng của 2 trụ cột nền tảng.
            2.  **Lộ trình hành động ưu tiên:** Đề xuất các bước đi cụ thể, tập trung vào các hạng mục có điểm số thấp nhất thuộc 2 trụ cột đầu tiên.
                * **Ưu tiên 1: Cải thiện Quản lý Doanh nghiệp (Điểm: ${avgScores.pillar1_avg})**
                    * Đề xuất các giải pháp cụ thể (vd: xây dựng chiến lược, văn hóa, đào tạo...).
                    * Gợi ý áp dụng các Tiêu chuẩn Quốc gia Việt Nam (TCVN) liên quan. Tham khảo: ${tcvnStandards.quanLyDoanhNghiep.join(', ')}.
                * **Ưu tiên 2: Nâng cao Quản lý Năng suất (Điểm: ${avgScores.pillar2_avg})**
                    * Đề xuất các giải pháp cụ thể (vd: chuẩn hóa quy trình, áp dụng công cụ cải tiến...).
                    * Gợi ý áp dụng các TCVN và công cụ P&Q liên quan. Tham khảo: ${tcvnStandards.quanLyNangSuat.join(', ')}.
            3.  **Bước tiếp theo (Sau khi nền tảng vững chắc):**
                * Nêu ngắn gọn các định hướng về Hạ tầng cho CĐS và Sản xuất Thông minh như những bước phát triển kế tiếp, chỉ nên thực hiện khi 2 trụ cột đầu đã được cải thiện đáng kể.
            
            LƯU Ý: Lời khuyên phải thực tế, dễ áp dụng cho doanh nghiệp vừa và nhỏ tại Việt Nam. Sử dụng ngôn ngữ chuyên nghiệp, rõ ràng.
        `;
        return prompt.trim();
    }

    /**
     * Lấy dữ liệu, tạo prompt, gọi API và hiển thị kết quả.
     */
    async function getAIRecommendations() {
        aiModal.classList.remove('hidden');
        loadingSpinner.classList.remove('hidden');
        aiResponseContainer.innerHTML = '';

        const scores = { 1: [], 2: [], 3: [], 4: [] };
        checklistData.forEach(item => {
            const selectedScore = document.querySelector(`input[name="score_${item.id}"]:checked`);
            if (selectedScore) {
                scores[item.pillar].push(parseInt(selectedScore.value));
            }
        });

        const avgScores = {};
        for (let i = 1; i <= 4; i++) {
            const sum = scores[i].reduce((a, b) => a + b, 0);
            avgScores[`pillar${i}_avg`] = (sum / scores[i].length).toFixed(2);
        }

        // Tạo prompt nâng cao
        const prompt = createAIPrompt(avgScores);
        console.log("Generated Prompt:", prompt); // Để debug

        try {
            const result = await getRecommendation(prompt);
            if (result && result.candidates && result.candidates[0].content.parts[0].text) {
                const aiText = result.candidates[0].content.parts[0].text;
                // Sử dụng thư viện 'marked' để chuyển đổi Markdown sang HTML
                aiResponseContainer.innerHTML = marked.parse(aiText);
            } else {
                throw new Error("Không nhận được phản hồi hợp lệ từ AI.");
            }
        } catch (error) {
            aiResponseContainer.innerHTML = `<p class="text-red-600 font-bold">Đã xảy ra lỗi khi kết nối với AI.</p><p class="text-gray-600 mt-2">Chi tiết: ${error.message}. Vui lòng kiểm tra lại API Key và kết nối mạng.</p>`;
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    }
    
    // --- PHẦN 5: XUẤT DỮ LIỆU ---
    const exportCsvBtn = document.getElementById('export-csv-btn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportDataToCsv);
    }

    function collectDataForExport() {
        const data = {
            checklist: [],
            summary: {}
        };

        // Thu thập dữ liệu checklist
        checklistData.forEach(item => {
            const selectedScore = document.querySelector(`input[name="score_${item.id}"]:checked`);
            data.checklist.push({
                id: item.id,
                pillar: item.pillar,
                text: item.text,
                score: selectedScore ? selectedScore.value : '0',
            });
        });

        // Thu thập dữ liệu tóm tắt
        data.summary.pillar1_avg = document.getElementById('score-p1').textContent;
        data.summary.pillar2_avg = document.getElementById('score-p2').textContent;
        data.summary.pillar3_avg = document.getElementById('score-p3').textContent;
        data.summary.pillar4_avg = document.getElementById('score-p4').textContent;
        data.summary.total_score = document.getElementById('vipa-score').textContent;
        data.summary.level = document.getElementById('vipa-level').textContent;

        return data;
    }

    function exportDataToCsv() {
        const data = collectDataForExport();
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // \uFEFF for BOM to support UTF-8 in Excel

        // Header cho checklist
        csvContent += "\"BẢNG CHI TIẾT ĐÁNH GIÁ\"\\r\\n";
        const headers = `\"ID\",\"Trụ cột\",\"Nội dung\",\"Điểm\"\\r\\n`;
        csvContent += headers;

        // Dữ liệu checklist
        data.checklist.forEach(item => {
            let rowData = [
                `\"${item.id}\"`,
                `\"${pillarTitles[item.pillar - 1]}\"`,
                `\"${item.text.replace(/\"/g, '\"\"')}\"`,
                `\"${item.score || '0'}\"`
            ];
            csvContent += rowData.join(",") + "\\r\\n";
        });

        // Dữ liệu tóm tắt
        csvContent += "\\r\\n\\r\\nBẢNG TỔNG HỢP KẾT QUẢ\\r\\n";
        const summaryHeaders = `\"Trụ cột\",\"Điểm Trung bình\",\"Trọng số (%)\",\"Điểm theo Trọng số\"\\r\\n`;
        csvContent += summaryHeaders;
        csvContent += `\"1. Quản lý Doanh nghiệp\",\"${data.summary.pillar1_avg}\",\"35%\",\"${(parseFloat(data.summary.pillar1_avg) * 0.35).toFixed(2)}\"\\r\\n`;
        csvContent += `\"2. Quản lý Năng suất\",\"${data.summary.pillar2_avg}\",\"35%\",\"${(parseFloat(data.summary.pillar2_avg) * 0.35).toFixed(2)}\"\\r\\n`;
        csvContent += `\"3. Hệ thống hạ tầng cho CĐS\",\"${data.summary.pillar3_avg}\",\"15%\",\"${(parseFloat(data.summary.pillar3_avg) * 0.15).toFixed(2)}\"\\r\\n`;
        csvContent += `\"4. Sản xuất Thông minh\",\"${data.summary.pillar4_avg}\",\"15%\",\"${(parseFloat(data.summary.pillar4_avg) * 0.15).toFixed(2)}\"\\r\\n`;
        csvContent += `,,,TỔNG ĐIỂM ViPA,\"${data.summary.total_score}\"\\r\\n`;
        csvContent += `,,,CẤP ĐỘ,\"${data.summary.level.replace(/\"/g, '\"\"')}\"\\r\\n`;

        // Tạo link và tải file
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "ket_qua_danh_gia_ViPA.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
