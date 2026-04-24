# 📊 Phân tích & Tối ưu hóa Vòng quay Tồn kho Bán lẻ (Retail Inventory Optimization & Forecasting)

## I. Bối cảnh (Context)
*   **Mục tiêu chung:** Tối ưu hóa chi phí lưu kho, giảm thiểu tình trạng đọng vốn và tránh việc cháy hàng (Out-of-stock) trong các mùa cao điểm. Dự án này nhằm mục đích nâng cao hiệu quả vận hành chuỗi cung ứng và tối đa hóa lợi nhuận kinh doanh.
*   **Mục tiêu cụ thể:** Sử dụng dữ liệu bán hàng và tồn kho năm 2025 để xác định các nhóm sản phẩm có vòng quay tồn kho chậm (Slow-moving items), đồng thời dự báo sức mua cho các tháng tiếp theo (3 tháng tới) nhằm hỗ trợ quyết định nhập hàng.
*   **Vấn đề / Bối cảnh (5W1H):**
    *   *Tại sao có vấn đề (Why):* Trong Quý 4/2025 (mùa lễ hội), nền tảng bán lẻ nội bộ ghi nhận chi phí lưu kho tăng 25%, đọng vốn hơn 2 tỷ VNĐ. Nguyên nhân chính là do nhập dư các mã hàng không thiết yếu và quản lý tồn kho chưa hiệu quả, dẫn đến hàng tồn kho lâu, chiếm dụng không gian và vốn lưu động. Đồng thời, 3 mã hàng "hot" lại bị đứt gãy nguồn cung, gây mất doanh thu và giảm trải nghiệm khách hàng.
    *   *Xảy ra ở đâu / Lúc nào (Where/When):* Vấn đề này xảy ra trên nền tảng bán lẻ nội bộ, tập trung vào dữ liệu bán hàng và tồn kho của năm 2025, đặc biệt nghiêm trọng trong Quý 4/2025.
*   **Đối tượng & Vai trò (Who):**
    *   **Data Analyst (Người thực hiện):** Chịu trách nhiệm xử lý dữ liệu sales và tồn kho, tính toán chỉ số Inventory Turnover Ratio, phân cụm sản phẩm dựa trên tốc độ luân chuyển và xây dựng mô hình dự báo.
    *   **Phòng Supply Chain & Purchasing (Người dùng cuối):** Sử dụng các kết quả phân tích và dashboard để điều chỉnh kế hoạch nhập hàng cho quý tới, tối ưu hóa lượng tồn kho và nguồn cung ứng.
    *   **Ban Giám đốc (Stakeholders):** Dựa vào các insight và đề xuất để duyệt ngân sách nhập hàng, quản lý dòng tiền và đưa ra các quyết định chiến lược về chuỗi cung ứng và sản phẩm.

## II. Thuật ngữ & Kiến thức nghiệp vụ (Domain Knowledge)
*   **Inventory Turnover Ratio (Vòng quay tồn kho):** Chỉ số đo lường số lần tồn kho được bán và thay thế trong một khoảng thời gian nhất định. Chỉ số cao thường thể hiện hiệu quả quản lý tồn kho tốt.
*   **Slow-moving items (Hàng tồn kho chậm luân chuyển):** Các sản phẩm có tốc độ bán chậm, dẫn đến thời gian tồn kho dài, chiếm dụng vốn và không gian lưu trữ.
*   **Out-of-stock (Cháy hàng):** Tình trạng hết hàng tồn kho khi nhu cầu phát sinh, dẫn đến mất doanh thu và sự hài lòng của khách hàng.
*   **Cost of Goods Sold (COGS - Giá vốn hàng bán):** Chi phí trực tiếp để sản xuất hàng hóa hoặc dịch vụ được bán bởi doanh nghiệp, không bao gồm chi phí hoạt động.
*   **Dead Stock (Hàng tồn kho chết):** Các sản phẩm không còn bán được hoặc có khả năng bán được rất thấp, thường do lỗi thời, hư hỏng hoặc không còn nhu cầu.
*   **FMCG (Fast-Moving Consumer Goods - Hàng tiêu dùng nhanh):** Các sản phẩm được bán nhanh chóng với chi phí tương đối thấp, ví dụ: đồ ăn, thức uống, mỹ phẩm.

## III. Nội dung chính

### 1. Tổng quan Dữ liệu & Mục đích phân tích
*   **Dữ liệu:**
    *   `sales_data_2025.csv`: Dữ liệu giao dịch bán hàng chi tiết trong năm 2025.
    *   `inventory.fact_sales`: Bảng dữ liệu sự kiện bán hàng từ hệ thống cơ sở dữ liệu nội bộ.
    *   `inventory.dim_stock_daily`: Bảng dữ liệu về mức tồn kho hàng ngày từ hệ thống cơ sở dữ liệu nội bộ.
    *   Dữ liệu được thu thập từ nền tảng bán lẻ nội bộ, tập trung vào các giao dịch và trạng thái tồn kho trong năm 2025.
*   **Mục đích:**
    1.  Xác định và phân loại các sản phẩm có vòng quay tồn kho chậm (`Slow-Moving / Dead Stock`) để đưa ra giải pháp giảm thiểu chi phí lưu kho và đọng vốn.
    2.  Dự báo sức mua và nhu cầu cho các nhóm sản phẩm chiến lược trong 3 tháng tới nhằm tối ưu hóa kế hoạch nhập hàng và tránh tình trạng cháy hàng.

### 2. Từ điển dữ liệu (Data Dictionary)
| **Tên cột (Column Name)** | **Mô tả (Description)** | **Kiểu dữ liệu** | **Ghi chú / Quy ước (Encoding/Notes)** |
| --- | --- | --- | --- |
| `product_id` | Mã định danh duy nhất của sản phẩm | `INT` / `VARCHAR` | Primary Key |
| `category` | Danh mục sản phẩm (ví dụ: Electronics, FMCG, Clothing) | `VARCHAR` | Dùng để phân tích nhóm hàng |
| `unit_cost` | Giá vốn nhập hàng của một đơn vị sản phẩm | `FLOAT` | Đơn vị: VNĐ. Sử dụng để tính COGS. |
| `stock_level` | Mức tồn kho cuối ngày của sản phẩm | `INT` | Được sử dụng để tính tồn kho trung bình. |
| `price` | Giá bán của sản phẩm tại thời điểm giao dịch | `FLOAT` | Đơn vị: VNĐ. |
| `quantity` | Số lượng sản phẩm bán ra trong một giao dịch | `INT` | |
| `discount_applied` | Mức giảm giá áp dụng cho giao dịch | `FLOAT` | Là tỷ lệ phần trăm (ví dụ: 0.1 cho 10%). Nếu không ghi nhận, mặc định là 0. |
| `order_date` | Ngày phát sinh giao dịch bán hàng | `DATETIME` | |
| `status` | Trạng thái của đơn hàng (ví dụ: 'Completed', 'Pending', 'Cancelled') | `VARCHAR` | Chỉ tính các đơn hàng 'Completed' cho COGS. |

### 3. Feature Engineering dựa trên Domain Knowledge
*   **`discount_applied` (imputation):** Điền giá trị `0` cho các giá trị `NULL` trong cột `discount_applied`.
    *   *Lý do:* Dựa trên kiến thức nghiệp vụ, các giá trị `NULL` trong cột này phát sinh do lỗi mạng của hệ thống cũ, và nếu không có ghi nhận nào về giảm giá thì có nghĩa là sản phẩm được bán nguyên giá. Điều này giúp giữ toàn vẹn dữ liệu và tránh ảnh hưởng đến các phân tích liên quan đến chính sách giá.
*   **`quantity_adj` (clipping outliers):** Điều chỉnh giá trị của cột `quantity` bằng cách kẹp biên các giá trị ngoại lệ dựa trên phương pháp IQR.
    *   *Lý do:* Phát hiện các đơn hàng mua sỉ với số lượng rất lớn (>1000) có thể gây nhiễu cho các phân tích liên quan đến mô hình bán lẻ thông thường. Việc kẹp biên thay vì xóa bỏ giúp giữ lại tổng doanh thu và không làm mất đi các giao dịch lớn, trong khi vẫn giảm thiểu tác động tiêu cực của outliers đến các chỉ số thống kê trung bình hoặc mô hình dự báo tập trung vào khách hàng cá nhân.
*   **`inventory_velocity_segment`:** Phân loại sản phẩm thành 'Fast-Moving', 'Normal', và 'Slow-Moving / Dead Stock' dựa trên tỷ lệ vòng quay tồn kho (COGS / Avg. Inventory).
    *   *Lý do:* Phân loại này trực tiếp hỗ trợ Phòng Supply Chain và Purchasing trong việc đưa ra các quyết định chiến lược về nhập hàng, khuyến mãi và thanh lý hàng tồn, phù hợp với từng nhóm sản phẩm cụ thể.

### 4. Quy trình Phân tích (Analytics Workflow)

#### Bước 1: Nạp & Tiền xử lý dữ liệu
*   **Công cụ:** Python (`pandas`, `numpy`)
*   **Chi tiết công việc:**
    *   **Nạp dữ liệu:** Đọc dữ liệu từ file `sales_data_2025.csv` vào DataFrame `df_sales`.
    *   **Xử lý Missing Values:**
        *   Cột `discount_applied` có khoảng 5% giá trị `NULL`. Các giá trị `NULL` này được điền bằng `0` (không giảm giá) dựa trên kiến thức nghiệp vụ rằng hệ thống cũ không ghi nhận giảm giá khi có lỗi mạng.
    *   **Xử lý Outliers:**
        *   Áp dụng phương pháp IQR (Interquartile Range) để xác định và kẹp biên (Clipping) các giá trị ngoại lệ trong cột `quantity`. Các đơn hàng với số lượng > 1000 (đơn sỉ) được kẹp về ngưỡng trên của IQR để giảm thiểu nhiễu trong phân tích bán lẻ, đồng thời bảo toàn tổng doanh thu.

#### Bước 2: Phân tích khám phá (EDA)
*   **Công cụ:** Python (`matplotlib`, `seaborn`)
*   **Chi tiết công việc:**
    *   **Phân tích tương quan:** Tính toán ma trận tương quan giữa các biến số quan trọng như `price`, `quantity_adj` (số lượng đã điều chỉnh), và `discount_applied`.
    *   **Trực quan hóa tương quan:** Vẽ heatmap để hiển thị trực quan mức độ tương quan giữa các biến.
    *   **Initial Insights:** Phát hiện rằng mức giảm giá có tương quan dương mạnh với số lượng bán của nhóm hàng điện tử, nhưng lại không tác động nhiều đến nhóm hàng FMCG. Điều này gợi ý rằng chiến lược giảm giá cần được tùy chỉnh cho từng danh mục sản phẩm.

#### Bước 3: Data Modeling & Transformation
*   **Công cụ:** SQL (MySQL/PostgreSQL)
*   **Chi tiết công việc & Kỹ thuật áp dụng:**
    *   **Tính toán COGS (Cost of Goods Sold):** Sử dụng Common Table Expression (CTE) `MonthlySales` để tính tổng giá vốn hàng bán cho mỗi sản phẩm từ bảng `inventory.fact_sales` (chỉ tính các đơn hàng 'Completed').
    *   **Tính toán Tồn kho Trung bình:** Sử dụng CTE `AvgInventory` để tính mức tồn kho trung bình cho mỗi sản phẩm từ bảng `inventory.dim_stock_daily`. Tồn kho trung bình được tính là `(MAX(stock_level) + MIN(stock_level)) / 2.0`.
    *   **Tính toán Vòng quay Tồn kho & Phân loại:** Kết hợp hai CTE trên thông qua `product_id` để tính `Inventory Turnover Ratio` (`cogs / avg_stock_qty`). Sau đó, áp dụng câu lệnh `CASE WHEN` để phân loại sản phẩm thành các nhóm `inventory_velocity_segment`:
        *   `Fast-Moving`: Vòng quay > 6
        *   `Normal`: Vòng quay từ 2 đến 6
        *   `Slow-Moving / Dead Stock`: Vòng quay <= 2 hoặc tồn kho trung bình bằng 0
    *   **Tối ưu hóa hiệu năng:** Việc sử dụng CTE giúp cấu trúc truy vấn rõ ràng, dễ đọc, và tối ưu hóa hiệu năng bằng cách tính toán các giá trị trung gian một lần trước khi kết hợp, tránh tính toán lặp lại.

#### Bước 4: Trực quan hóa dữ liệu
*   **Công cụ:** Power BI
*   **Chi tiết công việc:**
    *   **Bố cục (Layout Strategy):** Dashboard được thiết kế theo nguyên tắc "Tổng quát -> Chi tiết" và "Trái -> Phải", "Nguyên nhân -> Kết quả". Bảng tổng quan về chi phí lưu kho và giá trị đọng vốn được đặt ở vị trí dễ nhìn, sau đó là các biểu đồ phân tích sâu hơn về từng nhóm sản phẩm và xu hướng.
    *   **Lựa chọn Biểu đồ (Chart Selection):**
        *   **Biểu đồ cột/thanh:** Để so sánh vòng quay tồn kho giữa các danh mục sản phẩm hoặc từng sản phẩm cụ thể, giúp dễ dàng nhận diện "Slow-Moving Items".
        *   **Biểu đồ đường:** Để hiển thị xu hướng chi phí lưu kho, doanh thu, hoặc mức tồn kho trung bình theo thời gian, đặc biệt là trong các mùa cao điểm.
        *   **Biểu đồ phân tán (Scatter Plot):** Để khám phá mối quan hệ giữa chi phí tồn kho và số lượng tồn kho của từng sản phẩm, hoặc giữa mức giảm giá và số lượng bán.
        *   **Bảng/Ma trận (Table/Matrix):** Cung cấp chi tiết danh sách các sản phẩm thuộc nhóm "Slow-Moving / Dead Stock" cùng với các chỉ số COGS, tồn kho trung bình, để Phòng Supply Chain có thể truy xuất thông tin cụ thể.
        *   **KPI Cards/Gauge Charts:** Hiển thị các chỉ số tổng quan như tổng chi phí lưu kho, tổng giá trị vốn đọng, hoặc tỷ lệ cháy hàng.

### 5. Kết luận & Đề xuất (Conclusions & Recommendations)
*   **Kết luận (Key Findings):**
    *   Sự gia tăng chi phí lưu kho 25% và đọng vốn hơn 2 tỷ VNĐ trong Q4/2025 là hậu quả trực tiếp của việc quản lý tồn kho chưa hiệu quả, đặc biệt là sự hiện diện của một lượng lớn các sản phẩm có vòng quay chậm (slow-moving items).
    *   Đã xác định được các sản phẩm cụ thể thuộc nhóm "Slow-Moving / Dead Stock" thông qua chỉ số vòng quay tồn kho thấp, cho thấy cần có hành động can thiệp kịp thời.
    *   Phân tích tương quan chỉ ra rằng các chiến dịch giảm giá có hiệu quả kích cầu khác nhau đáng kể giữa các danh mục sản phẩm (ví dụ: hiệu quả cao với Điện tử, thấp với FMCG), yêu cầu một chiến lược giá linh hoạt.
    *   Tình trạng cháy hàng đối với 3 mã sản phẩm "hot" đã chỉ ra sự thiếu hụt trong dự báo nhu cầu và lập kế hoạch nhập hàng cho các mặt hàng có tốc độ bán nhanh.
*   **Đề xuất hành động (Actionable Recommendations):**
    *   **Cho Phòng Supply Chain & Purchasing:**
        *   **Điều chỉnh kế hoạch nhập hàng:** Ngay lập tức giảm lượng nhập hoặc ngừng nhập các mã hàng thuộc nhóm "Slow-Moving / Dead Stock" dựa trên kết quả phân tích.
        *   **Ưu tiên nhập hàng chiến lược:** Tăng cường theo dõi và nhập đủ số lượng các mã hàng "Fast-Moving" hoặc "hot items" theo dự báo nhu cầu trong 3 tháng tới để tránh tình trạng cháy hàng.
        *   **Chiến lược thanh lý hàng tồn:** Phối hợp với phòng Marketing để lên kế hoạch các chương trình khuyến mãi, giảm giá đặc biệt cho các mặt hàng tồn kho chậm, đặc biệt là nhóm hàng điện tử nơi giảm giá có tác động rõ rệt.
    *   **Cho Ban Giám đốc:**
        *   **Duyệt ngân sách tối ưu:** Xem xét và phê duyệt ngân sách nhập hàng dựa trên các đề xuất đã được phân tích, nhằm tối ưu hóa dòng tiền và giảm chi phí lưu kho.
        *   **Đầu tư công nghệ:** Cân nhắc đầu tư vào các hệ thống dự báo nhu cầu tiên tiến hơn (ví dụ: tích hợp AI/ML) để cải thiện độ chính xác trong dự báo và quản lý tồn kho.
        *   **Xem xét chính sách giá:** Đánh giá lại chính sách giá và khuyến mãi dựa trên hiệu quả đã được phân tích cho từng danh mục sản phẩm.
    *   **Cho Phòng IT/Operations:**
        *   **Cải thiện hệ thống ghi nhận dữ liệu:** Khắc phục lỗi hệ thống cũ để đảm bảo dữ liệu `discount_applied` được ghi nhận đầy đủ và chính xác, tránh các giá trị `NULL` trong tương lai.
