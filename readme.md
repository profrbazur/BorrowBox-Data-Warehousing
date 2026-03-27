# BorrowBox — OLTP to OLAP Visual Demo

A classroom presentation tool that visually teaches students how transactional data moves from an OLTP database into an OLAP data warehouse through an ETL pipeline, ending in an analytics dashboard.

---

## What This Project Does

This is **not a CRUD system**. It is a read-only visual teaching demo that walks through:

1. **OLTP** — The normalized BorrowBox transaction database
2. **OLAP Design** — Star schema data warehouse design
3. **Extract** — Simulates reading data from borrowbox_oltp
4. **Transform** — Simulates data transformations (date keys, name concatenation, overdue flags)
5. **Load** — Simulates writing into borrowbox_olap dimension and fact tables
6. **OLAP Dashboard** — Charts and KPIs powered by real or mock data

The demo auto-plays section by section, making it ideal for live classroom projection.

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | HTML, Tailwind CSS (CDN), Chart.js (CDN), Vanilla JS |
| Backend  | PHP (plain, no framework)           |
| Database | MySQL / MariaDB                     |
| Server   | XAMPP or Laragon (local)            |

---

## Project Structure

```
borrowboxdw/
├── index.html                  # Main single-page app
├── styles.css                  # Custom CSS
├── script.js                   # All frontend logic and mock data
├── config.php                  # Database credentials
├── db.php                      # PDO connection helper
├── api/
│   ├── get_oltp_summary.php    # Live OLTP row counts
│   ├── get_olap_summary.php    # Live OLAP KPI counts
│   ├── get_borrowings_by_month.php
│   ├── get_top_categories.php
│   ├── get_borrower_types.php
│   ├── get_status_distribution.php
│   ├── get_top_items.php
│   └── get_drillthrough.php
├── OLTPQueries.md              # Full OLTP DDL + seed data + sample queries
└── OLAPQueries.md              # Full OLAP DDL (star schema)
```

---

## Prerequisites

- [XAMPP](https://www.apachefriends.org/) or [Laragon](https://laragon.org/) installed
- PHP 7.4 or higher (with PDO and PDO_MySQL enabled)
- MySQL / MariaDB (included with XAMPP/Laragon)
- A modern browser (Chrome, Edge, Firefox)
- Internet connection (for Tailwind CSS and Chart.js CDN)

---

## Setup Instructions

### Step 1 — Place the project files

Copy the entire `borrowboxdw/` folder into your web server root:

- **XAMPP:** `C:\xampp\htdocs\borrowboxdw\`
- **Laragon:** `C:\laragon\www\borrowboxdw\`

### Step 2 — Start your local server

- Open XAMPP Control Panel and start **Apache** and **MySQL**
- Or open Laragon and click **Start All**

### Step 3 — Create the OLTP database

1. Open your browser and go to `http://localhost/phpmyadmin`
2. Click **SQL** in the top menu
3. Open `OLTPQueries.md` in any text editor
4. Copy **all the SQL** from the top of the file down through the sample data inserts (everything before the "Useful OLTP Queries" section)
5. Paste into phpMyAdmin's SQL editor and click **Go**

This will create the `borrowbox_oltp` database with:
- 15 tables (borrowers, items, transactions, etc.)
- Reference/lookup seed data (borrower types, colleges, departments, courses, categories, brands, suppliers, conditions, statuses)
- 6 sample borrowers
- 10 item masters with 13 physical units
- 3 sample borrow transactions with 4 transaction item detail rows

> **Optional:** To test with more realistic data volumes, add additional borrowers, items, units, and transactions following the same INSERT patterns shown in the file.

### Step 4 — Create the OLAP database

1. In phpMyAdmin, click **SQL**
2. Open `OLAPQueries.md` in any text editor
3. Copy all the SQL and paste it into the SQL editor
4. Click **Go**

This will create the `borrowbox_olap` database with:
- 6 dimension tables (dim_date, dim_borrower, dim_borrower_type, dim_college, dim_department, dim_category, dim_item, dim_status)
- 1 fact table (fact_borrowing)

> **Note:** The OLAP tables will be empty until you run the ETL process. The dashboard will automatically fall back to built-in demo data if the OLAP tables have no rows.

### Step 5 — Configure database credentials

Open `config.php` and update if needed:

```php
define('DB_HOST', 'localhost');
define('DB_OLTP', 'borrowbox_oltp');
define('DB_OLAP', 'borrowbox_olap');
define('DB_USER', 'root');
define('DB_PASS', '');        // Change this if your MySQL root has a password
define('DB_CHARSET', 'utf8mb4');
```

Default XAMPP/Laragon settings use `root` with an empty password, so no changes are needed unless you set a custom password.

### Step 6 — Open the app

Go to:

```
http://localhost/borrowboxdw/index.html
```

The demo will load and auto-play through all sections.

---

## Running the Demo

| Control | Description |
|---------|-------------|
| **Start Demo** button | Begins the auto-play sequence from Overview |
| **Pause / Resume** | Pauses or resumes the auto-play |
| **Restart** | Restarts from the Overview section |
| Sidebar menu items | Click any section to jump to it manually (pauses auto-play) |

Auto-play timing is approximately 5–8 seconds per section.

---

## Data Mode Indicator

The top bar shows a status badge:

- **Live Data Connected** — PHP API reached both databases successfully
- **Demo Data Mode** — Database unavailable; built-in mock data is used

The UI works fully in Demo Data Mode. The database is not required for the visual demo.

---

## Live Data vs Demo Data

| Feature | Demo Mode (no DB) | Live Mode (with DB) |
|---------|-------------------|---------------------|
| Extract section | Simulated logs | Real OLTP row counts |
| Load section | Simulated counters | Real OLAP row counts |
| Dashboard KPIs | Mock values | Real aggregated values |
| Charts | Mock data | Real queries from OLAP |
| Drill-through table | Mock rows | Real fact_borrowing joins |

---

## Populating the OLAP (ETL)

The OLAP database is not automatically populated by this demo — the ETL screens are visual simulations only. This is intentional: **the demo does not write to the database**.

To populate the OLAP with real data for a live dashboard, you would need to run an ETL script separately that:

1. Populates `dim_date` with a range of dates (e.g., 2024-01-01 to 2026-12-31)
2. Inserts dimension records from OLTP into dim_borrower, dim_item, etc.
3. Inserts fact rows into `fact_borrowing` from `borrow_transactions` joined with `borrow_transaction_items`

This ETL is left as an exercise for students, which is the educational intent of the demo.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank page or JS errors | Open browser DevTools (F12) → Console tab for details |
| "Demo Data Mode" badge always showing | Check that Apache and MySQL are running; verify credentials in `config.php` |
| phpMyAdmin shows access denied | Ensure MySQL is started in XAMPP/Laragon |
| Charts not rendering | Ensure you have internet access (Chart.js loads from CDN) |
| Page styles look broken | Ensure you have internet access (Tailwind CSS loads from CDN) |

---

## Domain Context

BorrowBox is a university equipment borrowing system. The sample data includes:

- Laptops, tablets, iPads
- VR headsets
- Cameras, tripods
- LCD projectors
- Sound systems, microphones
- Sports equipment

Colleges included: CCS, COE, COB, CAS
Borrower types: Student, Faculty, Employee
