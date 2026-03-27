<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../db.php';

$mockData = [
    ['status_name'=>'Returned On Time',  'total'=>24841],
    ['status_name'=>'Overdue Returned',  'total'=>3201],
    ['status_name'=>'Currently Borrowed','total'=>948],
];

$pdo = getOlapConnection();

if ($pdo === null) {
    echo json_encode(['status'=>'fallback','data'=>$mockData]);
    exit;
}

try {
    $sql = "
        SELECT
            s.status_name,
            COUNT(f.fact_id) AS total
        FROM fact_borrowing f
        JOIN dim_status s ON f.status_key = s.status_key
        GROUP BY s.status_name
        ORDER BY total DESC
    ";

    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll();

    $data = array_map(function($row) {
        return [
            'status_name' => $row['status_name'],
            'total'       => (int)$row['total'],
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
