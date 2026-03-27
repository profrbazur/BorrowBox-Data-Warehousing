-- ==================================================================================
-- Create the OLAP database
-- ==================================================================================
DROP DATABASE IF EXISTS borrowbox_olap;
CREATE DATABASE borrowbox_olap;
USE borrowbox_olap;


-- ==================================================================================
-- Create the dimension tables

-- dim_date
-- ==================================================================================

USE borrowbox_olap;

CREATE TABLE dim_date (
    date_key INT PRIMARY KEY,                 -- format: YYYYMMDD
    full_date DATE NOT NULL UNIQUE,
    day_no INT NOT NULL,
    month_no INT NOT NULL,
    month_name VARCHAR(20) NOT NULL,
    quarter_no INT NOT NULL,
    year_no INT NOT NULL,
    week_no INT NOT NULL,
    day_name VARCHAR(20) NOT NULL,
    is_weekend TINYINT(1) NOT NULL
);

-- ==================================================================================
-- dim_borrower_type
-- ==================================================================================

CREATE TABLE dim_borrower_type (
    borrower_type_key INT AUTO_INCREMENT PRIMARY KEY,
    borrower_type_id INT NOT NULL,
    borrower_type_name VARCHAR(50) NOT NULL,
    UNIQUE KEY uq_dim_borrower_type_id (borrower_type_id)
);


-- ==================================================================================
-- dim_college
-- ==================================================================================
CREATE TABLE dim_college (
    college_key INT AUTO_INCREMENT PRIMARY KEY,
    college_id INT NOT NULL,
    college_code VARCHAR(20) NOT NULL,
    college_name VARCHAR(150) NOT NULL,
    UNIQUE KEY uq_dim_college_id (college_id)
);



-- ==================================================================================
-- dim_department
-- ==================================================================================
CREATE TABLE dim_department (
    department_key INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    college_id INT NOT NULL,
    department_code VARCHAR(20) NOT NULL,
    department_name VARCHAR(150) NOT NULL,
    UNIQUE KEY uq_dim_department_id (department_id)
);



-- ==================================================================================
-- dim_borrower
-- ==================================================================================
CREATE TABLE dim_borrower (
    borrower_key INT AUTO_INCREMENT PRIMARY KEY,
    borrower_id INT NOT NULL,
    borrower_type_id INT NOT NULL,
    university_id_no VARCHAR(30) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    sex VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL,
    college_id INT NULL,
    department_id INT NULL,
    course_id INT NULL,
    is_active TINYINT(1) NOT NULL,
    UNIQUE KEY uq_dim_borrower_id (borrower_id)
);


-- ==================================================================================
-- dim_category
-- ==================================================================================
CREATE TABLE dim_category (
    category_key INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    UNIQUE KEY uq_dim_category_id (category_id)
);


-- ==================================================================================
-- dim_item
-- ==================================================================================
CREATE TABLE dim_item (
    item_key INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    category_id INT NOT NULL,
    brand_id INT NULL,
    supplier_id INT NULL,
    item_name VARCHAR(150) NOT NULL,
    model_name VARCHAR(100) NULL,
    description VARCHAR(255) NULL,
    default_borrow_days INT NOT NULL,
    is_active TINYINT(1) NOT NULL,
    UNIQUE KEY uq_dim_item_id (item_id)
);



-- ==================================================================================
-- dim_status
-- ==================================================================================
CREATE TABLE dim_status (
    status_key INT AUTO_INCREMENT PRIMARY KEY,
    borrow_status_id INT NOT NULL,
    borrow_status_name VARCHAR(50) NOT NULL,
    UNIQUE KEY uq_dim_status_id (borrow_status_id)
);



-- ==================================================================================
-- 3) Create the fact table

	-- This will hold the measurable borrowing records.
	-- 
	-- Grain of the fact table
	-- 
	-- Each row represents:
	-- 
	-- one borrowed unit in one borrow transaction
-- ==================================================================================

CREATE TABLE fact_borrowing (
    fact_borrowing_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    transaction_code VARCHAR(40) NOT NULL,
    borrow_transaction_id INT NOT NULL,
    borrow_transaction_item_id INT NOT NULL,

    request_date_key INT NOT NULL,
    due_date_key INT NOT NULL,
    return_date_key INT NULL,

    borrower_key INT NOT NULL,
    borrower_type_key INT NOT NULL,
    college_key INT NULL,
    department_key INT NULL,
    item_key INT NOT NULL,
    category_key INT NOT NULL,
    status_key INT NOT NULL,

    quantity_borrowed INT NOT NULL DEFAULT 1,
    quantity_returned INT NOT NULL DEFAULT 0,
    overdue_flag TINYINT(1) NOT NULL DEFAULT 0,
    returned_flag TINYINT(1) NOT NULL DEFAULT 0,

    INDEX idx_fact_request_date_key (request_date_key),
    INDEX idx_fact_due_date_key (due_date_key),
    INDEX idx_fact_return_date_key (return_date_key),
    INDEX idx_fact_borrower_key (borrower_key),
    INDEX idx_fact_item_key (item_key),
    INDEX idx_fact_category_key (category_key),
    INDEX idx_fact_status_key (status_key)
);



