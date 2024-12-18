<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

include '../db_connection.php';

$data = json_decode(file_get_contents('php://input'), true);

$nome = isset($data['nome']) ? $data['nome'] : '';
$email = isset($data['email']) ? $data['email'] : ''; // Corrigido para $email
$telefone = isset($data['telefone']) ? $data['telefone'] : '';
$placa = isset($data['placa']) ? $data['placa'] : '';

if ($nome && $email && $telefone && $placa) { // Validando o email também
    try {
        $sql = "INSERT INTO clients (nome, email, telefone, placa) VALUES (:nome, :email, :telefone, :placa)";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':email', $email); // Corrigido o bindParam para email
        $stmt->bindParam(':telefone', $telefone);
        $stmt->bindParam(':placa', $placa);
        $stmt->execute();

        echo json_encode(['message' => 'Cliente adicionado com sucesso']);
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Dados incompletos']);
}

?>
