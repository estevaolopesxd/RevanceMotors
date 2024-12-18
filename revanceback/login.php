<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Configuração do banco de dados
$host = 'localhost';
$dbname = 'revancemotors_db';
$username = 'root';
$password = '';

try {
    // Conectar ao banco de dados
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Erro de conexão
    echo json_encode([
        'status' => 'error',
        'message' => 'Erro de conexão com o banco de dados: ' . $e->getMessage()
    ]);
    exit();
}

// Obter dados da requisição
$data = json_decode(file_get_contents("php://input"));

if (isset($data->email) && isset($data->password)) {
    $email = $data->email;
    $password = $data->password;

    try {
        // Preparar a consulta SQL para buscar o usuário e suas permissões
        $stmt = $pdo->prepare('SELECT ID, nome, email, password, status, data_criacao, permissao FROM usuarios WHERE email = :email');
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        // Verificar se o usuário existe
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            // Remover a senha antes de enviar a resposta
            unset($user['password']);

            // Gerar um token de autenticação (simulação)
            $user['token'] = bin2hex(random_bytes(16));  // Apenas um exemplo de token

            // Responder com sucesso e dados do usuário
            echo json_encode([
                'status' => 'success',
                'message' => 'Login bem-sucedido',
                'user' => $user
            ]);
        } else {
            // Usuário ou senha inválidos
            echo json_encode([
                'status' => 'error',
                'message' => 'Email ou senha inválidos'
            ]);
        }
    } catch (PDOException $e) {
        // Erro na consulta
        echo json_encode([
            'status' => 'error',
            'message' => 'Erro ao consultar o banco de dados: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Preencha todos os campos'
    ]);
}
?>
