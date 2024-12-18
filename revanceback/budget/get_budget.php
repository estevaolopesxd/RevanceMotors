<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

include '../db_connection.php';  // Conexão com o banco de dados

try {
    // SQL para buscar todos os orçamentos com as informações relacionadas
    $sql = "
        SELECT 
            b.id AS orçamento_id,
            b.id_cliente,
            b.nome AS orçamento_nome,
            b.endereco AS orçamento_endereco,
            b.cidade AS orçamento_cidade,
            b.estado AS orçamento_estado,
            b.telefone AS orçamento_telefone,
            b.celular AS orçamento_celular,
            b.modelo AS orçamento_modelo,
            b.ano AS orçamento_ano,
            b.placa AS orçamento_placa,
            b.km AS orçamento_km,
            b.data_orcamento AS orçamento_data_orcamento,
            b.pecas AS orçamento_pecas
        FROM budget b
        ORDER BY b.data_orcamento DESC
    ";

    // Preparar e executar a consulta SQL
    $stmt = $conn->prepare($sql);
    $stmt->execute();

    // Buscar todos os orçamentos
    $orcamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Retornar os dados dos orçamentos em formato JSON
    echo json_encode([
        'orcamentos' => $orcamentos
    ]);
} catch (PDOException $e) {
    // Caso haja erro, retornar a mensagem de erro
    echo json_encode(['error' => $e->getMessage()]);
}
?>
