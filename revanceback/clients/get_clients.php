<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

include '../db_connection.php';

$search = isset($_GET['search']) ? $_GET['search'] : '';
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = 10;
$offset = ($page - 1) * $limit;

try {
    $sql = "SELECT * FROM clients WHERE 
            nome LIKE :search OR 
            telefone LIKE :search OR 
            placa LIKE :search 
            LIMIT :limit OFFSET :offset";
    
    $stmt = $conn->prepare($sql);
    $stmt->bindValue(':search', '%' . $search . '%', PDO::PARAM_STR);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $countSql = "SELECT COUNT(*) FROM clients WHERE 
                 nome LIKE :search OR 
                 telefone LIKE :search OR 
                 placa LIKE :search";
    $countStmt = $conn->prepare($countSql);
    $countStmt->bindValue(':search', '%' . $search . '%', PDO::PARAM_STR);
    $countStmt->execute();
    $totalUsers = $countStmt->fetchColumn();
    $totalPages = ceil($totalUsers / $limit);

    echo json_encode([
        'users' => $users,
        'totalPages' => $totalPages
    ]);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
