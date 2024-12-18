<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // Permite requisições de qualquer origem
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Métodos permitidos
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Cabeçalhos permitidos

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit();
}

// Captura o corpo da requisição JSON
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Verifica se todos os dados necessários foram recebidos
if (!isset($data['fullName']) || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(array("status" => "error", "message" => "Dados incompletos"));
    exit();
}

// Conexão com o banco de dados
$mysqli = new mysqli("localhost", "root", "", "revancemotors_db");

if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(array("status" => "error", "message" => "Erro de conexão com o banco de dados"));
    exit();
}

// Hash da senha antes de armazenar no banco de dados
$hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);

// Preparando a consulta SQL
$stmt = $mysqli->prepare("INSERT INTO usuarios (nome, email, password, status, data_criacao, permissao) VALUES (?, ?, ?, 'Ativo', NOW(), 'usuario')");
if ($stmt === false) {
    http_response_code(500);
    echo json_encode(array("status" => "error", "message" => "Erro ao preparar a consulta SQL"));
    exit();
}

// Bind dos parâmetros da consulta
$stmt->bind_param("sss", $data['fullName'], $data['email'], $hashedPassword);

if ($stmt->execute()) {
    echo json_encode(array("status" => "success", "message" => "Usuário registrado com sucesso"));
} else {
    http_response_code(500);
    echo json_encode(array("status" => "error", "message" => "Erro ao registrar usuário: " . $stmt->error));
}

$stmt->close();
$mysqli->close();
?>
