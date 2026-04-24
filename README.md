# 📊 Retail Inventory Optimization & Forecasting

## I. Context
*   **Overall Objective:** Optimize inventory costs, reduce capital tie-up, and prevent stock-outs during peak seasons.
*   **Specific Goal:** Identify slow-moving product categories and forecast purchasing power for the next 3 months based on 2025 data.
*   **Context / Problem Statement (5W1H):**
    *   *Why is there a problem:* In Q4 2025 (festive season), the internal retail platform recorded a 25% increase in storage costs, tying up over 2 billion VND in capital due to overstocking non-essential items. Simultaneously, three "hot" items experienced supply chain disruptions and stock-outs.
    *   *Where / When:* The problem occurred within the internal retail platform during Q4 2025. The analysis utilizes sales and inventory data from the entire year 2025.
*   **Stakeholders & Roles (Who):**
    *   *Data Analyst (You):* Processed sales data, calculated Inventory Turnover Ratio, performed product segmentation, and identified slow-moving items.
    *   *Supply Chain & Purchasing Department (End-users):* Will utilize the analytical dashboard and findings to adjust quarterly purchasing plans and inventory strategies.
    *   *Board of Directors (Stakeholders):* Will review the optimized budget and inventory cash flow proposals for strategic approval.

## II. Domain Knowledge & Terminology
*   **Inventory Turnover Ratio:** A financial metric that measures how many times inventory has been sold or used in a specific period. It is calculated as Cost of Goods Sold (COGS) divided by Average Inventory. A high ratio generally indicates strong sales, while a low ratio suggests overstocking or weak sales.
*   **Slow-Moving Items:** Products that have low sales velocity and remain in inventory for an extended period, leading to increased holding costs and capital tie-up.
*   **Cost of Goods Sold (COGS):** The direct costs attributable to the production of the goods sold by a company. This includes the cost of the materials used in creating the good along with the direct labor costs used to produce the good.
*   **Out-of-stock:** A situation where a product is unavailable for sale, leading to missed sales opportunities and potential customer dissatisfaction.
*   **Capital Tie-up:** The portion of a company's financial capital that is invested in assets (like inventory) and is not readily available for other purposes, often associated with holding excessive or slow-moving stock.

## III. Main Content

### 1. Data Overview & Analytical Objectives
*   **Dataset:** The analysis primarily uses `sales_data_2025.csv` (for sales transactions, price, quantity, discount), `inventory.fact_sales` (for sales facts, including COGS components), and `inventory.dim_stock_daily` (for daily stock levels). All data pertains to the year 2025.
*   **Objectives:** Answer the following key questions:
    1.  What are the key factors contributing to increased storage costs and capital tie-up observed in Q4 2025?
    2.  Which specific product categories are identified as "slow-moving" or "dead stock" based on their inventory turnover ratio?
    3.  How do discount strategies correlate with sales quantities across different product categories (e.g., Electronics vs. FMCG)?
    4.  Based on 2025 trends, what is the forecasted purchasing power and recommended inventory levels for the next 3 months to prevent stock-outs of "hot" items and reduce overstocking?

### 2. Data Dictionary
| **Column Name** | **Description** | **Data Type** | **Encoding / Notes** |
| :---------------- | :---------------------------------------------- | :------------ | :------------------------------------------------------------------------------------------------- |
| `product_id` | Unique identifier for each product. | String | Primary Key |
| `category` | Product category (e.g., Electronics, FMCG, Clothing). | String | Categorical |
| `unit_cost` | The cost of goods when purchased by the retailer (in VND). | Numeric | |
| `stock_level` | End-of-day inventory count for a specific product. | Numeric | |
| `order_date` | Date of the sales transaction. | Date | From `inventory.fact_sales` |
| `quantity` | Number of units sold in a transaction. | Numeric | |
| `status` | Status of the sales order (e.g., 'Completed'). | String | From `inventory.fact_sales` |
| `price` | Selling price of the product per unit. | Numeric | From `df_sales` |
| `discount_applied` | Amount of discount applied to the transaction. | Numeric | 0 if no discount or not recorded. |
| `cogs` | Cost of Goods Sold for a product. | Numeric | Derived from `quantity * unit_cost`. |
| `avg_stock_qty` | Average stock level of a product over a period. | Numeric | Derived from `(MAX(stock_level) + MIN(stock_level)) / 2.0`. |

### 3. Feature Engineering based on Domain Knowledge
*   **`quantity_adj`:** Created from the original `quantity` column by applying an IQR-based clipping method to cap outlier values (e.g., large wholesale orders > 1000 units). *Reason:* This adjustment ensures that the retail-focused analysis is not skewed by infrequent, large-volume transactions, while retaining overall revenue figures.
*   **`inventory_velocity_segment`:** A categorical feature (e.g., 'Fast-Moving', 'Normal', 'Slow-Moving / Dead Stock') derived from the Inventory Turnover Ratio (`cogs / avg_stock_qty`). *Reason:* This segmentation directly addresses the project's objective of identifying and classifying products based on their sales speed, providing actionable insights for inventory management.

### 4. Analytics Workflow

#### Step 1: Data Loading & Pre-processing
*   **Tools:** Python (`pandas`, `numpy`)
*   **Details:**
    *   **Data Loading:** The `sales_data_2025.csv` file was loaded into a pandas DataFrame.
    *   **Missing Value Handling:** The `discount_applied` column, which had 5% null values due to historical system errors (e.g., network issues during recording), was imputed with `0`. This decision was based on domain knowledge that unrecorded discounts imply the product was sold at full price.
    *   **Outlier Treatment:** Outliers in the `quantity` column, specifically large wholesale orders (quantities > 1000) that could distort retail sales patterns, were identified using the Interquartile Range (IQR) method. Instead of removal, these outliers were handled by `clipping` (capping) them at the upper bound (`Q3 + 1.5 * IQR`) to retain their contribution to total revenue while normalizing the distribution for retail analysis (`quantity_adj`).

#### Step 2: Exploratory Data Analysis (EDA)
*   **Tools:** Python (`matplotlib`, `seaborn`)
*   **Details:**
    *   **Correlation Analysis:** A correlation heatmap was generated to visualize the relationships between `price`, `quantity_adj`, and `discount_applied`.
    *   **Initial Insights:** The EDA revealed an initial insight: `discount_applied` showed a strong positive correlation with `quantity_adj` for products in the 'Electronics' category, suggesting discounts effectively drive sales in this segment. However, for 'FMCG' items, the impact of discounts on sales quantity was minimal.

#### Step 3: Data Modeling & Transformation
*   **Tools:** SQL (e.g., MySQL, PostgreSQL, or similar relational database)
*   **Details & Techniques:**
    *   **Common Table Expressions (CTEs):** Two CTEs, `MonthlySales` and `AvgInventory`, were constructed to calculate total Cost of Goods Sold (COGS) and average stock levels (`avg_stock_qty`) per product, respectively. This modular approach enhances query readability and optimizes performance by pre-calculating aggregates.
    *   **Inventory Turnover Ratio Calculation:** The main query joined these CTEs to calculate the `inventory_velocity_segment` using the formula `COGS / Average Inventory`.
    *   **Categorization based on Domain Knowledge:** A `CASE` statement was applied to categorize products into 'Fast-Moving' (ITR > 6), 'Normal' (ITR between 2 and 6), and 'Slow-Moving / Dead Stock' (ITR <= 2) based on industry best practices and business context.
    *   **Performance Optimization:** Using `NULLIF(a.avg_stock_qty, 0)` prevented division by zero errors, ensuring robust calculation.

#### Step 4: Data Visualization
*   **Tools:** Power BI (Assumed for comprehensive dashboard creation)
*   **Details:**
    *   **Layout Strategy:** The dashboard will be structured following a General to Specific flow (e.g., overall inventory performance to specific product issues), Left to Right (e.g., historical trends to current status), and Cause to Effect (e.g., high inventory leading to increased costs). Key performance indicators (KPIs) will be prominent.
    *   **Chart Selection:**
        *   **Bar/Column Charts:** To display Inventory Turnover Ratio by `category` and `inventory_velocity_segment` to quickly identify slow-moving product groups.
        *   **Line Charts:** To illustrate trends in `stock_level`, `sales quantity`, and `COGS` over time, especially during peak seasons in 2025.
        *   **Donut/Pie Charts:** To show the proportion of capital tied up by different `inventory_velocity_segment`s and product `category`s.
        *   **Scatter Plots/Bubble Charts:** To visualize the correlation between `discount_applied` and `quantity_adj` across different `category`s, allowing interactive exploration of pricing strategies.
        *   **Table/Matrix Visuals:** For detailed product-level data (e.g., `product_id`, `unit_cost`, `stock_level`, `inventory_velocity_segment`) to support granular decision-making.

### 5. Conclusions & Actionable Recommendations
*   **Key Findings:**
    *   The 25% increase in storage costs and over 2 billion VND in capital tie-up in Q4 2025 were directly linked to significant overstocking of non-essential items, categorized as 'Slow-Moving / Dead Stock'.
    *   Conversely, the analysis identified specific "hot" items that experienced stock-outs during peak seasons, indicating a mismatch between demand and supply planning.
    *   A notable insight from the EDA is the strong positive correlation between discounts and sales volume for electronics, whereas discounts had a minimal impact on FMCG product sales, suggesting category-specific promotional effectiveness.
    *   The SQL analysis successfully segmented products by their inventory velocity, providing a clear picture of which items are contributing to capital inefficiency.
*   **Actionable Recommendations:**
    *   **For Supply Chain & Purchasing Department:**
        *   **Strategic Replenishment:** Immediately revise purchasing plans for the next quarter, significantly reducing orders for products identified as 'Slow-Moving / Dead Stock'. Reallocate budget towards 'Fast-Moving' and 'Hot' items with real-time demand signals.
        *   **Dynamic Reordering:** Implement dynamic reorder points and safety stock levels for critical 'Fast-Moving' and 'Hot' items, leveraging future demand forecasts to prevent stock-outs during peak seasons.
        *   **Vendor Negotiation:** For 'Slow-Moving' items that must be kept, negotiate better terms with suppliers to reduce `unit_cost` or allow for returns.
    *   **For Sales & Marketing Department:**
        *   **Targeted Promotions:** Develop targeted promotional campaigns (e.g., bundled offers, limited-time discounts) specifically for 'Slow-Moving / Dead Stock' items to clear inventory, focusing on channels where these products have the highest conversion potential.
        *   **Category-Specific Discounting:** Refine discount strategies based on the identified category effectiveness; for example, leverage discounts more heavily for electronics and explore alternative promotional tactics (e.g., loyalty programs, cross-selling) for FMCG.
    *   **For Board of Directors:**
        *   **Budget Optimization:** Approve revised inventory budgets that align with demand forecasts and optimal inventory turnover ratios, aiming to free up tied-up capital and reduce overall storage costs.
        *   **Technology Investment:** Consider investing in advanced inventory forecasting and management systems that integrate real-time sales data, promotional plans, and supply chain insights for more agile decision-making.
        *   **KPI Implementation:** Establish new key performance indicators (KPIs) focused on Inventory Turnover Ratio, Capital Efficiency, and Out-of-Stock rates to continuously monitor and improve inventory performance across the organization.
