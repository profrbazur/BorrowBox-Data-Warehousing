<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../db.php';

$mockData = [
    ['category_name'=>'Laptops',          'total'=>12400],
    ['category_name'=>'Tablets',          'total'=>8900],
    ['category_name'=>'iPads',            'total'=>7200],
    ['category_name'=>'Cameras',          'total'=>5100],
    ['category_name'=>'LCD Projectors',   'total'=>4800],
    ['category_name'=>'VR Headsets',      'total'=>3200],
    ['category_name'=>'Sound Systems',    'total'=>2900],
    ['category_name'=>'Microphones',      'total'=>2400],
    ['category_name'=>'Tripods',          'total'=>1800],
    ['category_name'=>'Sports Equipment', 'total'=>1500],
    ['category_name'=>'Others',           'total'=>1204],
];

$pdo = getOlapConnection();

if ($pdo === null) {
    echo json_encode(['status'=>'fallback','data'=>$mockData]);
    exit;
}

try {
    $sql = "
        SELECT
            c.category_name,
            COUNT(f.fact_id) AS total
        FROM fact_borrowing f
        JOIN dim_category c ON f.category_key = c.category_key
        GROUP BY c.category_name
        ORDER BY total DESC
        LIMIT 10
    ";

    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll();

    $data = array_map(function($row) {
        return [
            'category_name' => $row['category_name'],
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
