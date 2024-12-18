import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Grid, TextField, Typography, Paper, Divider } from '@mui/material';

const OrcamentoEntregue = ({ user }) => {
  const pdfRef = useRef();

  // Função para formatar a data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Verificar se os dados estão definidos antes de exibir
  const getValueOrDefault = (value) => (value ? value : 'Não informado');



  const salvarNoBanco = async () => {
    // Função para coletar as informações das tabelas
    const coletarDadosTabela = (prefixo) => {
      const dadosTabela = [];
      for (let i = 0; i < 10; i++) {
        const quant = document.getElementById(`${prefixo}-quantidade-${i}`)?.value;
        const peca = document.getElementById(`${prefixo}-peca-${i}`)?.value;
        const un = document.getElementById(`${prefixo}-unidade-${i}`)?.value;
        const preco = document.getElementById(`${prefixo}-preco-${i}`)?.value;

        if (quant && peca && un && preco) {
          dadosTabela.push({
            quant,
            peca,
            un,
            preco
          });
        }
      }
      return dadosTabela;
    };

    // Coletando os dados das tabelas de Peças e Mão de Obra
    const pecas = coletarDadosTabela('pecas');
    const mao_de_obra = coletarDadosTabela('maoDeObra');

    const dados = {
      id_cliente: user?.id,  // ID do cliente
      nome: user?.nome,
      endereco: user?.endereco,
      cidade: user?.cidade,
      estado: user?.uf,
      telefone: user?.telefone,
      celular: user?.celular,
      modelo: user?.modelo,
      ano: user?.ano,
      placa: user?.placa,
      km: user?.km,
      data_orcamento: '2024-12-14',  // Data do orçamento
      pecas: pecas,  // Array de peças
      mao_de_obra: mao_de_obra,  // Array de mão de obra
      total: 100.00,  // Total das peças
      total_geral: 200.00,  // Total geral (peças + mão de obra)
      observacao: 'Alguma observação',
      status: 'não realizado',  // Status do orçamento
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_ENDERECO_URL}/revanceback/budget/add_budget.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });
      if (response.ok) {
        console.log('Dados salvos com sucesso!');
      } else {
        console.error('Erro ao salvar os dados no banco.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  };
  // Função para gerar o PDF após salvar os dados no banco
  const gerarPDF = () => {
    salvarNoBanco(); // Primeiro salva os dados no banco

    const input = pdfRef.current;
    html2canvas(input, { scale: 3 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save('orcamento.pdf');
    });
  };


  return (
    // <div>
    //   <Paper style={{ padding: '20px', width: '100%', marginBottom: '20px' }}>
    //     {/* Logo e Contato */}
    //     <div style={{ textAlign: 'center', marginBottom: '20px' }}>
    //       <img src="./logo.png" alt="Logo" style={{ width: '150px' }} />
    //       <div>031 2537 3026 | 031 973045542</div>
    //     </div>

    //     {/* Informações do Cliente */}
    //     <div style={{ border: '1px solid black', padding: '10px', marginBottom: '10px' }}>
    //       <div><strong>Ao(s) Sr.(a):</strong> <TextField fullWidth variant="outlined" value={getValueOrDefault(user.nome)} /></div>
    //       <div><strong>Endereço:</strong> <TextField fullWidth variant="outlined" value={getValueOrDefault(user.endereco)} /></div>
    //       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    //         <div><strong>Cidade:</strong> <TextField fullWidth variant="outlined" value={getValueOrDefault(user.cidade)} /></div>
    //         <div><strong>Estado:</strong> <TextField fullWidth variant="outlined" value={getValueOrDefault(user.estado)} /></div>
    //         <div><strong>Tel:</strong> <TextField fullWidth variant="outlined" value={getValueOrDefault(user.telefone)} /></div>
    //         <div><strong>Cel.:</strong> <TextField fullWidth variant="outlined" value={getValueOrDefault(user.celular)} /></div>
    //       </div>
    //       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    //         <div><strong>Modelo:</strong> <TextField fullWidth variant="outlined" value={getValueOrDefault(user.modelo)} /></div>
    //         <div><strong>Ano:</strong> <TextField fullWidth variant="outlined" value={getValueOrDefault(user.ano)} /></div>
    //         <div><strong>Placa:</strong> <TextField fullWidth variant="outlined" value={getValueOrDefault(user.placa)} /></div>
    //         <div><strong>Km:</strong> <TextField fullWidth variant="outlined" value={getValueOrDefault(user.km)} /></div>
    //       </div>
    //       <div><strong>Data do Orçamento:</strong> <TextField fullWidth variant="outlined" value={getValueOrDefault(formatDate(user.data_orcamento))} /></div>
    //     </div>

    //     {/* Tabela de Peças */}
    //     <div style={{ marginBottom: '20px' }}>
    //       <strong>Peças</strong>
    //       {user.pecas ? (
    //         <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', border: '1px solid black' }}>
    //           <thead>
    //             <tr>
    //               <th style={headerStyle}>QUANT.</th>
    //               <th style={headerStyle}>PEÇAS</th>
    //               <th style={headerStyle}>UN</th>
    //               <th style={headerStyle}>PREÇO</th>
    //             </tr>
    //           </thead>
    //           <tbody>
    //             {JSON.parse(user.pecas).map((peca, index) => (
    //               <tr key={index}>
    //                 <td style={cellStyle}>{peca.quant}</td>
    //                 <td style={cellStyle}>{peca.peca}</td>
    //                 <td style={cellStyle}>{peca.un}</td>
    //                 <td style={cellStyle}>{peca.preco}</td>
    //               </tr>
    //             ))}
    //           </tbody>
    //         </table>
    //       ) : (
    //         <Typography>Não informado</Typography>
    //       )}
    //     </div>

    //     {/* Tabela de Mão de Obra */}
    //     <div style={{ marginBottom: '20px' }}>
    //       <strong>Mão de Obra</strong>
    //       <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', border: '1px solid black' }}>
    //         <thead>
    //           <tr>
    //             <th style={headerStyle}>Descrição</th>
    //             <th style={headerStyle}>PREÇO</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           {user.mao_de_obra ? (
    //             JSON.parse(user.mao_de_obra).map((mao, index) => (
    //               <tr key={index}>
    //                 <td style={cellStyle}>{mao.descricao}</td>
    //                 <td style={cellStyle}>{mao.preco}</td>
    //               </tr>
    //             ))
    //           ) : (
    //             <tr>
    //               <td colSpan="2" style={cellStyle}>Não informado</td>
    //             </tr>
    //           )}
    //         </tbody>
    //       </table>
    //     </div>

    //     {/* Totais e Observações */}
    //     <div style={{ marginBottom: '20px' }}>
    //       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    //         <div><strong>TOTAL:</strong> <TextField fullWidth variant="outlined" value={getValueOrDefault(user.total)} /></div>
    //         <div><strong>TOTAL GERAL:</strong> <TextField fullWidth variant="outlined" value={getValueOrDefault(user.total_geral)} /></div>
    //       </div>
    //       <div>
    //         <strong>OBS:</strong>
    //         <TextField fullWidth multiline rows={3} variant="outlined" value={getValueOrDefault(user.observacao)} />
    //       </div>
    //     </div>

    //     {/* Status */}
    //     <div><strong>Status:</strong> <TextField fullWidth variant="outlined" value={getValueOrDefault(user.status)} /></div>
    //   </Paper>
    // </div>
    <div>
      <div ref={pdfRef} style={{ padding: '20px', fontFamily: 'Arial', width: '210mm', backgroundColor: 'white' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <img src="./logo.png" alt="Logo" style={{ width: '150px' }} />
          <div>031 2537 3026 | 031 973045542</div>
        </div>

        {/* Informação do Cliente */}
        <div style={{ border: '1px solid black', padding: '10px', marginBottom: '10px' }}>
          <div><strong>Ao(s) Sr.(a):</strong> <input type="text" style={{ width: '80%' }} value={getValueOrDefault(user.nome)} /></div>
          <div><strong>Endereço:</strong> <input type="text" style={{ width: '80%' }} defaultValue={user?.endereco || ''} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div><strong>Cidade:</strong> <input type="text" defaultValue={user?.cidade || ''} /></div>
            <div><strong>Estado:</strong> <input type="text" defaultValue={user?.estado || ''} /></div>
            <div><strong>Tel:</strong> <input type="text" defaultValue={user?.telefone || ''} /></div>
            <div><strong>Cel.:</strong> <input type="text" defaultValue={user?.celular || ''} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div><strong>Modelo:</strong> <input type="text" defaultValue={user?.modelo || ''} /></div>
            <div><strong>Ano:</strong> <input type="text" defaultValue={user?.ano || ''} /></div>
            <div><strong>Placa:</strong> <input type="text" defaultValue={user?.placa || ''} /></div>
            <div><strong>Km:</strong> <input type="text" defaultValue={user?.km || ''} /></div>
          </div>
          <div><strong>Data do Orçamento:</strong> <input type="date" /></div>
        </div>

        {/* Tabela de Peças */}
        <div style={{ marginBottom: '20px' }}></div>
        <strong>Peças</strong>
        {user.pecas ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', border: '1px solid black' }}>
            <thead>
              <tr>
                <th style={headerStyle}>QUANT.</th>
                <th style={headerStyle}>PEÇAS</th>
                <th style={headerStyle}>UN</th>
                <th style={headerStyle}>PREÇO</th>
              </tr>
            </thead>
            <tbody>
              {JSON.parse(user.pecas).map((peca, index) => (
                <tr key={index}>
                  <td style={cellStyle}>{peca.quant}</td>
                  <td style={cellStyle}>{peca.peca}</td>
                  <td style={cellStyle}>{peca.un}</td>
                  <td style={cellStyle}>{peca.preco}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Typography>Não informado</Typography>
        )}







        {/* Tabela de Mão de Obra */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ marginLeft: '430px', padding: '10px' }}>
            <strong style={{ marginLeft: '-430px' }}>MÃO DE OBRA <input id="maoDeObra" type="text" /></strong>
            <strong style={{ marginLeft: '120px' }}>TOTAL <input id="totalMaoDeObra" type="text" /></strong>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
            <thead>
              <tr>
                <th style={headerStyle}>Descrição</th>
                <th style={headerStyle}>PREÇO</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td style={cellStyle}><input id={`maoDeObra-descricao-${i}`} type="text" style={inputStyle} /></td>
                  <td style={cellStyle}><input id={`maoDeObra-preco-${i}`} type="text" style={inputStyle} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totais e Observações */}
        <div style={{ marginLeft: '430px' }}><strong>TOTAL</strong>: <input id="total" type="text" style={{ width: '50%' }} /></div>
        <div style={{ marginLeft: '430px' }}><strong>TOTAL GERAL</strong>: <input id="totalGeral" type="text" style={{ width: '50%' }} /></div>
        <div><strong>OBS:</strong> <textarea id="observacao" style={{ width: '100%' }} rows="3"></textarea></div>
      </div>

      {/* Botão para Gerar PDF com espaçamento abaixo */}
      <button onClick={gerarPDF} style={{ marginBottom: '20px' }}>
        Baixar PDF
      </button>
    </div>


  );
};

// Estilos das tabelas e células
const headerStyle = {
  border: '1px solid black',
  padding: '5px',
  backgroundColor: '#f0f0f0',
  textAlign: 'center',
};

const cellStyle = {
  border: '1px solid black',
  padding: '5px',
  textAlign: 'center',
};

const inputStyle = {
  width: '100%',
  border: 'none',
  textAlign: 'center',
};


export default OrcamentoEntregue;
