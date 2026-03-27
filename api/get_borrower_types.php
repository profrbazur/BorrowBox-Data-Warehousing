<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../db.php';

$mockData = [
    ['borrower_type'=>'Student', 'total'=>38000],
    ['borrower_type'=>'Faculty', 'total'=>12000],
    ['borrower_type'=>'Staff',   'total'=>4000],
    ['borrower_type'=>'Guest',   'total'=>3204],
];

$pdo = getOlapConnection();

if ($pdo === null) {
    echo json_encode(['status'=>'fallback','data'=>$mockData]);
    exit;
}

try {
    $sql = "
        SELECT
            b.borrower_type,
            COUNT(f.fact_id) AS total
        FROM fact_borrowing f
        JOIN dim_borrower b ON f.borrower_key = b.borrower_key
        GROUP BY b.borrower_type
        ORDER BY total DESC
    ";

    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll();

    $data = array_map(function($row) {
        return [
            'borrower_type' => $row['borrower_type'],
            'total'         => (int)$row['total'],
        ];
    }, $rows);

    echo json_encode(['status'=>'ok','data'=>$data]);

} catch (PDOException $e) {
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage(),
        'data'    => $mockData,
    ]);
}
