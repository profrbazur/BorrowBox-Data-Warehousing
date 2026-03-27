<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../db.php';

$monthNames = [
    1=>'Jan',2=>'Feb',3=>'Mar',4=>'Apr',5=>'May',6=>'Jun',
    7=>'Jul',8=>'Aug',9=>'Sep',10=>'Oct',11=>'Nov',12=>'Dec'
];

$mockData = [
    ['year'=>2024,'month'=>1, 'month_name'=>'Jan','count'=>2100],
    ['year'=>2024,'month'=>2, 'month_name'=>'Feb','count'=>1980],
    ['year'=>2024,'month'=>3, 'month_name'=>'Mar','count'=>2450],
    ['year'=>2024,'month'=>4, 'month_name'=>'Apr','count'=>2300],
    ['year'=>2024,'month'=>5, 'month_name'=>'May','count'=>2600],
    ['year'=>2024,'month'=>6, 'month_name'=>'Jun','count'=>1750],
    ['year'=>2024,'month'=>7, 'month_name'=>'Jul','count'=>1400],
    ['year'=>2024,'month'=>8, 'month_name'=>'Aug','count'=>1600],
    ['year'=>2024,'month'=>9, 'month_name'=>'Sep','count'=>2800],
    ['year'=>2024,'month'=>10,'month_name'=>'Oct','count'=>3100],
    ['year'=>2024,'month'=>11,'month_name'=>'Nov','count'=>2950],
    ['year'=>2024,'month'=>12,'month_name'=>'Dec','count'=>1960],
];

$year = isset($_GET['year']) ? (int) $_GET['year'] : null;

$pdo = getOlapConnection();

if ($pdo === null) {
    $result = $year ? array_filter($mockData, fn($r) => $r['year'] === $year) : $mockData;
    echo json_encode(['status'=>'fallback','data'=>array_values($result)]);
    exit;
}

try {
    $sql = "
        SELECT
            d.year,
            d.month,
            COUNT(f.fact_id) AS `count`
        FROM fact_borrowing f
        JOIN dim_date d ON f.date_key = d.date_key
    ";

    $params = [];
    if ($year) {
        $sql .= " WHERE d.year = :year";
        $params[':year'] = $year;
    }

    $sql .= " GROUP BY d.year, d.month ORDER BY d.year, d.month";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $data = array_map(function($row) use ($monthNames) {
        return [
            'year'       => (int)$row['year'],
            'month'      => (int)$row['month'],
            'month_name' => $monthNames[(int)$row['month']] ?? 'N/A',
            'count'      => (int)$row['count'],
        ];
    }, $rows);

    echo json_encode(['status'=>'ok','data'=>$data]);

} catch (PDOException $e) {
    $result = $year ? array_filter($mockData, fn($r) => $r['year'] === $year) : $mockData;
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage(),
        'data'    => array_values($result),
    ]);
}
