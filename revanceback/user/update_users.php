<?php
header("Access-Control-Allow-Origin: https://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS, GET, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Configuração de conexão com o banco de dados
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "revancemotors_db";

// Cria a conexão com o banco de dados
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica a conexão
if ($conn->connect_error) {
    die(json_encode(["error" => "Conexão falhou: " . $conn->connect_error]));
}

// Obtém a operação do parâmetro POST
$operation = isset($_POST['operation']) ? $_POST['operation'] : '';

// Prepara a resposta padrão
$response = ["status" => "error", "message" => "Operação não reconhecida"];

// Baseado na operação, executa a ação apropriada
switch ($operation) {
    case 'update':
        // Obtém dados do usuário
        $id = isset($_POST['ID']) ? intval($_POST['ID']) : 0;
        $nome = isset($_POST['nome']) ? $conn->real_escape_string($_POST['nome']) : '';
        $email = isset($_POST['email']) ? $conn->real_escape_string($_POST['email']) : '';
        $status = isset($_POST['status']) ? $conn->real_escape_string($_POST['status']) : '';
        $permissao = isset($_POST['permissao']) ? $conn->real_escape_string($_POST['permissao']) : '';

        // Atualiza informações do usuário
        $sql = "UPDATE usuarios SET nome=?, email=?, status=?, permissao=? WHERE ID=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ssssi', $nome, $email, $status, $permissao, $id);

        if ($stmt->execute()) {
            $response = ["status" => "success", "message" => "Registro atualizado com sucesso"];
        } else {
            $response = ["status" => "error", "message" => "Erro ao atualizar registro: " . $stmt->error];
        }
        $stmt->close();
        break;

    case 'delete':
        // Obtém ID do usuário
        $id = isset($_POST['ID']) ? intval($_POST['ID']) : 0;

        // Deleta usuário
        $sql = "DELETE FROM usuarios WHERE ID=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $id);

        if ($stmt->execute()) {
            $response = ["status" => "success", "message" => "Registro excluído com sucesso"];
        } else {
            $response = ["status" => "error", "message" => "Erro ao excluir registro: " . $stmt->error];
        }
        $stmt->close();
        break;

    case 'change_status':
        // Obtém ID e novo status do usuário
        $id = isset($_POST['ID']) ? intval($_POST['ID']) : 0;
        $status = isset($_POST['status']) ? $conn->real_escape_string($_POST['status']) : '';

        // Atualiza apenas o status do usuário
        $sql = "UPDATE usuarios SET status=? WHERE ID=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('si', $status, $id);

        if ($stmt->execute()) {
            $response = ["status" => "success", "message" => "Status atualizado com sucesso"];
        } else {
            $response = ["status" => "error", "message" => "Erro ao atualizar status: " . $stmt->error];
        }
        $stmt->close();
        break;
}

// Fecha a conexão
$conn->close();

// Retorna a resposta como JSON
echo json_encode($response);
?>
