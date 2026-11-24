# Floréa: An Integrated E-Commerce Platform for Florist Cafés and Flower Shops
## A Capstone Project Proposal
In compliance with the Thesis Capstone Project proposal  
Presented to the Faculty of College of Engineering, Architecture, Technology and Science  
**JOHN PAUL COLLEGE**  
MG Andaya Compound, Brgy. Odiong, Roxas, Oriental Mindoro, Philippines  

In Partial Fulfillment of the Requirements for the Degree  
**BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY**  

**Submitted by:**  
Reymart G. Gamos  
Jherico Francisco  
Cristalie C. Gacilo  

**June 11, 2026** (Date submitted)  

---

### APPROVAL SHEET
This capstone project entitled  
**Floréa: An Integrated E-Commerce Platform for Florist Cafés and Flower Shops**  
prepared and submitted by:  
Reymart G. Gamos, Jherico Francisco, Cristalie C. Gacilo  
in partial fulfillment of the requirements for the degree of Bachelor of Science in Information Technology, has been examined and is recommended for acceptance and approval.

_____________________________  
Panel Member  

_____________________________  
Panel Member  

_____________________________  
Adviser  

Accepted and approved in partial fulfillment of the requirements for the degree of Bachelor of Science in Information Technology.

_____________________________  
Dean, College of Engineering, Architecture, Technology and Science  
Date: _______________  

---

## TABLE OF CONTENTS
- APPROVAL SHEET
- ACKNOWLEDGEMENT
- EXECUTIVE SUMMARY
- TABLE OF CONTENTS
- LIST OF FIGURES
- LIST OF TABLES
- LIST OF APPENDICES

### CHAPTER I: INTRODUCTION
- 1.1 Project Context
- 1.2 Objectives of the Study
- 1.3 Scope and Limitation of the Study
- 1.4 Significance of the Study
- 1.5 Conceptual Framework
- 1.6 Definition of Terms

### CHAPTER II: REVIEW OF RELATED LITERATURE AND STUDIES
- 2.1 Foreign Literature
- 2.2 Local Literature
- 2.3 Foreign Studies
- 2.4 Local Studies
- 2.5 Related Systems (2.5.1 Foreign Systems, 2.5.2 Local Systems)
- 2.6 Synthesis
- References

### CHAPTER III: METHODOLOGY
- 3.1 Development Method
- 3.2 Gantt Chart
- 3.3 Requirements Specifications (3.3.1 Functional, 3.3.2 UI, 3.3.3 Hardware, 3.3.4 Software, 3.3.5 Security)
- 3.4 Technical Background (3.4.1 Hardware Specifications, 3.4.2 Software Specifications)
- 3.5 System Analysis and Design (3.5.1 System Overview, 3.5.2 System Architecture, 3.5.3 Use Case, 3.5.4 Activity Diagram, 3.5.5 Data Flow Diagram, 3.5.6 Database Schema)
- 3.6 Testing and Evaluation
- 3.7 Implementation Plan

### CHAPTER IV: PRESENTATION, ANALYSIS, AND INTERPRETATION OF DATA
- 4.1 Introduction
- 4.2 Profile of Respondents
- 4.3 Results of the System Evaluation
- 4.4 Discussion of Findings
- 4.5 Comparison with Related Systems

### CHAPTER V: SUMMARY, CONCLUSION, AND RECOMMENDATIONS
- 5.1 Summary of the Study
- 5.2 Summary of Findings
- 5.3 Conclusions
- 5.4 Recommendations

---

## CHAPTER I: INTRODUCTION

### 1.1 Project Context
Technology has fundamentally transformed the way businesses operate in the modern world. The continuous advancement of information and communication technology has significantly influenced how organizations manage their daily operations, communicate with customers, and process business transactions. Across different industries, digital systems have become essential tools for improving productivity, reducing operational costs, enhancing service quality, and ensuring data accuracy. As technology continues to evolve, businesses are increasingly adopting computerized systems to replace traditional manual processes in order to remain competitive and meet the growing expectations of customers.

The floral and café industry represents a unique business model that combines the sale of perishable floral products with food and beverage services. This dual-nature business presents distinct operational challenges that require specialized management solutions. Florist cafés and flower shops must manage inventory with limited shelf life, handle complex pricing structures, process customer orders efficiently, and maintain accurate records across multiple product categories. These operational demands necessitate a comprehensive system that can address the specific needs of this industry.

In the Philippines, the floral industry has experienced steady growth driven by increasing demand for flowers and plants for various occasions including weddings, birthdays, anniversaries, corporate events, and religious celebrations. The integration of café services within flower shops has emerged as a popular business model, offering customers a unique experience that combines the beauty of floral arrangements with the comfort of a café setting. This convergence creates opportunities for business growth but also introduces additional complexity in operations management.

Despite the potential of technology to improve business operations, many small and medium-sized florist cafés and flower shops in the Philippines continue to rely on manual record-keeping systems and spreadsheet applications for managing their daily operations. These traditional methods, while relatively inexpensive and easy to implement, present several significant limitations that can hinder business growth and efficiency.

Florist Café & Flower Shop currently utilizes manual procedures in recording sales transactions, monitoring inventory, managing product catalogs, and preparing business reports. The management faces considerable difficulties in maintaining accurate records due to the time-consuming nature of manual data entry. Inventory tracking becomes particularly challenging because stock updates are not automatically reflected after each transaction, leading to discrepancies in inventory records that may result in stock shortages or overstocking of products. The perishable nature of floral products makes accurate inventory management even more critical.

Furthermore, generating reports requires significant effort since information must be gathered and computed manually before meaningful business insights can be obtained. The inability to access real-time information limits the business's capacity to make timely and informed decisions. Management may experience delays in identifying fast-moving products, determining inventory requirements, evaluating sales performance, and understanding customer preferences. These operational inefficiencies can affect customer satisfaction, profitability, and long-term business sustainability.

The absence of a digital menu system also means that customers must rely on physical menus or verbal descriptions to learn about available products. This traditional approach limits the ability to showcase the full range of products with detailed descriptions, images, and pricing information. Additionally, it prevents the implementation of modern ordering conveniences that customers have come to expect in today's digital environment.

To address these concerns, this study proposes the development of Floréa - an Integrated E-Commerce Platform specifically designed for Florist Cafés and Flower Shops. The proposed system aims to automate key business processes such as sales recording, inventory monitoring, digital menu presentation, report generation, and business analytics. Through the implementation of a centralized and web-based platform, the business will be able to improve data accuracy, reduce operational workload, enhance inventory control, and provide management with real-time access to critical business information.

#### Table 1.1 Gap Analysis
| Current State | Desired State |
| :--- | :--- |
| Sales transactions are recorded manually on paper. | Sales transactions are automatically recorded and stored in a secure database. |
| Inventory updates require manual counting and encoding. | Inventory levels are updated automatically in real-time after each transaction. |
| Reports are generated manually using spreadsheets. | Reports are generated instantly through the system with visual analytics. |
| Customers rely on physical menus or verbal descriptions. | Customers use QR code digital menu with images and descriptions. |
| Data is scattered across paper records and spreadsheets. | Data is centralized in a secure, accessible database. |
| High possibility of human errors in records. | Improved accuracy through automation and validation. |
| Limited access to business information. | Real-time access to operational data and analytics dashboards. |
| Perishable inventory often wasted due to poor tracking. | Expiry date monitoring and alerts reduce waste. |
| No data insights for business decisions. | Business analytics provide actionable insights and trends. |

### 1.2 Objectives of the Study
#### General Objective
To design, develop, implement, and evaluate Floréa - an Integrated E-Commerce Platform with QR Code Digital Menu, Sales Automation, Inventory Control, and Business Analytics for Florist Cafés and Flower Shops.

#### Specific Objectives
1. To develop a secure and user-friendly web-based platform for managing florist café operations including product cataloging, order management, and customer service.
2. To implement a QR Code Digital Menu system that allows customers to browse products, view detailed descriptions and images, and place orders directly using their mobile devices.
3. To automate sales recording, transaction processing, receipt generation, and payment tracking to reduce manual workload and minimize errors.
4. To implement real-time inventory monitoring and control mechanisms with automatic stock updates, low-stock alerts, and inventory forecasting capabilities.
5. To design and implement a Business Analytics module that generates comprehensive reports, visual dashboards, and data insights for informed decision-making.
6. To provide management with reliable, real-time access to business information including sales trends, inventory status, and operational performance metrics.
7. To evaluate the system based on ISO/IEC 25010 Software Quality Standards and UTAUT model for user acceptance.
8. To complete the development, testing, and deployment of the system within the approved capstone project timeline.

### 1.3 Scope and Limitation of the Study
#### Scope
This study focuses on the design, development, implementation, and evaluation of Floréa - an Integrated E-Commerce Platform for Florist Cafés and Flower Shops. The system encompasses the following modules and functionalities:
• **User Authentication and Authorization Module** - manages user registration, login, password management, and role-based access control for administrators, managers, cashiers, and staff.  
• **QR Code Digital Menu Module** - generates unique QR codes for table-side and counter ordering, displays product catalogs with images and descriptions, categorizes products (flowers, bouquets, café items), and enables customer self-service ordering.  
• **Sales Automation Module** - processes transactions, generates digital receipts, tracks cash and manual e-wallet payments, manages discounts and promotions, and records all sales activities in real-time.  
• **Inventory Control Module** - monitors stock levels across all product categories, provides automatic low-stock alerts, tracks product expiry dates for perishable items, manages suppliers, and generates inventory reports.  
• **Business Analytics Module** - generates sales reports, inventory reports, revenue analytics, product performance analysis, customer behavior insights, and visual dashboards with charts and graphs.  
• **Product Management Module** - allows administrators to add, edit, and manage product information, categories, pricing, and availability status.  
• **Order Management Module** - tracks order status in real time (Pending, Preparing, Ready for Pickup, Completed, Cancelled), manages order queues, and supports **dine-in (table service)** and **take-out (in-store pickup)** order fulfillment types.  

#### Limitations
The study does not include the following:
• Online payment gateway integration (the system records cash and verified manual payments only, such as in-store cash and manual GCash reference checking)  
• Multi-branch or franchise management capabilities  
• Human Resource Management and payroll processing  
• Advanced accounting and financial ledger systems  
• Native mobile application development (the system is purely web-based, responsive, and installable via PWA)  
• **Delivery and third-party logistics management systems** (the system strictly caters to on-premise dine-in and customer in-store pickup; no delivery tracking or delivery rider dispatch is included)  
• Social media integration and marketing automation  
• Supplier procurement and automated purchase order generation  
• Customer loyalty points and external reward redemption systems  
• The proposed system is tailored specifically for Florist Café & Flower Shop and may require customization for other business types.  

### 1.4 Significance of the Study
The development of Floréa is expected to provide significant benefits to various stakeholders:
- **Business Owners**: Provides an efficient platform for real-time sales monitoring, inventory tracking, and business analytics to reduce losses and improve profitability.
- **Managers**: Streamlines daily operations supervision with instant access to transaction records, inventory alerts, and order queues.
- **Employees and Cashiers**: Automates routine tasks like order processing, cash calculation, inventory deductions, and receipt generation.
- **Customers**: Offers an interactive QR code digital menu for convenient self-service browsing, clear pricing, and faster order preparation for dine-in and takeout.
- **Researchers & Future Researchers**: Serves as a practical benchmark and reference for future studies on hybrid retail and F&B web management systems.
- **Academic Institution (John Paul College)**: Demonstrates the practical application of IT principles to solve real-world industry problems.

### 1.5 Conceptual Framework
The Input-Process-Output (IPO) model is utilized to structure the system:
- **Input**: User requirements, sales data, inventory records, product information, and hardware/software specifications.
- **Process**: System analysis, UI/UX and database design, agile-scrum development, ISO 25010 testing, and deployment.
- **Output**: Floréa platform, real-time analytics reports, automated stock deductions, and complete documentation.

### 1.6 Definition of Terms
- **Digital Menu**: An electronic menu accessed via smartphone by scanning a table or counter QR code.
- **Floréa**: The integrated e-commerce and POS platform for Florist Cafés and Flower Shops.
- **Inventory Control**: Real-time monitoring of perishable flowers and café stock with reorder alerts.
- **Order Statuses**: The live stages of an order in the system: *Pending/New*, *Preparing*, *Ready for Pickup*, *Completed*, and *Cancelled*.
- **Order Fulfillment Types**: The supported order modes: *Dine-in* (served to table) and *Takeout* (in-store counter pickup).
- **QR Code**: Quick Response Code scanned to view the catalog and place orders.

---

## CHAPTER II: REVIEW OF RELATED LITERATURE AND STUDIES
*(Review of foreign and local literature and systems: Toast, Square, Clover, TouchBistro, UTAK POS, Condor POS, Kintoz, Mosaic Solutions, PayMongo; confirming the research gap that existing commercial POS platforms target general food service or general retail rather than the hybrid floral-café business model).*

---

## CHAPTER III: METHODOLOGY

### 3.1 Development Method
Agile-Scrum methodology with two-week sprint iterations comprising Sprint Planning, Daily Stand-ups, Sprint Reviews, and Retrospectives.

### 3.3 Requirements Specifications
#### 3.3.1 Functional Requirements
- **User Management**: Role-based access for Admin, Manager, Cashier, and Staff with secure login.
- **QR Digital Menu**: QR code scanning, category filtering, item customization, and order submission for Dine-in and Takeout.
- **Sales Automation**: Automated order computation, cash and manual payment verification, digital receipts, and real-time sales recording.
- **Inventory Control**: Auto-deduction of ingredients/stocks, low-stock notifications, and perishable expiry tracking.
- **Business Analytics**: Visual charts for revenue, top-selling flowers and drinks, and exportable sales reports.
- **Product Management**: Complete CRUD operations for products, categories, pricing, and stock status.

### 3.5 System Analysis and Design
#### Primary Actors:
1. **Administrator** - Full system control, user accounts, product management, and configuration.
2. **Manager** - Supervises operations, analyzes sales reports, and oversees inventory.
3. **Cashier** - Confirms orders, verifies payments, and issues receipts.
4. **Staff / Barista / Florist** - Prepares customer orders and marks items ready.
5. **Customer** - Scans table QR code, selects Dine-in or Takeout, and places orders.

#### Order Processing Workflow (Activity Flow):
1. Customer scans QR code and browses the digital menu.
2. Customer selects items, chooses **Dine-in** or **Takeout**, and submits the order.
3. Order appears on Cashier & Admin dashboards as **Pending / New**.
4. Staff confirms order and sets status to **Preparing**.
5. Once items are made/arranged, status is updated to **Ready for Pickup**.
6. Customer pays, cashier verifies payment, and marks order **Completed**.

---

## CHAPTER IV: PRESENTATION, ANALYSIS, AND INTERPRETATION OF DATA
*(Evaluation using ISO/IEC 25010 Software Quality Standards across Functionality, Reliability, Usability, Efficiency, Security, and Maintainability conducted with Business Owners/Managers, Cashiers/Staff, and Customers).*

---

## CHAPTER V: SUMMARY, CONCLUSION, AND RECOMMENDATIONS

### 5.1 Summary of the Study
Floréa successfully digitizes and unifies the ordering, sales, inventory, and analytics operations of a florist café and flower shop, eliminating reliance on manual recording and disjointed spreadsheets.

### 5.2 Summary of Findings
- **QR Code Digital Menu**: Provided seamless on-table and counter browsing with zero customer app downloads required.
- **Sales Automation & Cashier Dashboard**: Drastically reduced transaction handling time, error rates, and manual receipt writing.
- **Inventory Control**: Accurately tracked both perishable blooms and café supplies with automated deduction upon order confirmation.
- **Business Analytics**: Gave management instant visibility into daily sales trends and fast-moving menu items.

### 5.3 Conclusions
Floréa meets all specific project objectives and demonstrates high usability and reliability under ISO/IEC 25010 standards, confirming its fitness as a purpose-built solution for florist cafés.

### 5.4 Recommendations
For future development and system enhancements:
• Develop a dedicated mobile app for customers to support advance table reservations and pre-ordering for in-store pickup.  
• Integrate automated digital payment gateways (e.g., PayMongo API for direct GCash, Maya, and credit/debit card processing).  
• Enhance inventory tracking with AI-assisted demand forecasting to anticipate floral requirements during peak seasonal events (e.g., Valentine's Day, Mother's Day, and graduation season).  
• Support multi-branch operations and centralized inventory monitoring if the business expands to additional physical branches.  
• Introduce a digital loyalty rewards module for regular dine-in and takeout patrons.  
• Implement offline caching and local transaction queueing for point-of-sale operations in case of intermittent internet connectivity.  
