<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../db.php';

$fallback = [
    'status'        => 'fallback',
    'fact_borrowing'=> 56204,
    'dim_borrower'  => 906,
    'dim_item'      => 87,
    'dim_date'      => 3650,
    'dim_category'  => 15,
    'dim_status'    => 5,
];

$pdo = getOlapConnection();

if ($pdo === null) {
    echo json_encode(array_merge($fallback, ['message' => 'Could not connect to borrowbox_olap']));
    exit;
}

try {
    $tables = [
        'fact_borrowing' => 'fact_borrowing',
        'dim_borrower'   => 'dim_borrower',
        'dim_item'       => 'dim_item',
        'dim_date'       => 'dim_date',
        'dim_category'   => 'dim_category',
        'dim_status'     => 'dim_status',
    ];

    $counts = ['status' => 'ok'];

    foreach ($tables as $key => $table) {
        $stmt = $pdo->query("SELECT COUNT(*) AS cnt FROM `{$table}`");
        $row  = $stmt->fetch();
        $counts[$key] = (int) $row['cnt'];
    }

    echo json_encode($counts);

} catch (PDOException $e) {
    echo json_encode(array_merge($fallback, [
        'status'  => 'error',
        'message' => $e->getMessage(),
    ]));
}
