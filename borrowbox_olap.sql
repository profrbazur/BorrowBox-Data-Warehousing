/*
 Navicat Premium Data Transfer

 Source Server         : localdb
 Source Server Type    : MySQL
 Source Server Version : 80030
 Source Host           : localhost:3306
 Source Schema         : borrowbox_olap

 Target Server Type    : MySQL
 Target Server Version : 80030
 File Encoding         : 65001

 Date: 28/03/2026 07:03:57
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for dim_borrower
-- ----------------------------
DROP TABLE IF EXISTS `dim_borrower`;
CREATE TABLE `dim_borrower`  (
  `borrower_key` int NOT NULL AUTO_INCREMENT,
  `borrower_id` int NOT NULL,
  `borrower_type_id` int NOT NULL,
  `university_id_no` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `sex` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `college_id` int NULL DEFAULT NULL,
  `department_id` int NULL DEFAULT NULL,
  `course_id` int NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  PRIMARY KEY (`borrower_key`) USING BTREE,
  UNIQUE INDEX `uq_dim_borrower_id`(`borrower_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dim_borrower
-- ----------------------------

-- ----------------------------
-- Table structure for dim_borrower_type
-- ----------------------------
DROP TABLE IF EXISTS `dim_borrower_type`;
CREATE TABLE `dim_borrower_type`  (
  `borrower_type_key` int NOT NULL AUTO_INCREMENT,
  `borrower_type_id` int NOT NULL,
  `borrower_type_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`borrower_type_key`) USING BTREE,
  UNIQUE INDEX `uq_dim_borrower_type_id`(`borrower_type_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dim_borrower_type
-- ----------------------------

-- ----------------------------
-- Table structure for dim_category
-- ----------------------------
DROP TABLE IF EXISTS `dim_category`;
CREATE TABLE `dim_category`  (
  `category_key` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `category_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`category_key`) USING BTREE,
  UNIQUE INDEX `uq_dim_category_id`(`category_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dim_category
-- ----------------------------

-- ----------------------------
-- Table structure for dim_college
-- ----------------------------
DROP TABLE IF EXISTS `dim_college`;
CREATE TABLE `dim_college`  (
  `college_key` int NOT NULL AUTO_INCREMENT,
  `college_id` int NOT NULL,
  `college_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `college_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`college_key`) USING BTREE,
  UNIQUE INDEX `uq_dim_college_id`(`college_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dim_college
-- ----------------------------

-- ----------------------------
-- Table structure for dim_date
-- ----------------------------
DROP TABLE IF EXISTS `dim_date`;
CREATE TABLE `dim_date`  (
  `date_key` int NOT NULL,
  `full_date` date NOT NULL,
  `day_no` int NOT NULL,
  `month_no` int NOT NULL,
  `month_name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `quarter_no` int NOT NULL,
  `year_no` int NOT NULL,
  `week_no` int NOT NULL,
  `day_name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_weekend` tinyint(1) NOT NULL,
  PRIMARY KEY (`date_key`) USING BTREE,
  UNIQUE INDEX `full_date`(`full_date` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dim_date
-- ----------------------------

-- ----------------------------
-- Table structure for dim_department
-- ----------------------------
DROP TABLE IF EXISTS `dim_department`;
CREATE TABLE `dim_department`  (
  `department_key` int NOT NULL AUTO_INCREMENT,
  `department_id` int NOT NULL,
  `college_id` int NOT NULL,
  `department_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `department_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`department_key`) USING BTREE,
  UNIQUE INDEX `uq_dim_department_id`(`department_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dim_department
-- ----------------------------

-- ----------------------------
-- Table structure for dim_item
-- ----------------------------
DROP TABLE IF EXISTS `dim_item`;
CREATE TABLE `dim_item`  (
  `item_key` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `category_id` int NOT NULL,
  `brand_id` int NULL DEFAULT NULL,
  `supplier_id` int NULL DEFAULT NULL,
  `item_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `model_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `default_borrow_days` int NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  PRIMARY KEY (`item_key`) USING BTREE,
  UNIQUE INDEX `uq_dim_item_id`(`item_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dim_item
-- ----------------------------

-- ----------------------------
-- Table structure for dim_status
-- ----------------------------
DROP TABLE IF EXISTS `dim_status`;
CREATE TABLE `dim_status`  (
  `status_key` int NOT NULL AUTO_INCREMENT,
  `borrow_status_id` int NOT NULL,
  `borrow_status_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`status_key`) USING BTREE,
  UNIQUE INDEX `uq_dim_status_id`(`borrow_status_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dim_status
-- ----------------------------

-- ----------------------------
-- Table structure for fact_borrowing
-- ----------------------------
DROP TABLE IF EXISTS `fact_borrowing`;
CREATE TABLE `fact_borrowing`  (
  `fact_borrowing_id` bigint NOT NULL AUTO_INCREMENT,
  `transaction_code` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `borrow_transaction_id` int NOT NULL,
  `borrow_transaction_item_id` int NOT NULL,
  `request_date_key` int NOT NULL,
  `due_date_key` int NOT NULL,
  `return_date_key` int NULL DEFAULT NULL,
  `borrower_key` int NOT NULL,
  `borrower_type_key` int NOT NULL,
  `college_key` int NULL DEFAULT NULL,
  `department_key` int NULL DEFAULT NULL,
  `item_key` int NOT NULL,
  `category_key` int NOT NULL,
  `status_key` int NOT NULL,
  `quantity_borrowed` int NOT NULL DEFAULT 1,
  `quantity_returned` int NOT NULL DEFAULT 0,
  `overdue_flag` tinyint(1) NOT NULL DEFAULT 0,
  `returned_flag` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`fact_borrowing_id`) USING BTREE,
  INDEX `idx_fact_request_date_key`(`request_date_key` ASC) USING BTREE,
  INDEX `idx_fact_due_date_key`(`due_date_key` ASC) USING BTREE,
  INDEX `idx_fact_return_date_key`(`return_date_key` ASC) USING BTREE,
  INDEX `idx_fact_borrower_key`(`borrower_key` ASC) USING BTREE,
  INDEX `idx_fact_item_key`(`item_key` ASC) USING BTREE,
  INDEX `idx_fact_category_key`(`category_key` ASC) USING BTREE,
  INDEX `idx_fact_status_key`(`status_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of fact_borrowing
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
