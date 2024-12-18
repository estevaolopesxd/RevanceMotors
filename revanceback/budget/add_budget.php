<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Incluir a conexão com o banco de dados
include '../db_connection.php';

// Recebe os dados do corpo da requisição
$data = json_decode(file_get_contents("php://input"), true);

// Debug - Verifique se o JSON foi decodificado corretamente
if (!$data) {
    echo json_encode(["status" => "error", "message" => "Falha ao decodificar JSON"]);
    exit;
}

// Definindo variáveis e atribuindo valores com segurança
$id_cliente = $data['id_cliente'] ?? null;
$nome = $data['nome'] ?? null;
$endereco = $data['endereco'] ?? null;
$cidade = $data['cidade'] ?? null;
$estado = $data['estado'] ?? null;
$telefone = $data['telefone'] ?? null;
$celular = $data['celular'] ?? null;
$modelo = $data['modelo'] ?? null;
$ano = $data['ano'] ?? null;
$placa = $data['placa'] ?? null;
$km = $data['km'] ?? null;
$data_orcamento = $data['data_orcamento'] ?? null;
$pecas = isset($data['pecas']) && !empty($data['pecas']) ? json_encode($data['pecas']) : null;
$mao_de_obra = isset($data['mao_de_obra']) && !empty($data['mao_de_obra']) ? json_encode($data['mao_de_obra']) : null;
$total = $data['total'] ?? null;
$total_geral = $data['total_geral'] ?? null;
$observacao = $data['observacao'] ?? null;
$status = $data['status'] ?? 'não realizado'; // Default para 'não realizado'

// Agora, verificamos se pelo menos o id_cliente está presente
if ($id_cliente !== null) {
    // Prepara a consulta SQL com placeholders
    $sql = "INSERT INTO budget 
            (id_cliente, nome, endereco, cidade, estado, telefone, celular, modelo, ano, placa, km, data_orcamento, pecas, mao_de_obra, total, total_geral, observacao, status) 
            VALUES 
            (:id_cliente, :nome, :endereco, :cidade, :estado, :telefone, :celular, :modelo, :ano, :placa, :km, :data_orcamento, :pecas, :mao_de_obra, :total, :total_geral, :observacao, :status)";

    // Prepara o statement
    $stmt = $conn->prepare($sql);

    // Bind dos parâmetros com os valores
    $stmt->bindParam(':id_cliente', $id_cliente);
    $stmt->bindParam(':nome', $nome);
    $stmt->bindParam(':endereco', $endereco);
    $stmt->bindParam(':cidade', $cidade);
    $stmt->bindParam(':estado', $estado);
    $stmt->bindParam(':telefone', $telefone);
    $stmt->bindParam(':celular', $celular);
    $stmt->bindParam(':modelo', $modelo);
    $stmt->bindParam(':ano', $ano);
    $stmt->bindParam(':placa', $placa);
    $stmt->bindParam(':km', $km);
    $stmt->bindParam(':data_orcamento', $data_orcamento);
    $stmt->bindParam(':pecas', $pecas, PDO::PARAM_STR);
    $stmt->bindParam(':mao_de_obra', $mao_de_obra, PDO::PARAM_STR);
    $stmt->bindParam(':total', $total);
    $stmt->bindParam(':total_geral', $total_geral);
    $stmt->bindParam(':observacao', $observacao);
    $stmt->bindParam(':status', $status);

    // Executa a consulta
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Orçamento salvo com sucesso!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Erro ao salvar o orçamento: " . $stmt->errorInfo()[2]]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "id_cliente é obrigatório"]);
}

// Fecha a conexão
$conn = null;
?>
