<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../db.php';

$type  = isset($_GET['type'])  ? trim($_GET['type'])  : '';
$value = isset($_GET['value']) ? trim($_GET['value']) : '';

// ── Mock drill-through data per type ──────────────────────────────────────────
$mockByType = [
    'category' => [
        ['borrower'=>'Maria Santos',   'item'=>'MacBook Pro 14"',        'date'=>'2024-10-12','status'=>'Returned On Time'],
        ['borrower'=>'Juan dela Cruz', 'item'=>'Dell XPS 15',            'date'=>'2024-10-14','status'=>'Returned On Time'],
        ['borrower'=>'Ana Reyes',      'item'=>'Lenovo ThinkPad X1',     'date'=>'2024-10-18','status'=>'Overdue Returned'],
        ['borrower'=>'Carlo Lim',      'item'=>'MacBook Pro 14"',        'date'=>'2024-10-20','status'=>'Currently Borrowed'],
        ['borrower'=>'Diane Go',       'item'=>'HP Spectre x360',        'date'=>'2024-10-22','status'=>'Returned On Time'],
    ],
    'borrower_type' => [
        ['borrower'=>'Maria Santos',   'item'=>'iPad Pro 12.9"',         'date'=>'2024-09-05','status'=>'Returned On Time'],
        ['borrower'=>'Kevin Tan',      'item'=>'Sony A7 III Camera',     'date'=>'2024-09-08','status'=>'Returned On Time'],
        ['borrower'=>'Rina Cruz',      'item'=>'Samsung Galaxy Tab S9',  'date'=>'2024-09-10','status'=>'Overdue Returned'],
        ['borrower'=>'Paolo Mendez',   'item'=>'Epson EB-X51 Projector', 'date'=>'2024-09-15','status'=>'Currently Borrowed'],
        ['borrower'=>'Luz Bautista',   'item'=>'JBL EON615 Speaker',     'date'=>'2024-09-18','status'=>'Returned On Time'],
    ],
    'month' => [
        ['borrower'=>'Roel Garcia',    'item'=>'Meta Quest 3',           'date'=>'2024-10-01','status'=>'Returned On Time'],
        ['borrower'=>'Jenny Flores',   'item'=>'MacBook Pro 14"',        'date'=>'2024-10-03','status'=>'Currently Borrowed'],
        ['borrower'=>'Arlo Navarro',   'item'=>'Rode NT-USB Microphone', 'date'=>'2024-10-07','status'=>'Returned On Time'],
        ['borrower'=>'Cath Villanueva','item'=>'iPad Pro 12.9"',         'date'=>'2024-10-09','status'=>'Overdue Returned'],
        ['borrower'=>'Dave Aguilar',   'item'=>'Dell XPS 15',            'date'=>'2024-10-11','status'=>'Returned On Time'],
    ],
    'item' => [
        ['borrower'=>'Maria Santos',   'item'=>'MacBook Pro 14"', 'date'=>'2024-08-02','status'=>'Returned On Time'],
        ['borrower'=>'Tom Ramos',      'item'=>'MacBook Pro 14"', 'date'=>'2024-08-15','status'=>'Returned On Time'],
        ['borrower'=>'Luz Bautista',   'item'=>'MacBook Pro 14"', 'date'=>'2024-09-01','status'=>'Overdue Returned'],
        ['borrower'=>'Ana Reyes',      'item'=>'MacBook Pro 14"', 'date'=>'2024-09-20','status'=>'Returned On Time'],
        ['borrower'=>'Carlo Lim',      'item'=>'MacBook Pro 14"', 'date'=>'2024-10-04','status'=>'Currently Borrowed'],
    ],
    'status' => [
        ['borrower'=>'Juan dela Cruz', 'item'=>'Sony A7 III Camera',    'date'=>'2024-07-10','status'=>'Overdue Returned'],
        ['borrower'=>'Diane Go',       'item'=>'iPad Pro 12.9"',        'date'=>'2024-07-18','status'=>'Overdue Returned'],
        ['borrower'=>'Kevin Tan',      'item'=>'Meta Quest 3',          'date'=>'2024-08-05','status'=>'Overdue Returned'],
        ['borrower'=>'Rina Cruz',      'item'=>'JBL EON615 Speaker',    'date'=>'2024-08-20','status'=>'Overdue Returned'],
        ['borrower'=>'Paolo Mendez',   'item'=>'Epson EB-X51 Projector','date'=>'2024-09-14','status'=>'Overdue Returned'],
    ],
];

$pdo = getOlapConnection();

if ($pdo === null || !in_array($type, ['category','borrower_type','month','item','status'])) {
    $rows = $mockByType[$type] ?? $mockByType['category'];
    echo json_encode(['status'=>'fallback','type'=>$type,'value'=>$value,'data'=>$rows]);
    exit;
}

try {
    $sql    = '';
    $params = [];

    $base = "
        SELECT
            b.full_name  AS borrower,
            i.item_name  AS item,
            d.full_date  AS date,
            s.status_name AS status
        FROM fact_borrowing f
        JOIN dim_borrower b  ON f.borrower_key  = b.borrower_key
        JOIN dim_item i      ON f.item_key       = i.item_key
        JOIN dim_date d      ON f.date_key        = d.date_key
        JOIN dim_status s    ON f.status_key      = s.status_key
    ";

    switch ($type) {
        case 'category':
            $sql = $base . "
                JOIN dim_category c ON f.category_key = c.category_key
                WHERE c.category_name = :val
                LIMIT 10
            ";
            $params[':val'] = $value;
            break;

        case 'borrower_type':
            $sql = $base . "WHERE b.borrower_type = :val LIMIT 10";
            $params[':val'] = $value;
            break;

        case 'month':
            // value expected as "YYYY-MM"
            $parts = explode('-', $value);
            $yr  = $parts[0] ?? date('Y');
            $mo  = $parts[1] ?? 1;
            $sql = $base . "WHERE d.year = :yr AND d.month = :mo LIMIT 10";
            $params[':yr'] = (int)$yr;
            $params[':mo'] = (int)$mo;
            break;

        case 'item':
            $sql = $base . "
                JOIN dim_item i2 ON f.item_key = i2.item_key
                WHERE i2.item_name = :val
                LIMIT 10
            ";
            $params[':val'] = $value;
            break;

        case 'status':
            $sql = $base . "WHERE s.status_name = :val LIMIT 10";
            $params[':val'] = $value;
            break;

        default:
            $sql = $base . "LIMIT 10";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    echo json_encode(['status'=>'ok','type'=>$type,'value'=>$value,'data'=>$rows]);

} catch (PDOException $e) {
    $rows = $mockByType[$type] ?? $mockByType['category'];
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage(),
        'type'    => $type,
        'value'   => $value,
        'data'    => $rows,
    ]);
}
