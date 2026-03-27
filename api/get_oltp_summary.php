<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../db.php';

$fallback = [
    'status'           => 'fallback',
    'borrowers'        => 906,
    'transactions'     => 28990,
    'transaction_items'=> 56204,
    'items'            => 87,
    'item_units'       => 1204,
    'borrower_types'   => 4,
    'colleges'         => 12,
    'departments'      => 38,
    'courses'          => 142,
    'total_records'    => 88638,
];

$pdo = getOltpConnection();

if ($pdo === null) {
    echo json_encode(array_merge($fallback, ['message' => 'Could not connect to borrowbox_oltp']));
    exit;
}

try {
    $counts = [];

    $tables = [
        'borrowers'               => 'borrowers',
        'transactions'            => 'borrow_transactions',
        'transaction_items'       => 'borrow_transaction_items',
        'items'                   => 'items',
        'item_units'              => 'item_units',
        'borrower_types'          => 'borrower_types',
        'colleges'                => 'colleges',
        'departments'             => 'departments',
        'courses'                 => 'courses',
    ];

    foreach ($tables as $key => $table) {
        $stmt = $pdo->query("SELECT COUNT(*) AS cnt FROM `{$table}`");
        $row  = $stmt->fetch();
        $counts[$key] = (int) $row['cnt'];
    }

    $counts['total_records'] = array_sum($counts);
    $counts['status']        = 'ok';

    echo json_encode($counts);

} catch (PDOException $e) {
    echo json_encode(array_merge($fallback, [
        'status'  => 'error',
        'message' => $e->getMessage(),
    ]));
}
