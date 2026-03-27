<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../db.php';

$mockData = [
    ['rank'=>1,  'item_name'=>'MacBook Pro 14"',         'category_name'=>'Laptops',        'total'=>3420],
    ['rank'=>2,  'item_name'=>'iPad Pro 12.9"',          'category_name'=>'iPads',           'total'=>2980],
    ['rank'=>3,  'item_name'=>'Dell XPS 15',             'category_name'=>'Laptops',        'total'=>2750],
    ['rank'=>4,  'item_name'=>'Sony A7 III Camera',      'category_name'=>'Cameras',        'total'=>2310],
    ['rank'=>5,  'item_name'=>'Samsung Galaxy Tab S9',   'category_name'=>'Tablets',        'total'=>2100],
    ['rank'=>6,  'item_name'=>'Epson EB-X51 Projector',  'category_name'=>'LCD Projectors', 'total'=>1980],
    ['rank'=>7,  'item_name'=>'Meta Quest 3',            'category_name'=>'VR Headsets',    'total'=>1750],
    ['rank'=>8,  'item_name'=>'Lenovo ThinkPad X1',      'category_name'=>'Laptops',        'total'=>1640],
    ['rank'=>9,  'item_name'=>'Rode NT-USB Microphone',  'category_name'=>'Microphones',    'total'=>1520],
    ['rank'=>10, 'item_name'=>'JBL EON615 Speaker',      'category_name'=>'Sound Systems',  'total'=>1380],
];

$pdo = getOlapConnection();

if ($pdo === null) {
    echo json_encode(['status'=>'fallback','data'=>$mockData]);
    exit;
}

try {
    $sql = "
        SELECT
            i.item_name,
            c.category_name,
            COUNT(f.fact_id) AS total
        FROM fact_borrowing f
        JOIN dim_item i     ON f.item_key     = i.item_key
        JOIN dim_category c ON f.category_key = c.category_key
        GROUP BY i.item_name, c.category_name
        ORDER BY total DESC
        LIMIT 10
    ";

    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll();

    $data = [];
    foreach ($rows as $idx => $row) {
        $data[] = [
            'rank'          => $idx + 1,
            'item_name'     => $row['item_name'],
            'category_name' => $row['category_name'],
            'total'         => (int)$row['total'],
        ];
    }

    echo json_encode(['status'=>'ok','data'=>$data]);

} catch (PDOException $e) {
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage(),
        'data'    => $mockData,
    ]);
}
