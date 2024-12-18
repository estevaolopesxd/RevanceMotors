<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

session_start();

// Responder a OPTIONS com um status 200
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Adicione esta linha para depuração
var_dump($_SESSION); // Verifica o conteúdo da sessão

// Verifique se o usuário está autenticado
if (!isset($_SESSION['user_email'])) {
    http_response_code(401);
    echo json_encode(array("status" => "error", "message" => "Usuário não autenticado"));
    exit();
}

$email = $_SESSION['user_email'];

// Conecte-se ao banco de dados
$mysqli = new mysqli("localhost", "revancemotors_db", "root", "");

if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(array("status" => "error", "message" => "Erro de conexão com o banco de dados"));
    exit();
}

// Prepare a consulta para obter permissões
$stmt = $mysqli->prepare("SELECT permissao FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    $permissions = explode(',', $user['permissao']); // Supondo que permissões sejam armazenadas como uma lista separada por vírgulas
    echo json_encode(array("status" => "success", "permissions" => $permissions));
} else {
    http_response_code(404);
    echo json_encode(array("status" => "error", "message" => "Usuário não encontrado"));
}

$stmt->close();
$mysqli->close();
?>
