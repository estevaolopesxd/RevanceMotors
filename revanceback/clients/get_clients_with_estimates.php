<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

include 'db_connection.php';

try {
    $sql = "SELECT c.id AS client_id, c.nome, c.telefone, c.placa, c.data_criacao, 
            e.id AS estimate_id, e.descricao, e.valor, e.status, e.data_criacao AS estimate_data_criacao
            FROM clients c
            LEFT JOIN estimates e ON c.id = e.client_id";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $clients_with_estimates = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($clients_with_estimates);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
