-- ==================================================================================
-- SQL Script — Full BorrowBox OLTP
-- ==================================================================================

CREATE DATABASE IF NOT EXISTS borrowbox_oltp;
USE borrowbox_oltp;

-- ============================================
-- 1. BORROWER TYPES
-- ============================================
CREATE TABLE borrower_types (
    borrower_type_id INT AUTO_INCREMENT PRIMARY KEY,
    borrower_type_name VARCHAR(50) NOT NULL UNIQUE
);

-- ============================================
-- 2. COLLEGES
-- ============================================
CREATE TABLE colleges (
    college_id INT AUTO_INCREMENT PRIMARY KEY,
    college_code VARCHAR(20) NOT NULL UNIQUE,
    college_name VARCHAR(150) NOT NULL UNIQUE
);

-- ============================================
-- 3. DEPARTMENTS
-- ============================================
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    college_id INT NOT NULL,
    department_code VARCHAR(20) NOT NULL UNIQUE,
    department_name VARCHAR(150) NOT NULL,
    CONSTRAINT fk_departments_college
        FOREIGN KEY (college_id) REFERENCES colleges(college_id)
);

-- ============================================
-- 4. COURSES
-- ============================================
CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_name VARCHAR(150) NOT NULL,
    CONSTRAINT fk_courses_department
        FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- ============================================
-- 5. BORROWERS
-- ============================================
CREATE TABLE borrowers (
    borrower_id INT AUTO_INCREMENT PRIMARY KEY,
    borrower_type_id INT NOT NULL,
    university_id_no VARCHAR(30) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NOT NULL,
    sex ENUM('Male', 'Female', 'Other') NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone_number VARCHAR(30) NULL,
    college_id INT NULL,
    department_id INT NULL,
    course_id INT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_borrowers_borrower_type
        FOREIGN KEY (borrower_type_id) REFERENCES borrower_types(borrower_type_id),
    CONSTRAINT fk_borrowers_college
        FOREIGN KEY (college_id) REFERENCES colleges(college_id),
    CONSTRAINT fk_borrowers_department
        FOREIGN KEY (department_id) REFERENCES departments(department_id),
    CONSTRAINT fk_borrowers_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

-- ============================================
-- 6. ITEM CATEGORIES
-- ============================================
CREATE TABLE item_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NULL
);

-- ============================================
-- 7. BRANDS
-- ============================================
CREATE TABLE brands (
    brand_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(100) NOT NULL UNIQUE
);

-- ============================================
-- 8. SUPPLIERS
-- ============================================
CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL UNIQUE,
    contact_person VARCHAR(100) NULL,
    contact_number VARCHAR(30) NULL,
    email VARCHAR(150) NULL,
    address VARCHAR(255) NULL
);

-- ============================================
-- 9. ITEM CONDITIONS
-- ============================================
CREATE TABLE item_conditions (
    condition_id INT AUTO_INCREMENT PRIMARY KEY,
    condition_name VARCHAR(50) NOT NULL UNIQUE
);

-- ============================================
-- 10. UNIT STATUSES
-- ============================================
CREATE TABLE unit_statuses (
    unit_status_id INT AUTO_INCREMENT PRIMARY KEY,
    unit_status_name VARCHAR(50) NOT NULL UNIQUE
);

-- ============================================
-- 11. BORROW STATUSES
-- ============================================
CREATE TABLE borrow_statuses (
    borrow_status_id INT AUTO_INCREMENT PRIMARY KEY,
    borrow_status_name VARCHAR(50) NOT NULL UNIQUE
);

-- ============================================
-- 12. ITEMS (MASTER ITEM)
-- ============================================
CREATE TABLE items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    brand_id INT NULL,
    supplier_id INT NULL,
    item_name VARCHAR(150) NOT NULL,
    model_name VARCHAR(100) NULL,
    description VARCHAR(255) NULL,
    default_borrow_days INT NOT NULL DEFAULT 3,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_items_category
        FOREIGN KEY (category_id) REFERENCES item_categories(category_id),
    CONSTRAINT fk_items_brand
        FOREIGN KEY (brand_id) REFERENCES brands(brand_id),
    CONSTRAINT fk_items_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- ============================================
-- 13. ITEM UNITS (ACTUAL PHYSICAL INVENTORY)
-- ============================================
CREATE TABLE item_units (
    unit_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    asset_tag VARCHAR(50) NOT NULL UNIQUE,
    serial_number VARCHAR(100) NULL UNIQUE,
    condition_id INT NOT NULL,
    unit_status_id INT NOT NULL,
    purchase_date DATE NULL,
    notes VARCHAR(255) NULL,
    CONSTRAINT fk_item_units_item
        FOREIGN KEY (item_id) REFERENCES items(item_id),
    CONSTRAINT fk_item_units_condition
        FOREIGN KEY (condition_id) REFERENCES item_conditions(condition_id),
    CONSTRAINT fk_item_units_status
        FOREIGN KEY (unit_status_id) REFERENCES unit_statuses(unit_status_id)
);

-- ============================================
-- 14. BORROW TRANSACTIONS (HEADER)
-- ============================================
CREATE TABLE borrow_transactions (
    borrow_transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_code VARCHAR(30) NOT NULL UNIQUE,
    borrower_id INT NOT NULL,
    borrow_status_id INT NOT NULL,
    request_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_date DATETIME NULL,
    release_date DATETIME NULL,
    due_date DATETIME NOT NULL,
    return_date DATETIME NULL,
    purpose VARCHAR(255) NOT NULL,
    remarks VARCHAR(255) NULL,
    approved_by VARCHAR(150) NULL,
    received_by VARCHAR(150) NULL,
    returned_to VARCHAR(150) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_borrow_transactions_borrower
        FOREIGN KEY (borrower_id) REFERENCES borrowers(borrower_id),
    CONSTRAINT fk_borrow_transactions_status
        FOREIGN KEY (borrow_status_id) REFERENCES borrow_statuses(borrow_status_id)
);

-- ============================================
-- 15. BORROW TRANSACTION ITEMS (DETAIL)
-- ============================================
CREATE TABLE borrow_transaction_items (
    borrow_transaction_item_id INT AUTO_INCREMENT PRIMARY KEY,
    borrow_transaction_id INT NOT NULL,
    unit_id INT NOT NULL,
    condition_out_id INT NOT NULL,
    condition_in_id INT NULL,
    item_returned_at DATETIME NULL,
    item_remarks VARCHAR(255) NULL,
    CONSTRAINT fk_borrow_items_transaction
        FOREIGN KEY (borrow_transaction_id) REFERENCES borrow_transactions(borrow_transaction_id),
    CONSTRAINT fk_borrow_items_unit
        FOREIGN KEY (unit_id) REFERENCES item_units(unit_id),
    CONSTRAINT fk_borrow_items_condition_out
        FOREIGN KEY (condition_out_id) REFERENCES item_conditions(condition_id),
    CONSTRAINT fk_borrow_items_condition_in
        FOREIGN KEY (condition_in_id) REFERENCES item_conditions(condition_id),
    CONSTRAINT uq_transaction_unit UNIQUE (borrow_transaction_id, unit_id)
);

-- ==================================================================================
-- Seed Data for Reference Tables
-- ==================================================================================
USE borrowbox_oltp;

-- Borrower Types
INSERT INTO borrower_types (borrower_type_name) VALUES
('Student'),
('Faculty'),
('Employee');

-- Colleges
INSERT INTO colleges (college_code, college_name) VALUES
('CCS', 'College of Computer Studies'),
('COE', 'College of Engineering'),
('COB', 'College of Business'),
('CAS', 'College of Arts and Sciences');

-- Departments
INSERT INTO departments (college_id, department_code, department_name) VALUES
(1, 'IT', 'Information Technology Department'),
(1, 'CS', 'Computer Science Department'),
(2, 'ECE', 'Electronics Engineering Department'),
(2, 'ME', 'Mechanical Engineering Department'),
(3, 'MGT', 'Management Department'),
(4, 'MMA', 'Multimedia Arts Department');

-- Courses
INSERT INTO courses (department_id, course_code, course_name) VALUES
(1, 'BSIT', 'Bachelor of Science in Information Technology'),
(2, 'BSCS', 'Bachelor of Science in Computer Science'),
(3, 'BSECE', 'Bachelor of Science in Electronics Engineering'),
(4, 'BSME', 'Bachelor of Science in Mechanical Engineering'),
(5, 'BSBA', 'Bachelor of Science in Business Administration'),
(6, 'BMMA', 'Bachelor of Multimedia Arts');

-- Item Categories
INSERT INTO item_categories (category_name, description) VALUES
('Laptop', 'Portable computers for academic and office use'),
('Tablet', 'Tablets and iPads'),
('VR Equipment', 'Virtual reality headsets and accessories'),
('Sports Equipment', 'Sports-related items'),
('Projector', 'LCD and multimedia projectors'),
('Audio Equipment', 'Sound system and microphones'),
('Camera Equipment', 'Cameras and accessories'),
('Accessories', 'Tripods, adapters, cables and related items');

-- Brands
INSERT INTO brands (brand_name) VALUES
('Dell'),
('HP'),
('Lenovo'),
('Apple'),
('Meta'),
('Sony'),
('Canon'),
('Nikon'),
('JBL'),
('Epson'),
('Spalding'),
('Logitech');

-- Suppliers
INSERT INTO suppliers (supplier_name, contact_person, contact_number, email, address) VALUES
('TechSource Trading', 'Mark Reyes', '09171234567', 'sales@techsource.com', 'Manila, Philippines'),
('EduGear Supplies', 'Anna Cruz', '09181234567', 'anna@edugear.com', 'Quezon City, Philippines'),
('AV Hub Distributors', 'Paolo Santos', '09191234567', 'paolo@avhub.com', 'Makati City, Philippines');

-- Item Conditions
INSERT INTO item_conditions (condition_name) VALUES
('Good'),
('Damaged'),
('Needs Repair'),
('Lost');

-- Unit Statuses
INSERT INTO unit_statuses (unit_status_name) VALUES
('Available'),
('Borrowed'),
('Reserved'),
('Under Maintenance'),
('Retired');

-- Borrow Statuses
INSERT INTO borrow_statuses (borrow_status_name) VALUES
('Pending'),
('Approved'),
('Released'),
('Returned'),
('Overdue'),
('Cancelled');


-- ==================================================================================
-- Sample Borrowers
-- ==================================================================================
INSERT INTO borrowers (
    borrower_type_id, university_id_no, first_name, middle_name, last_name,
    sex, email, phone_number, college_id, department_id, course_id, is_active
) VALUES
(1, '2026-0001', 'Juan', 'Santos', 'Dela Cruz', 'Male', 'juan.delacruz@univ.edu', '09170000001', 1, 1, 1, 1),
(1, '2026-0002', 'Maria', 'Lopez', 'Reyes', 'Female', 'maria.reyes@univ.edu', '09170000002', 1, 2, 2, 1),
(2, 'FAC-1001', 'Carla', 'Mendoza', 'Lim', 'Female', 'carla.lim@univ.edu', '09170000003', 1, 1, NULL, 1),
(2, 'FAC-1002', 'Michael', 'Tan', 'Garcia', 'Male', 'michael.garcia@univ.edu', '09170000004', 2, 3, NULL, 1),
(3, 'EMP-2001', 'Ronald', 'Diaz', 'Torres', 'Male', 'ronald.torres@univ.edu', '09170000005', NULL, NULL, NULL, 1),
(3, 'EMP-2002', 'Shiela', 'Flores', 'Ramos', 'Female', 'shiela.ramos@univ.edu', '09170000006', NULL, NULL, NULL, 1);


-- ==================================================================================
-- Sample Items
-- ==================================================================================
INSERT INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active) VALUES
(1, 1, 1, 'Laptop', 'Latitude 5420', 'Dell laptop for student use', 3, 1),
(1, 2, 1, 'Laptop', 'EliteBook 840', 'HP laptop for faculty use', 5, 1),
(2, 4, 2, 'iPad', 'iPad 10th Gen', 'Apple iPad for classroom activities', 2, 1),
(2, 3, 2, 'Tablet', 'Tab M10', 'Lenovo tablet for digital learning', 2, 1),
(3, 5, 1, 'VR Headset', 'Quest 2', 'Virtual reality headset', 1, 1),
(4, 11, 2, 'Basketball', 'Official Size 7', 'Basketball for sports borrowing', 1, 1),
(5, 10, 3, 'LCD Projector', 'EB-X06', 'Projector for classroom presentations', 2, 1),
(6, 9, 3, 'Sound System', 'PartyBox', 'Portable sound system', 2, 1),
(7, 6, 3, 'Camera', 'Alpha A6400', 'Sony mirrorless camera', 2, 1),
(8, 12, 3, 'Tripod', 'Compact Tripod', 'Tripod for camera support', 2, 1);

-- ==================================================================================
-- Sample Physical Units
-- ==================================================================================
INSERT INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes) VALUES
(1, 'LAP-0001', 'SN-DL-1001', 1, 1, '2025-01-10', 'Dell laptop unit 1'),
(1, 'LAP-0002', 'SN-DL-1002', 1, 1, '2025-01-10', 'Dell laptop unit 2'),
(2, 'LAP-0003', 'SN-HP-2001', 1, 1, '2025-01-15', 'HP laptop unit 1'),
(3, 'TAB-0001', 'SN-IP-3001', 1, 1, '2025-02-01', 'iPad unit 1'),
(3, 'TAB-0002', 'SN-IP-3002', 1, 1, '2025-02-01', 'iPad unit 2'),
(4, 'TAB-0003', 'SN-LV-4001', 1, 1, '2025-02-10', 'Lenovo tablet unit 1'),
(5, 'VR-0001', 'SN-VR-5001', 1, 1, '2025-03-01', 'VR headset unit 1'),
(6, 'SP-0001', 'SN-BB-6001', 1, 1, '2025-03-05', 'Basketball unit 1'),
(6, 'SP-0002', 'SN-BB-6002', 1, 1, '2025-03-05', 'Basketball unit 2'),
(7, 'PROJ-0001', 'SN-EP-7001', 1, 1, '2025-03-10', 'Projector unit 1'),
(8, 'AUD-0001', 'SN-JB-8001', 1, 1, '2025-03-15', 'Sound system unit 1'),
(9, 'CAM-0001', 'SN-SY-9001', 1, 1, '2025-03-20', 'Sony camera unit 1'),
(10, 'ACC-0001', 'SN-TR-10001', 1, 1, '2025-03-20', 'Tripod unit 1');


-- ==================================================================================
-- Sample Borrow Transactions
-- ==================================================================================
INSERT INTO borrow_transactions (
    transaction_code, borrower_id, borrow_status_id, request_date,
    approved_date, release_date, due_date, return_date,
    purpose, remarks, approved_by, received_by, returned_to
) VALUES
('BBX-2026-0001', 1, 4, '2026-03-20 08:00:00', '2026-03-20 09:00:00', '2026-03-20 10:00:00', '2026-03-23 17:00:00', '2026-03-23 15:00:00',
 'Capstone presentation', 'Returned on time', 'Admin A', 'Staff A', 'Staff B'),

('BBX-2026-0002', 3, 3, '2026-03-24 08:30:00', '2026-03-24 09:00:00', '2026-03-24 10:00:00', '2026-03-26 17:00:00', NULL,
 'Classroom demo for programming class', 'Currently borrowed', 'Admin A', 'Staff A', NULL),

('BBX-2026-0003', 5, 1, '2026-03-25 13:00:00', NULL, NULL, '2026-03-27 17:00:00', NULL,
 'Office event sound setup', 'Pending approval', NULL, NULL, NULL);


-- ==================================================================================
-- Details
-- ==================================================================================
INSERT INTO borrow_transaction_items (
    borrow_transaction_id, unit_id, condition_out_id, condition_in_id, item_returned_at, item_remarks
) VALUES
(1, 1, 1, 1, '2026-03-23 15:00:00', 'Laptop returned in good condition'),
(1, 10, 1, 1, '2026-03-23 15:00:00', 'Projector returned in good condition'),

(2, 12, 1, NULL, NULL, 'Camera currently borrowed'),
(2, 13, 1, NULL, NULL, 'Tripod currently borrowed');



-- ==================================================================================
-- Useful OLTP Queries for Demo
-- ==================================================================================



-- ==================================================================================
-- 1. Show all borrowers
-- ==================================================================================

SELECT 
    b.borrower_id,
    bt.borrower_type_name,
    b.university_id_no,
    CONCAT(b.first_name, ' ', b.last_name) AS borrower_name,
    b.email
FROM borrowers b
INNER JOIN borrower_types bt ON b.borrower_type_id = bt.borrower_type_id;


-- ==================================================================================
-- 2. Show all available item units
-- ==================================================================================
SELECT
    iu.unit_id,
    iu.asset_tag,
    i.item_name,
    ic.category_name,
    us.unit_status_name,
    cond.condition_name
FROM item_units iu
INNER JOIN items i ON iu.item_id = i.item_id
INNER JOIN item_categories ic ON i.category_id = ic.category_id
INNER JOIN unit_statuses us ON iu.unit_status_id = us.unit_status_id
INNER JOIN item_conditions cond ON iu.condition_id = cond.condition_id
WHERE us.unit_status_name = 'Available';



-- ==================================================================================
-- 3. Show all borrow transactions
-- ==================================================================================
SELECT
    bt.borrow_transaction_id,
    bt.transaction_code,
    CONCAT(b.first_name, ' ', b.last_name) AS borrower_name,
    bs.borrow_status_name,
    bt.request_date,
    bt.due_date,
    bt.return_date,
    bt.purpose
FROM borrow_transactions bt
INNER JOIN borrowers b ON bt.borrower_id = b.borrower_id
INNER JOIN borrow_statuses bs ON bt.borrow_status_id = bs.borrow_status_id
ORDER BY bt.request_date DESC;



-- ==================================================================================
-- 4. Show transaction details with borrowed items
-- ==================================================================================
SELECT
    bt.transaction_code,
    CONCAT(b.first_name, ' ', b.last_name) AS borrower_name,
    i.item_name,
    iu.asset_tag,
    c_out.condition_name AS condition_out,
    c_in.condition_name AS condition_in,
    bti.item_returned_at
FROM borrow_transaction_items bti
INNER JOIN borrow_transactions bt ON bti.borrow_transaction_id = bt.borrow_transaction_id
INNER JOIN borrowers b ON bt.borrower_id = b.borrower_id
INNER JOIN item_units iu ON bti.unit_id = iu.unit_id
INNER JOIN items i ON iu.item_id = i.item_id
INNER JOIN item_conditions c_out ON bti.condition_out_id = c_out.condition_id
LEFT JOIN item_conditions c_in ON bti.condition_in_id = c_in.condition_id
ORDER BY bt.borrow_transaction_id;



-- ==================================================================================
-- 5. Show overdue borrowings
-- ==================================================================================
SELECT
    bt.transaction_code,
    CONCAT(b.first_name, ' ', b.last_name) AS borrower_name,
    bt.due_date,
    bs.borrow_status_name
FROM borrow_transactions bt
INNER JOIN borrowers b ON bt.borrower_id = b.borrower_id
INNER JOIN borrow_statuses bs ON bt.borrow_status_id = bs.borrow_status_id
WHERE bt.due_date < NOW()
  AND bt.return_date IS NULL;


-- ==================================================================================
-- Inserting more records

-- add more item categories
-- add more item master records
-- add many more physical item units

-- ==================================================================================




-- ==================================================================================
-- Add more categories, brands, suppliers, conditions, and statuses
-- ==================================================================================

USE borrowbox_oltp;

-- ============================================
-- SAFETY SEED FOR REFERENCE TABLES
-- ============================================

INSERT IGNORE INTO item_categories (category_name, description) VALUES
('Laptop', 'Portable computers for academic and office use'),
('Tablet', 'Tablets and iPads for learning and presentations'),
('VR Equipment', 'Virtual reality devices and accessories'),
('Sports Equipment', 'Sports-related borrowable items'),
('Projector', 'Projectors and display equipment'),
('Audio Equipment', 'Audio and sound-related devices'),
('Camera Equipment', 'Cameras and media capture devices'),
('Accessories', 'General accessories such as tripods and cables'),
('Lighting Equipment', 'Lights for media production and events'),
('Office Equipment', 'Office-use devices and peripherals'),
('Networking Equipment', 'Routers and related network devices'),
('Presentation Tools', 'Tools used for classes and presentations');

INSERT IGNORE INTO brands (brand_name) VALUES
('Dell'),
('HP'),
('Lenovo'),
('Apple'),
('Meta'),
('Sony'),
('Canon'),
('Nikon'),
('JBL'),
('Epson'),
('Spalding'),
('Logitech'),
('Samsung'),
('Asus'),
('Acer'),
('GoPro'),
('Boya'),
('Shure'),
('TP-Link'),
('D-Link'),
('Anker'),
('Xiaomi'),
('BenQ'),
('MikroTik'),
('MSI'),
('Huawei');

INSERT IGNORE INTO suppliers (supplier_name, contact_person, contact_number, email, address) VALUES
('TechSource Trading', 'Mark Reyes', '09171234567', 'sales@techsource.com', 'Manila, Philippines'),
('EduGear Supplies', 'Anna Cruz', '09181234567', 'anna@edugear.com', 'Quezon City, Philippines'),
('AV Hub Distributors', 'Paolo Santos', '09191234567', 'paolo@avhub.com', 'Makati City, Philippines'),
('Campus Tech Hub', 'Liza Mendoza', '09201234567', 'orders@campustechhub.com', 'Pasig City, Philippines'),
('Prime Media Gear', 'Joey Ramos', '09211234567', 'sales@primemediagear.com', 'Taguig City, Philippines');

INSERT IGNORE INTO item_conditions (condition_name) VALUES
('Good'),
('Damaged'),
('Needs Repair'),
('Lost');

INSERT IGNORE INTO unit_statuses (unit_status_name) VALUES
('Available'),
('Borrowed'),
('Reserved'),
('Under Maintenance'),
('Retired');


-- ==================================================================================
-- Part 2 — Add many item master records
-- ==================================================================================
USE borrowbox_oltp;

INSERT IGNORE INTO items (
    category_id,
    brand_id,
    supplier_id,
    item_name,
    model_name,
    description,
    default_borrow_days,
    is_active
)
SELECT
    c.category_id,
    b.brand_id,
    s.supplier_id,
    'Laptop',
    'Latitude 5420',
    'Dell laptop for student and faculty use',
    3,
    1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Laptop'
  AND b.brand_name = 'Dell'
  AND s.supplier_name = 'TechSource Trading'
  AND NOT EXISTS (
      SELECT 1 FROM items WHERE item_name = 'Laptop' AND model_name = 'Latitude 5420'
  );

INSERT IGNORE INTO items (
    category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active
)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Laptop', 'EliteBook 840', 'HP laptop for mobile productivity', 3, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Laptop' AND b.brand_name = 'HP' AND s.supplier_name = 'TechSource Trading'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Laptop' AND model_name='EliteBook 840');

INSERT IGNORE INTO items (
    category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active
)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Laptop', 'ThinkPad E14', 'Lenovo laptop for classroom and office tasks', 3, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Laptop' AND b.brand_name = 'Lenovo' AND s.supplier_name = 'EduGear Supplies'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Laptop' AND model_name='ThinkPad E14');

INSERT IGNORE INTO items (
    category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active
)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Laptop', 'Aspire 5', 'Acer laptop for general borrowing', 3, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Laptop' AND b.brand_name = 'Acer' AND s.supplier_name = 'Campus Tech Hub'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Laptop' AND model_name='Aspire 5');

INSERT IGNORE INTO items (
    category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active
)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Laptop', 'Vivobook 15', 'Asus laptop for student presentations', 3, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Laptop' AND b.brand_name = 'Asus' AND s.supplier_name = 'Campus Tech Hub'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Laptop' AND model_name='Vivobook 15');

-- Tablets / iPads
INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'iPad', 'iPad 10th Gen', 'Apple iPad for learning activities', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Tablet' AND b.brand_name = 'Apple' AND s.supplier_name = 'EduGear Supplies'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='iPad' AND model_name='iPad 10th Gen');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Tablet', 'Galaxy Tab S9 FE', 'Samsung tablet for classroom demos', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Tablet' AND b.brand_name = 'Samsung' AND s.supplier_name = 'EduGear Supplies'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Tablet' AND model_name='Galaxy Tab S9 FE');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Tablet', 'Tab M10', 'Lenovo tablet for digital content viewing', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Tablet' AND b.brand_name = 'Lenovo' AND s.supplier_name = 'EduGear Supplies'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Tablet' AND model_name='Tab M10');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Tablet', 'MatePad 11', 'Huawei tablet for classroom and office usage', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Tablet' AND b.brand_name = 'Huawei' AND s.supplier_name = 'Campus Tech Hub'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Tablet' AND model_name='MatePad 11');

-- VR Equipment
INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'VR Headset', 'Quest 2', 'Standalone VR headset', 1, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'VR Equipment' AND b.brand_name = 'Meta' AND s.supplier_name = 'TechSource Trading'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='VR Headset' AND model_name='Quest 2');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'VR Headset', 'Quest 3', 'Updated VR headset for immersive activities', 1, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'VR Equipment' AND b.brand_name = 'Meta' AND s.supplier_name = 'TechSource Trading'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='VR Headset' AND model_name='Quest 3');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'VR Controller', 'Touch Controller', 'Controller for VR interaction', 1, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'VR Equipment' AND b.brand_name = 'Meta' AND s.supplier_name = 'TechSource Trading'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='VR Controller' AND model_name='Touch Controller');

-- Projectors / Presentation
INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'LCD Projector', 'EB-X06', 'Epson projector for classroom presentations', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Projector' AND b.brand_name = 'Epson' AND s.supplier_name = 'AV Hub Distributors'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='LCD Projector' AND model_name='EB-X06');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'LCD Projector', 'MW560', 'BenQ projector for lectures and events', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Projector' AND b.brand_name = 'BenQ' AND s.supplier_name = 'AV Hub Distributors'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='LCD Projector' AND model_name='MW560');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Portable Screen', 'PS-70', 'Projection screen for events and presentations', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Presentation Tools' AND b.brand_name = 'Logitech' AND s.supplier_name = 'AV Hub Distributors'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Portable Screen' AND model_name='PS-70');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Laser Pointer', 'R500', 'Wireless presenter with laser pointer', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Presentation Tools' AND b.brand_name = 'Logitech' AND s.supplier_name = 'Campus Tech Hub'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Laser Pointer' AND model_name='R500');

-- Audio Equipment
INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Sound System', 'PartyBox', 'Portable sound system for events', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Audio Equipment' AND b.brand_name = 'JBL' AND s.supplier_name = 'AV Hub Distributors'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Sound System' AND model_name='PartyBox');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Wireless Microphone', 'BY-WM3T', 'Portable wireless microphone set', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Audio Equipment' AND b.brand_name = 'Boya' AND s.supplier_name = 'Prime Media Gear'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Wireless Microphone' AND model_name='BY-WM3T');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Microphone', 'SM58', 'Shure vocal microphone for events', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Audio Equipment' AND b.brand_name = 'Shure' AND s.supplier_name = 'Prime Media Gear'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Microphone' AND model_name='SM58');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Portable Speaker', 'Flip 6', 'Compact Bluetooth speaker', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Audio Equipment' AND b.brand_name = 'JBL' AND s.supplier_name = 'AV Hub Distributors'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Portable Speaker' AND model_name='Flip 6');

-- Camera Equipment
INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Camera', 'Alpha A6400', 'Sony mirrorless camera', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Camera Equipment' AND b.brand_name = 'Sony' AND s.supplier_name = 'Prime Media Gear'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Camera' AND model_name='Alpha A6400');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Camera', 'EOS R50', 'Canon mirrorless camera for media production', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Camera Equipment' AND b.brand_name = 'Canon' AND s.supplier_name = 'Prime Media Gear'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Camera' AND model_name='EOS R50');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Action Camera', 'Hero 12', 'GoPro action camera', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Camera Equipment' AND b.brand_name = 'GoPro' AND s.supplier_name = 'Prime Media Gear'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Action Camera' AND model_name='Hero 12');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Webcam', 'C920', 'HD webcam for online meetings and streaming', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Camera Equipment' AND b.brand_name = 'Logitech' AND s.supplier_name = 'Campus Tech Hub'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Webcam' AND model_name='C920');

-- Lighting Equipment
INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Ring Light', 'RL-18', 'Ring light for content creation', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Lighting Equipment' AND b.brand_name = 'Xiaomi' AND s.supplier_name = 'Prime Media Gear'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Ring Light' AND model_name='RL-18');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'LED Panel Light', 'LP-600', 'LED panel light for studio and event use', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Lighting Equipment' AND b.brand_name = 'Sony' AND s.supplier_name = 'Prime Media Gear'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='LED Panel Light' AND model_name='LP-600');

-- Accessories
INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Tripod', 'Compact Tripod', 'Tripod for camera support', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Accessories' AND b.brand_name = 'Logitech' AND s.supplier_name = 'AV Hub Distributors'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Tripod' AND model_name='Compact Tripod');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'HDMI Cable', '2M HDMI', 'HDMI cable for presentation devices', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Accessories' AND b.brand_name = 'Anker' AND s.supplier_name = 'AV Hub Distributors'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='HDMI Cable' AND model_name='2M HDMI');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Extension Cord', '5-Gang Extension', 'Power extension for events and classrooms', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Accessories' AND b.brand_name = 'Anker' AND s.supplier_name = 'AV Hub Distributors'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Extension Cord' AND model_name='5-Gang Extension');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Portable SSD', 'T7 1TB', 'Portable SSD for media storage', 2, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Accessories' AND b.brand_name = 'Samsung' AND s.supplier_name = 'Campus Tech Hub'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Portable SSD' AND model_name='T7 1TB');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Drawing Tablet', 'One by Wacom', 'Drawing tablet for design and multimedia work', 3, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Accessories' AND b.brand_name = 'Logitech' AND s.supplier_name = 'Campus Tech Hub'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Drawing Tablet' AND model_name='One by Wacom');

-- Office / Networking
INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Printer', 'EcoTank L3250', 'Printer for office and event support', 3, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Office Equipment' AND b.brand_name = 'Epson' AND s.supplier_name = 'Campus Tech Hub'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Printer' AND model_name='EcoTank L3250');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Router', 'Archer AX55', 'Wireless router for temporary networking setups', 3, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Networking Equipment' AND b.brand_name = 'TP-Link' AND s.supplier_name = 'Campus Tech Hub'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Router' AND model_name='Archer AX55');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Router', 'hAP ax2', 'MikroTik router for network lab setups', 3, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Networking Equipment' AND b.brand_name = 'MikroTik' AND s.supplier_name = 'Campus Tech Hub'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Router' AND model_name='hAP ax2');

-- Sports Equipment
INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Basketball', 'Official Size 7', 'Basketball for sports borrowing', 1, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Sports Equipment' AND b.brand_name = 'Spalding' AND s.supplier_name = 'EduGear Supplies'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Basketball' AND model_name='Official Size 7');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Volleyball', 'Official Match Ball', 'Volleyball for campus sports activities', 1, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Sports Equipment' AND b.brand_name = 'Spalding' AND s.supplier_name = 'EduGear Supplies'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Volleyball' AND model_name='Official Match Ball');

INSERT IGNORE INTO items (category_id, brand_id, supplier_id, item_name, model_name, description, default_borrow_days, is_active)
SELECT c.category_id, b.brand_id, s.supplier_id, 'Badminton Racket', 'Training Racket', 'Racket for PE and sports events', 1, 1
FROM item_categories c, brands b, suppliers s
WHERE c.category_name = 'Sports Equipment' AND b.brand_name = 'Logitech' AND s.supplier_name = 'EduGear Supplies'
AND NOT EXISTS (SELECT 1 FROM items WHERE item_name='Badminton Racket' AND model_name='Training Racket');



-- ==================================================================================
-- Part 3 — Add many physical item units automatically
-- This procedure creates a lot of units per item model.
-- ==================================================================================

USE borrowbox_oltp;

DELIMITER $$

DROP PROCEDURE IF EXISTS seed_item_units $$
CREATE PROCEDURE seed_item_units()
BEGIN
    DECLARE v_good_condition_id INT;
    DECLARE v_available_status_id INT;
    DECLARE v_item_id INT;
    DECLARE v_counter INT;

    SELECT condition_id INTO v_good_condition_id
    FROM item_conditions
    WHERE condition_name = 'Good'
    LIMIT 1;

    SELECT unit_status_id INTO v_available_status_id
    FROM unit_statuses
    WHERE unit_status_name = 'Available'
    LIMIT 1;

    -- helper block pattern repeated per item

    -- Dell Latitude 5420 - 15 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Laptop' AND model_name='Latitude 5420' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 15 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('LAT5420-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-LAT5420-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-01-10', INTERVAL v_counter DAY),
            'Dell Latitude 5420 auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- HP EliteBook 840 - 10 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Laptop' AND model_name='EliteBook 840' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 10 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('ELB840-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-ELB840-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-01-15', INTERVAL v_counter DAY),
            'HP EliteBook 840 auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Lenovo ThinkPad E14 - 10 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Laptop' AND model_name='ThinkPad E14' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 10 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('TPE14-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-TPE14-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-01-20', INTERVAL v_counter DAY),
            'Lenovo ThinkPad E14 auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Acer Aspire 5 - 8 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Laptop' AND model_name='Aspire 5' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 8 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('ASP5-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-ASP5-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-01-25', INTERVAL v_counter DAY),
            'Acer Aspire 5 auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Asus Vivobook 15 - 8 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Laptop' AND model_name='Vivobook 15' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 8 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('VVB15-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-VVB15-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-02-01', INTERVAL v_counter DAY),
            'Asus Vivobook 15 auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- iPad 10th Gen - 12 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='iPad' AND model_name='iPad 10th Gen' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 12 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('IPAD10-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-IPAD10-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-02-05', INTERVAL v_counter DAY),
            'Apple iPad 10th Gen auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Samsung Galaxy Tab S9 FE - 8 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Tablet' AND model_name='Galaxy Tab S9 FE' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 8 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('GTS9FE-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-GTS9FE-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-02-10', INTERVAL v_counter DAY),
            'Samsung Galaxy Tab S9 FE auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Lenovo Tab M10 - 8 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Tablet' AND model_name='Tab M10' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 8 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('TBM10-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-TBM10-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-02-15', INTERVAL v_counter DAY),
            'Lenovo Tab M10 auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Huawei MatePad 11 - 6 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Tablet' AND model_name='MatePad 11' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 6 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('MTP11-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-MTP11-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-02-20', INTERVAL v_counter DAY),
            'Huawei MatePad 11 auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Meta Quest 2 - 5 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='VR Headset' AND model_name='Quest 2' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 5 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('MQ2-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-MQ2-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-03-01', INTERVAL v_counter DAY),
            'Meta Quest 2 auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Meta Quest 3 - 4 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='VR Headset' AND model_name='Quest 3' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 4 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('MQ3-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-MQ3-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-03-05', INTERVAL v_counter DAY),
            'Meta Quest 3 auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- VR Controller - 10 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='VR Controller' AND model_name='Touch Controller' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 10 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('VRC-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-VRC-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-03-10', INTERVAL v_counter DAY),
            'VR Controller auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Epson Projector - 5 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='LCD Projector' AND model_name='EB-X06' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 5 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('EPX06-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-EPX06-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-03-15', INTERVAL v_counter DAY),
            'Epson projector auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- BenQ Projector - 3 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='LCD Projector' AND model_name='MW560' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 3 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('BMW560-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-BMW560-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-03-20', INTERVAL v_counter DAY),
            'BenQ projector auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Portable Screen - 4 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Portable Screen' AND model_name='PS-70' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 4 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('PSC70-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-PSC70-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-03-22', INTERVAL v_counter DAY),
            'Portable screen auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Laser Pointer - 10 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Laser Pointer' AND model_name='R500' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 10 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('R500-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-R500-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-03-25', INTERVAL v_counter DAY),
            'Laser pointer auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Sound System - 5 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Sound System' AND model_name='PartyBox' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 5 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('PBX-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-PBX-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-04-01', INTERVAL v_counter DAY),
            'JBL sound system auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Wireless Microphone - 10 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Wireless Microphone' AND model_name='BY-WM3T' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 10 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('BYWM3T-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-BYWM3T-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-04-05', INTERVAL v_counter DAY),
            'Wireless microphone auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Microphone - 8 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Microphone' AND model_name='SM58' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 8 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('SM58-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-SM58-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-04-08', INTERVAL v_counter DAY),
            'Microphone auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Portable Speaker - 6 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Portable Speaker' AND model_name='Flip 6' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 6 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('FLIP6-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-FLIP6-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-04-12', INTERVAL v_counter DAY),
            'Portable speaker auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Sony Camera - 6 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Camera' AND model_name='Alpha A6400' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 6 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('A6400-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-A6400-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-04-15', INTERVAL v_counter DAY),
            'Sony Alpha A6400 auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Canon Camera - 5 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Camera' AND model_name='EOS R50' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 5 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('EOSR50-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-EOSR50-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-04-18', INTERVAL v_counter DAY),
            'Canon EOS R50 auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- GoPro - 4 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Action Camera' AND model_name='Hero 12' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 4 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('HERO12-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-HERO12-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-04-21', INTERVAL v_counter DAY),
            'GoPro Hero 12 auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Webcam - 10 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Webcam' AND model_name='C920' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 10 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('C920-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-C920-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-04-25', INTERVAL v_counter DAY),
            'Webcam auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Ring Light - 10 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Ring Light' AND model_name='RL-18' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 10 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('RL18-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-RL18-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-05-01', INTERVAL v_counter DAY),
            'Ring light auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- LED Panel Light - 6 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='LED Panel Light' AND model_name='LP-600' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 6 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('LP600-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-LP600-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-05-05', INTERVAL v_counter DAY),
            'LED panel light auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Tripod - 12 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Tripod' AND model_name='Compact Tripod' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 12 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('TRI-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-TRI-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-05-10', INTERVAL v_counter DAY),
            'Tripod auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- HDMI Cable - 20 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='HDMI Cable' AND model_name='2M HDMI' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 20 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('HDMI2M-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-HDMI2M-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-05-12', INTERVAL v_counter DAY),
            'HDMI cable auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Extension Cord - 20 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Extension Cord' AND model_name='5-Gang Extension' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 20 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('EXT5G-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-EXT5G-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-05-15', INTERVAL v_counter DAY),
            'Extension cord auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Portable SSD - 10 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Portable SSD' AND model_name='T7 1TB' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 10 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('T71TB-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-T71TB-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-05-18', INTERVAL v_counter DAY),
            'Portable SSD auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Drawing Tablet - 8 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Drawing Tablet' AND model_name='One by Wacom' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 8 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('WBW-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-WBW-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-05-21', INTERVAL v_counter DAY),
            'Drawing tablet auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Printer - 4 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Printer' AND model_name='EcoTank L3250' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 4 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('ETL3250-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-ETL3250-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-05-25', INTERVAL v_counter DAY),
            'Printer auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- TP-Link Router - 6 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Router' AND model_name='Archer AX55' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 6 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('AX55-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-AX55-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-05-28', INTERVAL v_counter DAY),
            'TP-Link router auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- MikroTik Router - 4 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Router' AND model_name='hAP ax2' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 4 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('HAPAX2-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-HAPAX2-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-06-01', INTERVAL v_counter DAY),
            'MikroTik router auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Basketball - 12 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Basketball' AND model_name='Official Size 7' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 12 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('BASK7-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-BASK7-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-06-05', INTERVAL v_counter DAY),
            'Basketball auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Volleyball - 10 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Volleyball' AND model_name='Official Match Ball' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 10 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('VOLLEY-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-VOLLEY-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-06-08', INTERVAL v_counter DAY),
            'Volleyball auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

    -- Badminton Racket - 12 units
    SELECT item_id INTO v_item_id FROM items WHERE item_name='Badminton Racket' AND model_name='Training Racket' LIMIT 1;
    SET v_counter = 1;
    WHILE v_counter <= 12 DO
        INSERT IGNORE INTO item_units (item_id, asset_tag, serial_number, condition_id, unit_status_id, purchase_date, notes)
        VALUES (
            v_item_id,
            CONCAT('BDRKT-', LPAD(v_counter, 4, '0')),
            CONCAT('SN-BDRKT-', LPAD(v_counter, 5, '0')),
            v_good_condition_id,
            v_available_status_id,
            DATE_ADD('2025-06-12', INTERVAL v_counter DAY),
            'Badminton racket auto-generated unit'
        );
        SET v_counter = v_counter + 1;
    END WHILE;

END $$

DELIMITER ;

-- ==================================================================================
-- Run this seeder
-- ==================================================================================

CALL seed_item_units();

-- ==================================================================================
-- Check if the data is there
-- ==================================================================================

-- Count item master records
SELECT COUNT(*) AS total_items
FROM items;


-- Count physical units
SELECT COUNT(*) AS total_item_units
FROM item_units;

-- See units per item
SELECT
    i.item_name,
    i.model_name,
    COUNT(iu.unit_id) AS total_units
FROM items i
LEFT JOIN item_units iu ON i.item_id = iu.item_id
GROUP BY i.item_id, i.item_name, i.model_name
ORDER BY total_units DESC, i.item_name, i.model_name;


-- See units per category
SELECT
    ic.category_name,
    COUNT(iu.unit_id) AS total_units
FROM item_categories ic
INNER JOIN items i ON ic.category_id = i.category_id
LEFT JOIN item_units iu ON i.item_id = iu.item_id
GROUP BY ic.category_id, ic.category_name
ORDER BY total_units DESC;


-- ==================================================================================
-- Populating Transactions
-- ==================================================================================




-- ==================================================================================
-- Generate more Borrowers
-- ==================================================================================
USE borrowbox_oltp;

DELIMITER $$

DROP PROCEDURE IF EXISTS seed_more_borrowers $$
CREATE PROCEDURE seed_more_borrowers(
    IN p_students INT,
    IN p_faculty INT,
    IN p_employees INT
)
BEGIN
    DECLARE v_student_type_id INT;
    DECLARE v_faculty_type_id INT;
    DECLARE v_employee_type_id INT;

    DECLARE v_college_id INT;
    DECLARE v_department_id INT;
    DECLARE v_course_id INT;

    DECLARE v_seq INT DEFAULT 1;
    DECLARE v_first_name VARCHAR(100);
    DECLARE v_middle_name VARCHAR(100);
    DECLARE v_last_name VARCHAR(100);
    DECLARE v_sex VARCHAR(10);
    DECLARE v_email VARCHAR(150);
    DECLARE v_phone VARCHAR(30);
    DECLARE v_university_id VARCHAR(30);

    DECLARE v_i INT DEFAULT 1;

    SELECT borrower_type_id INTO v_student_type_id
    FROM borrower_types
    WHERE borrower_type_name = 'Student'
    LIMIT 1;

    SELECT borrower_type_id INTO v_faculty_type_id
    FROM borrower_types
    WHERE borrower_type_name = 'Faculty'
    LIMIT 1;

    SELECT borrower_type_id INTO v_employee_type_id
    FROM borrower_types
    WHERE borrower_type_name = 'Employee'
    LIMIT 1;

    -- ============================================
    -- STUDENTS
    -- ============================================
    SET v_i = 1;
    WHILE v_i <= p_students DO

        SELECT
            c.college_id,
            d.department_id,
            cr.course_id
        INTO
            v_college_id,
            v_department_id,
            v_course_id
        FROM colleges c
        INNER JOIN departments d ON d.college_id = c.college_id
        INNER JOIN courses cr ON cr.department_id = d.department_id
        ORDER BY RAND()
        LIMIT 1;

        SET v_first_name = ELT(
            FLOOR(1 + RAND() * 20),
            'John','Maria','Jose','Angela','Mark','Paolo','Kevin','Jessa','Carla','Miguel',
            'Andrea','Joshua','Nicole','Franz','Patricia','Daniel','Rica','Nathan','Alyssa','Vincent'
        );

        SET v_middle_name = ELT(
            FLOOR(1 + RAND() * 15),
            'Santos','Reyes','Cruz','Garcia','Lopez','Torres','Flores','Ramos','Diaz','Mendoza',
            'Castro','Rivera','Aquino','Gonzales','Villanueva'
        );

        SET v_last_name = ELT(
            FLOOR(1 + RAND() * 20),
            'Dela Cruz','Reyes','Santos','Garcia','Torres','Flores','Ramos','Mendoza','Castro','Rivera',
            'Lopez','Aquino','Navarro','Villanueva','Domingo','Fernandez','Bautista','Soriano','Salazar','Lim'
        );

        SET v_sex = IF(RAND() < 0.5, 'Male', 'Female');
        SET v_phone = CONCAT('09', LPAD(FLOOR(RAND() * 1000000000), 9, '0'));
        SET v_university_id = CONCAT('STU-', YEAR(CURDATE()), '-', LPAD(v_i, 5, '0'));
        SET v_email = CONCAT(
            LOWER(REPLACE(v_first_name, ' ', '')), '.',
            LOWER(REPLACE(v_last_name, ' ', '')), '.s',
            LPAD(v_i, 4, '0'),
            '@borrowbox.edu'
        );

        INSERT IGNORE INTO borrowers (
            borrower_type_id,
            university_id_no,
            first_name,
            middle_name,
            last_name,
            sex,
            email,
            phone_number,
            college_id,
            department_id,
            course_id,
            is_active,
            created_at
        )
        VALUES (
            v_student_type_id,
            v_university_id,
            v_first_name,
            v_middle_name,
            v_last_name,
            v_sex,
            v_email,
            v_phone,
            v_college_id,
            v_department_id,
            v_course_id,
            1,
            NOW()
        );

        SET v_i = v_i + 1;
    END WHILE;

    -- ============================================
    -- FACULTY
    -- ============================================
    SET v_i = 1;
    WHILE v_i <= p_faculty DO

        SELECT
            c.college_id,
            d.department_id
        INTO
            v_college_id,
            v_department_id
        FROM colleges c
        INNER JOIN departments d ON d.college_id = c.college_id
        ORDER BY RAND()
        LIMIT 1;

        SET v_first_name = ELT(
            FLOOR(1 + RAND() * 20),
            'Carla','Michael','Anna','Robert','Catherine','Luis','Therese','Adrian','Janine','Brian',
            'Monica','Jerome','Cynthia','Patrick','Vanessa','Albert','Melissa','Francis','Leah','Noel'
        );

        SET v_middle_name = ELT(
            FLOOR(1 + RAND() * 15),
            'Santos','Reyes','Cruz','Garcia','Lopez','Torres','Flores','Ramos','Diaz','Mendoza',
            'Castro','Rivera','Aquino','Gonzales','Villanueva'
        );

        SET v_last_name = ELT(
            FLOOR(1 + RAND() * 20),
            'Lim','Tan','Garcia','Reyes','Santos','Domingo','Soriano','Mendoza','Rivera','Salazar',
            'Navarro','Fernandez','Aquino','Castillo','Bautista','Ong','Gomez','Chua','Torres','Cruz'
        );

        SET v_sex = IF(RAND() < 0.5, 'Male', 'Female');
        SET v_phone = CONCAT('09', LPAD(FLOOR(RAND() * 1000000000), 9, '0'));
        SET v_university_id = CONCAT('FAC-', YEAR(CURDATE()), '-', LPAD(v_i, 5, '0'));
        SET v_email = CONCAT(
            LOWER(REPLACE(v_first_name, ' ', '')), '.',
            LOWER(REPLACE(v_last_name, ' ', '')), '.f',
            LPAD(v_i, 4, '0'),
            '@borrowbox.edu'
        );

        INSERT IGNORE INTO borrowers (
            borrower_type_id,
            university_id_no,
            first_name,
            middle_name,
            last_name,
            sex,
            email,
            phone_number,
            college_id,
            department_id,
            course_id,
            is_active,
            created_at
        )
        VALUES (
            v_faculty_type_id,
            v_university_id,
            v_first_name,
            v_middle_name,
            v_last_name,
            v_sex,
            v_email,
            v_phone,
            v_college_id,
            v_department_id,
            NULL,
            1,
            NOW()
        );

        SET v_i = v_i + 1;
    END WHILE;

    -- ============================================
    -- EMPLOYEES
    -- ============================================
    SET v_i = 1;
    WHILE v_i <= p_employees DO

        SELECT
            c.college_id,
            d.department_id
        INTO
            v_college_id,
            v_department_id
        FROM colleges c
        INNER JOIN departments d ON d.college_id = c.college_id
        ORDER BY RAND()
        LIMIT 1;

        SET v_first_name = ELT(
            FLOOR(1 + RAND() * 20),
            'Ryan','Shiela','Ronald','Pat','Grace','Kenneth','Liza','Marco','Eunice','Harold',
            'Joy','Ramon','Ella','Tristan','Nina','Dominic','Faith','Paul','Kim','Joan'
        );

        SET v_middle_name = ELT(
            FLOOR(1 + RAND() * 15),
            'Santos','Reyes','Cruz','Garcia','Lopez','Torres','Flores','Ramos','Diaz','Mendoza',
            'Castro','Rivera','Aquino','Gonzales','Villanueva'
        );

        SET v_last_name = ELT(
            FLOOR(1 + RAND() * 20),
            'Ramos','Torres','Diaz','Mendoza','Reyes','Santos','Castro','Rivera','Garcia','Lopez',
            'Aquino','Navarro','Villanueva','Fernandez','Bautista','Gomez','Tan','Lim','Cruz','Soriano'
        );

        SET v_sex = IF(RAND() < 0.5, 'Male', 'Female');
        SET v_phone = CONCAT('09', LPAD(FLOOR(RAND() * 1000000000), 9, '0'));
        SET v_university_id = CONCAT('EMP-', YEAR(CURDATE()), '-', LPAD(v_i, 5, '0'));
        SET v_email = CONCAT(
            LOWER(REPLACE(v_first_name, ' ', '')), '.',
            LOWER(REPLACE(v_last_name, ' ', '')), '.e',
            LPAD(v_i, 4, '0'),
            '@borrowbox.edu'
        );

        INSERT IGNORE INTO borrowers (
            borrower_type_id,
            university_id_no,
            first_name,
            middle_name,
            last_name,
            sex,
            email,
            phone_number,
            college_id,
            department_id,
            course_id,
            is_active,
            created_at
        )
        VALUES (
            v_employee_type_id,
            v_university_id,
            v_first_name,
            v_middle_name,
            v_last_name,
            v_sex,
            v_email,
            v_phone,
            v_college_id,
            v_department_id,
            NULL,
            1,
            NOW()
        );

        SET v_i = v_i + 1;
    END WHILE;

END $$

DELIMITER ;



-- ==================================================================================
-- Seed Data
-- ==================================================================================

CALL seed_more_borrowers(600, 120, 180);




-- ==================================================================================
-- Check Results
-- ==================================================================================
SELECT
    bt.borrower_type_name,
    COUNT(*) AS total_borrowers
FROM borrowers b
INNER JOIN borrower_types bt
    ON b.borrower_type_id = bt.borrower_type_id
GROUP BY bt.borrower_type_name;


-- ==================================================================================
-- Generate Historical Borrow Transactions
-- This procedure will:
-- 
-- create transactions from 2025-01-01 to 2026-03-31
-- skip Sundays
-- create 50 to 100 transactions per day
-- assign random borrowers
-- randomize purpose
-- randomize status:
-- mostly Returned
-- some Released
-- some Overdue
-- a few Cancelled
-- ==================================================================================

USE borrowbox_oltp;

DELIMITER $$

DROP PROCEDURE IF EXISTS generate_borrow_transactions_range $$
CREATE PROCEDURE generate_borrow_transactions_range(
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_min_per_day INT,
    IN p_max_per_day INT
)
BEGIN
    DECLARE v_date DATE;
    DECLARE v_daily_transactions INT;
    DECLARE v_counter INT;
    DECLARE v_seq BIGINT DEFAULT 1;

    DECLARE v_borrower_id INT;
    DECLARE v_status_id INT;
    DECLARE v_status_name VARCHAR(50);

    DECLARE v_request_dt DATETIME;
    DECLARE v_approved_dt DATETIME;
    DECLARE v_release_dt DATETIME;
    DECLARE v_due_dt DATETIME;
    DECLARE v_return_dt DATETIME;

    DECLARE v_purpose VARCHAR(255);
    DECLARE v_transaction_code VARCHAR(40);
    DECLARE v_status_rand INT;

    SET v_date = p_start_date;

    WHILE v_date <= p_end_date DO

        -- Skip Sunday
        IF DAYOFWEEK(v_date) <> 1 THEN

            SET v_daily_transactions = FLOOR(p_min_per_day + (RAND() * (p_max_per_day - p_min_per_day + 1)));
            SET v_counter = 1;

            WHILE v_counter <= v_daily_transactions DO

                SELECT borrower_id
                INTO v_borrower_id
                FROM borrowers
                WHERE is_active = 1
                ORDER BY RAND()
                LIMIT 1;

                SET v_request_dt = TIMESTAMP(
                    v_date,
                    MAKETIME(
                        FLOOR(8 + RAND() * 9),
                        FLOOR(RAND() * 60),
                        FLOOR(RAND() * 60)
                    )
                );

                SET v_status_rand = FLOOR(1 + RAND() * 100);

                IF v_status_rand <= 72 THEN
                    SET v_status_name = 'Returned';
                ELSEIF v_status_rand <= 87 THEN
                    SET v_status_name = 'Released';
                ELSEIF v_status_rand <= 97 THEN
                    SET v_status_name = 'Overdue';
                ELSE
                    SET v_status_name = 'Cancelled';
                END IF;

                SELECT borrow_status_id
                INTO v_status_id
                FROM borrow_statuses
                WHERE borrow_status_name = v_status_name
                LIMIT 1;

                SET v_approved_dt = DATE_ADD(v_request_dt, INTERVAL FLOOR(1 + RAND() * 4) HOUR);

                IF v_status_name = 'Cancelled' THEN
                    SET v_release_dt = NULL;
                    SET v_due_dt = DATE_ADD(v_request_dt, INTERVAL FLOOR(1 + RAND() * 5) DAY);
                    SET v_return_dt = NULL;
                ELSE
                    SET v_release_dt = DATE_ADD(v_approved_dt, INTERVAL FLOOR(1 + RAND() * 3) HOUR);
                    SET v_due_dt = DATE_ADD(v_release_dt, INTERVAL FLOOR(1 + RAND() * 5) DAY);

                    IF v_status_name = 'Returned' THEN
                        SET v_return_dt = DATE_ADD(v_release_dt, INTERVAL FLOOR(1 + RAND() * 4) DAY);

                        IF v_return_dt > v_due_dt THEN
                            SET v_return_dt = DATE_SUB(v_due_dt, INTERVAL FLOOR(RAND() * 10) HOUR);
                        END IF;
                    ELSE
                        SET v_return_dt = NULL;
                    END IF;
                END IF;

                SET v_purpose = ELT(
                    FLOOR(1 + RAND() * 12),
                    'Classroom presentation',
                    'Capstone defense',
                    'Student project activity',
                    'Faculty lecture',
                    'Office meeting',
                    'Department event',
                    'Seminar workshop',
                    'Multimedia production',
                    'Campus sports event',
                    'Training session',
                    'Research demonstration',
                    'Academic exhibit'
                );

                SET v_transaction_code = CONCAT(
                    'BBX-',
                    DATE_FORMAT(v_date, '%Y%m%d'),
                    '-',
                    LPAD(v_seq, 6, '0')
                );

                INSERT INTO borrow_transactions (
                    transaction_code,
                    borrower_id,
                    borrow_status_id,
                    request_date,
                    approved_date,
                    release_date,
                    due_date,
                    return_date,
                    purpose,
                    remarks,
                    approved_by,
                    received_by,
                    returned_to,
                    created_at
                )
                VALUES (
                    v_transaction_code,
                    v_borrower_id,
                    v_status_id,
                    v_request_dt,
                    IF(v_status_name = 'Cancelled', NULL, v_approved_dt),
                    v_release_dt,
                    v_due_dt,
                    v_return_dt,
                    v_purpose,
                    'Auto-generated historical OLTP demo data',
                    IF(v_status_name = 'Cancelled', NULL, 'System Admin'),
                    IF(v_status_name IN ('Released', 'Returned', 'Overdue'), 'BorrowBox Staff', NULL),
                    IF(v_status_name = 'Returned', 'BorrowBox Staff', NULL),
                    v_request_dt
                );

                SET v_seq = v_seq + 1;
                SET v_counter = v_counter + 1;

            END WHILE;

        END IF;

        SET v_date = DATE_ADD(v_date, INTERVAL 1 DAY);

    END WHILE;

END $$

DELIMITER ;

-- ==================================================================================
-- Generate Data
-- ==================================================================================
CALL generate_borrow_transactions_range('2025-01-01', '2026-03-31', 50, 100);



-- ==================================================================================
-- Check Results
-- ==================================================================================
SELECT COUNT(*) AS total_transactions
FROM borrow_transactions;



-- ==================================================================================
-- Monthly summary check
-- ==================================================================================
SELECT
    YEAR(request_date) AS year_no,
    MONTH(request_date) AS month_no,
    COUNT(*) AS total_transactions
FROM borrow_transactions
GROUP BY YEAR(request_date), MONTH(request_date)
ORDER BY year_no, month_no;



-- ==================================================================================
-- Generate Transaction Item Details
-- ==================================================================================
USE borrowbox_oltp;

DELIMITER $$

DROP PROCEDURE IF EXISTS generate_borrow_transaction_items_all $$
CREATE PROCEDURE generate_borrow_transaction_items_all()
BEGIN
    DECLARE done INT DEFAULT 0;

    DECLARE v_transaction_id INT;
    DECLARE v_return_date DATETIME;
    DECLARE v_status_name VARCHAR(50);

    DECLARE v_item_count INT;
    DECLARE v_i INT;
    DECLARE v_unit_id INT;

    DECLARE v_condition_good INT;
    DECLARE v_condition_in INT;

    DECLARE cur CURSOR FOR
        SELECT
            bt.borrow_transaction_id,
            bt.return_date,
            bs.borrow_status_name
        FROM borrow_transactions bt
        INNER JOIN borrow_statuses bs
            ON bt.borrow_status_id = bs.borrow_status_id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    SELECT condition_id
    INTO v_condition_good
    FROM item_conditions
    WHERE condition_name = 'Good'
    LIMIT 1;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO v_transaction_id, v_return_date, v_status_name;

        IF done = 1 THEN
            LEAVE read_loop;
        END IF;

        IF v_status_name <> 'Cancelled' THEN

            SET v_item_count = FLOOR(1 + RAND() * 3);
            SET v_i = 1;

            WHILE v_i <= v_item_count DO

                SET v_unit_id = NULL;

                SELECT iu.unit_id
                INTO v_unit_id
                FROM item_units iu
                WHERE iu.unit_id NOT IN (
                    SELECT bti.unit_id
                    FROM borrow_transaction_items bti
                    WHERE bti.borrow_transaction_id = v_transaction_id
                )
                ORDER BY RAND()
                LIMIT 1;

                IF v_return_date IS NULL THEN
                    SET v_condition_in = NULL;
                ELSE
                    SET v_condition_in = v_condition_good;
                END IF;

                IF v_unit_id IS NOT NULL THEN
                    INSERT IGNORE INTO borrow_transaction_items (
                        borrow_transaction_id,
                        unit_id,
                        condition_out_id,
                        condition_in_id,
                        item_returned_at,
                        item_remarks
                    )
                    VALUES (
                        v_transaction_id,
                        v_unit_id,
                        v_condition_good,
                        v_condition_in,
                        v_return_date,
                        'Auto-generated transaction detail'
                    );
                END IF;

                SET v_i = v_i + 1;

            END WHILE;

        END IF;

    END LOOP;

    CLOSE cur;

END $$

DELIMITER ;


-- ==================================================================================
-- Run it
-- ==================================================================================
CALL generate_borrow_transaction_items_all();


-- ==================================================================================
-- Check Results
-- ==================================================================================
SELECT COUNT(*) AS total_transaction_items
FROM borrow_transaction_items;



-- ==================================================================================
-- Average items per transaction
-- ==================================================================================
SELECT
    AVG(item_count) AS avg_items_per_transaction
FROM (
    SELECT
        borrow_transaction_id,
        COUNT(*) AS item_count
    FROM borrow_transaction_items
    GROUP BY borrow_transaction_id
) x;



-- ==================================================================================
-- Useful validation queries
--
--
-- Borrowers by type
-- ==================================================================================

SELECT
    bt.borrower_type_name,
    COUNT(*) AS total_borrowers
FROM borrowers b
INNER JOIN borrower_types bt
    ON b.borrower_type_id = bt.borrower_type_id
GROUP BY bt.borrower_type_name;


-- ==================================================================================
-- Transactions by status
-- ==================================================================================
SELECT
    bs.borrow_status_name,
    COUNT(*) AS total_transactions
FROM borrow_transactions bt
INNER JOIN borrow_statuses bs
    ON bt.borrow_status_id = bs.borrow_status_id
GROUP BY bs.borrow_status_name
ORDER BY total_transactions DESC;


-- ==================================================================================
-- Transactions by month
-- ==================================================================================
SELECT
    DATE_FORMAT(request_date, '%Y-%m') AS month_label,
    COUNT(*) AS total_transactions
FROM borrow_transactions
GROUP BY DATE_FORMAT(request_date, '%Y-%m')
ORDER BY month_label;


-- ==================================================================================
-- Top borrowed items
-- ==================================================================================
SELECT
    i.item_name,
    i.model_name,
    COUNT(*) AS total_borrowed
FROM borrow_transaction_items bti
INNER JOIN item_units iu
    ON bti.unit_id = iu.unit_id
INNER JOIN items i
    ON iu.item_id = i.item_id
GROUP BY i.item_id, i.item_name, i.model_name
ORDER BY total_borrowed DESC
LIMIT 15;



-- ==================================================================================
-- Borrowings by borrower type
-- ==================================================================================

SELECT
    bt.borrower_type_name,
    COUNT(*) AS total_transactions
FROM borrow_transactions t
INNER JOIN borrowers b
    ON t.borrower_id = b.borrower_id
INNER JOIN borrower_types bt
    ON b.borrower_type_id = bt.borrower_type_id
GROUP BY bt.borrower_type_name
ORDER BY total_transactions DESC;


-- ==================================================================================
-- 
-- ==================================================================================
SELECT COUNT(*) FROM borrowers;
SELECT COUNT(*) FROM borrow_transactions;
SELECT COUNT(*) FROM borrow_transaction_items;


