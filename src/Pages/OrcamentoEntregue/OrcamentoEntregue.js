import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';


const Orcamento = ({ user }) => {
  const pdfRef = useRef();
  const [isModified, setIsModified] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // Adicione os estados para os campos editáveis
  const [modelo, setModelo] = useState(user?.modelo || '');
  const [ano, setAno] = useState(user?.ano || '');
  const [km, setKm] = useState(user?.km || '');
  const [celular, setCelular] = useState(user?.celular || '');



  // Estado para controlar as tabelas de peças e mão de obra
  const [pecas, setPecas] = useState(Array(10).fill({ quant: '', peca: '', un: '', preco: '' }));
  const [maoDeObra, setMaoDeObra] = useState(Array(5).fill({ descricao: '', preco: '' }));



  // Estados para total e total geral
  const [total, setTotal] = useState('');
  const [totalGeral, setTotalGeral] = useState('');

  const [maoDeObraInput, setMaoDeObraInput] = useState('');
  const [totalMaoDeObraInput, setTotalMaoDeObraInput] = useState('');
  const [observacao, setObservacao] = useState('');
  const [statusOrcamento, setStatusOrcamento] = useState(user?.status || ''); // 🆕 Estado para armazenar status


  useEffect(() => {
    if (user) {
      setModelo(user?.modelo || '');
      setAno(user?.ano || '');
      setKm(user?.km || '');
      setCelular(user?.celular || '');
      setStatusOrcamento(user?.status || ''); // 🆕 Atualiza o status do orçamento

      if (user?.pecas) {
        try {
          const pecasData = JSON.parse(user.pecas);
          setPecas(Array.isArray(pecasData) ? pecasData : []);
        } catch (e) {
          console.error('Erro ao parsear as peças:', e);
          setPecas([]);
        }
      }

      if (user?.mao_de_obra) {
        try {
          const maoDeObraData = JSON.parse(user.mao_de_obra);
          setMaoDeObra(Array.isArray(maoDeObraData) ? maoDeObraData : []);
        } catch (e) {
          console.error('Erro ao parsear a mão de obra:', e);
          setMaoDeObra([]);
        }
      }

      setMaoDeObraInput(user?.mao_de_obra_input ? parseFloat(user.mao_de_obra_input) || 0 : 0);
      setTotalMaoDeObraInput(user?.total_mao_de_obra_input ? parseFloat(user.total_mao_de_obra_input) || 0 : 0);
      setTotal(user?.total ? parseFloat(user.total) || 0 : 0);
      setTotalGeral(user?.total_geral ? parseFloat(user.total_geral) || 0 : 0);
      setObservacao(user?.observacao || '');
    }
  }, [user]);



  // Monitora alterações nos inputs para ativar o botão "Salvar Atualização"
  const handleInputChange = (setter, value) => {
    setter(value);
    setIsModified(true);
  };





  const handlePecaChange = (index, field, value) => {
    setPecas(prevPecas => {
      const newPecas = [...prevPecas];
      newPecas[index] = { ...newPecas[index], [field]: field === 'preco' ? unformatPreco(value) : value };
      return newPecas;
    });

    setIsModified(true);
  };




  const handleMaoDeObraChange = (index, field, value) => {
    setMaoDeObra(prev => {
      const newMaoDeObra = [...prev];
      newMaoDeObra[index] = { ...newMaoDeObra[index], [field]: unformatPreco(value) };
      return newMaoDeObra;
    });

    setIsModified(true);
  };


  const formatPreco = (value) => {
    if (!value || isNaN(value)) return 'R$ 0,00';
    let num = Number(value).toFixed(2).replace('.', ',');
    return `R$ ${num.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  };

  const unformatPreco = (value) => {
    let num = value.replace('R$', '').replace(/\./g, '').replace(',', '.');
    return isNaN(num) || num === '' ? 0 : parseFloat(num);
  };



  // Confirmação antes de atualizar
  const confirmarAtualizacao = () => {
    setOpenConfirmDialog(true);
  };

  const atualizarBanco = async () => {
    setOpenConfirmDialog(false);

    const dadosAtualizados = {
      id: user?.id,
      modelo,
      ano,
      km,
      celular,
      pecas,
      mao_de_obra: maoDeObra,
      total,
      total_geral: totalGeral,
      mao_de_obra_input: maoDeObraInput,
      total_mao_de_obra_input: totalMaoDeObraInput,
      observacao,
      status: "Não Realizado", // 🆕 Sempre envia "Não Realizado"
    };

    console.log("📤 Enviando payload para update_budget.php:", dadosAtualizados);

    try {
      const response = await fetch(`${process.env.REACT_APP_ENDERECO_URL}/revanceback/budget/update_budget.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosAtualizados),
      });

      const respostaJson = await response.json();
      console.log("📥 Resposta do servidor:", respostaJson);

      if (response.ok) {
        console.log('✅ Atualização salva com sucesso!');
        setIsModified(false);
      } else {
        console.error('❌ Erro ao atualizar os dados:', respostaJson.message);
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
    }
  };




  const salvarNoBanco = async () => {
    const dataAtual = new Date().toISOString().split('T')[0];
    const observacao = document.getElementById('observacao').value;
    const total = pecas.reduce((acc, item) => acc + (parseFloat(item.preco.replace('R$', '').replace(',', '.')) || 0), 0);
    const totalMaoDeObra = maoDeObra.reduce((acc, item) => acc + (parseFloat(item.preco.replace('R$', '').replace(',', '.')) || 0), 0);
    const totalGeral = total + totalMaoDeObra;

    const dados = {
      id_cliente: user?.id,
      nome: user?.nome,
      endereco: user?.endereco,
      cidade: user?.cidade,
      estado: user?.estado,
      telefone: user?.telefone,
      celular: celular || user?.celular,
      modelo: modelo || user?.modelo || 'N/A',
      ano: ano || user?.ano,
      placa: user?.placa,
      km: km || user?.km,
      data_orcamento: dataAtual,
      pecas: pecas.filter(item => item.peca && item.preco),
      mao_de_obra: maoDeObra.filter(item => item.descricao && item.preco),
      total: pecas.reduce((acc, item) => acc + (parseFloat(item.preco.replace('R$', '').replace(',', '.')) || 0), 0),
      total_geral:
        pecas.reduce((acc, item) => acc + (parseFloat(item.preco.replace('R$', '').replace(',', '.')) || 0), 0) +
        maoDeObra.reduce((acc, item) => acc + (parseFloat(item.preco.replace('R$', '').replace(',', '.')) || 0), 0),
      mao_de_obra_input: maoDeObraInput.replace('R$', '').replace(',', '.'),
      total_mao_de_obra_input: totalMaoDeObraInput.replace('R$', '').replace(',', '.'),
      observacao: observacao || '',
      status: 'Não Realizado',
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


  const gerarPDF = () => {

    const input = pdfRef.current;
    html2canvas(input, { scale: 3 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save('orcamento.pdf');
    });
  };

  return (
    <div>
      <div ref={pdfRef} style={{ padding: '20px', fontFamily: 'Arial', width: '210mm', backgroundColor: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <img src="./logo.png" alt="Logo" style={{ width: '150px' }} />
          <div>031 2537 3026 | 031 973045542</div>
        </div>

        <div style={{ border: '1px solid black', padding: '10px', marginBottom: '10px' }}>
          <div><strong>Ao(s) Sr.(a):</strong> <input type="text" style={{ width: '80%' }} defaultValue={user?.nome || ''} /></div>
          <div><strong>Endereço:</strong> <input type="text" style={{ width: '80%' }} defaultValue={user?.endereco || ''} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div><strong>Cidade:</strong> <input type="text" defaultValue={user?.cidade || ''} /></div>
            <div><strong>Estado:</strong> <input type="text" defaultValue={user?.estado || ''} /></div>
            <div><strong>Tel:</strong> <input type="text" defaultValue={user?.telefone || ''} /></div>


            <div>
              <strong>Cel.:</strong>
              <input
                type="text"
                value={celular}
                onChange={(e) => handleInputChange(setCelular, e.target.value)}
              />
            </div>


          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>

            <div>
              <strong>Modelo:</strong>
              <input
                type="text"
                value={modelo}
                onChange={(e) => handleInputChange(setModelo, e.target.value)}
              />
            </div>

            <div>
              <strong>Ano:</strong>
              <input
                type="text"
                value={ano}
                onChange={(e) => handleInputChange(setAno, e.target.value)}
              />
            </div>


            <div><strong>Placa:</strong> <input type="text" defaultValue={user?.placa || ''} /></div>


            <div>
              <strong>Km:</strong>
              <input
                type="text"
                value={km}
                onChange={(e) => handleInputChange(setKm, e.target.value)}
              />
            </div>


          </div>

          <div><strong>Data do Orçamento:</strong>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} readOnly />
          </div>
        </div>

        {/* Tabela de Peças */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: '1px solid black' }}>
          <thead>
            <tr>
              <th style={{ ...headerStyle, width: '10%' }}>QUANT.</th>
              <th style={{ ...headerStyle, width: '40%' }}>PEÇAS</th>
              <th style={{ ...headerStyle, width: '10%' }}>UN</th>
              <th style={{ ...headerStyle, width: '20%' }}>PREÇO</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(pecas) && pecas.map((item, i) => (
              <tr key={i}>
                <td style={cellStyle}>
                  <input
                    type="number"
                    value={item.quant}
                    onChange={(e) => handlePecaChange(i, 'quant', e.target.value)}
                    style={{ ...inputStyle, width: '60px' }}
                  />
                </td>
                <td style={cellStyle}>
                  <textarea
                    type="text"
                    value={item.peca}
                    onChange={(e) => handlePecaChange(i, 'peca', e.target.value)}
                    style={inputStyle}
                  />
                </td>
                <td style={cellStyle}>
                  <input
                    type="number"
                    step="any" // Permite números decimais
                    value={item.un}
                    onChange={(e) => handlePecaChange(i, 'un', e.target.value)}
                    style={{ ...inputStyle, width: '60px' }}
                  />
                </td>
                <td style={cellStyle}>
                  <input
                    type="text"
                    value={formatPreco(item.preco)}  // Aplica a formatação ao exibir
                    onChange={(e) => handlePecaChange(i, 'preco', e.target.value)}  // Mantém o valor sem formatação para editar
                    style={inputStyle}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>





        {/* Campo MÃO DE OBRA */}
        <div style={{ marginLeft: '430px', padding: '10px' }}>
          <strong style={{ marginLeft: '-430px' }}>MÃO DE OBRA
            <input
              id='maoDeObraInput'
              type="text"
              value={formatPreco(maoDeObraInput)}
              onChange={(e) => setMaoDeObraInput(unformatPreco(e.target.value) || 0)}
            />
          </strong>

          <strong style={{ marginLeft: '120px' }}>TOTAL
            <input
              id='totalMaoDeObraInput'
              type="text"
              value={formatPreco(totalMaoDeObraInput)}
              onChange={(e) => setTotalMaoDeObraInput(unformatPreco(e.target.value) || 0)}
            />
          </strong>
        </div>




        {/* Tabela de Mão de Obra */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
          <thead>
            <tr>
              <th style={{ ...headerStyle, width: '70%' }}>Descrição</th>
              <th style={{ ...headerStyle, width: '30%' }}>PREÇO</th>
            </tr>
          </thead>
          <tbody>
            {maoDeObra.map((item, i) => (
              <tr key={i}>
                <td style={cellStyle}>
                  <textarea
                    value={item.descricao}
                    onChange={(e) => handleMaoDeObraChange(i, 'descricao', e.target.value)}
                    style={{ ...inputStyle, height: '60px', width: '100%' }}
                  />
                </td>
                <td style={cellStyle}>
                  <input
                    type="text"
                    value={formatPreco(item.preco)}  // Aplica a formatação ao exibir
                    onChange={(e) => handleMaoDeObraChange(i, 'preco', e.target.value)}  // Mantém o valor sem formatação para editar
                    style={inputStyle}
                  />
                </td>
              </tr>
            ))}
          </tbody>

        </table>

        <button
          onClick={confirmarAtualizacao}
          disabled={!isModified || statusOrcamento !== "Não Realizado"} // 🆕 Só ativa se status for "Não Realizado"
          style={{ marginTop: '20px' }}
        >
          Salvar Atualização
        </button>



        {/* Modal de Confirmação */}
        <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
          <DialogTitle>Confirmar Atualização</DialogTitle>
          <DialogContent>
            <p>Tem certeza de que deseja salvar as alterações?</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirmDialog(false)}>Cancelar</Button>
            <Button onClick={atualizarBanco}>Confirmar</Button>
          </DialogActions>
        </Dialog>

        {/* Campo TOTAL */}
        <div style={{ marginLeft: '430px' }}>
          <strong>TOTAL</strong>:
          <input
            id='total'
            type="text"
            value={formatPreco(total)}
            onChange={(e) => setTotal(formatPreco(unformatPreco(e.target.value)))}
          />
        </div>

        {/* Campo TOTAL GERAL */}
        <div style={{ marginLeft: '430px' }}>
          <strong>TOTAL GERAL</strong>:
          <input
            id='totalGeral'
            type="text"
            value={formatPreco(totalGeral)}
            onChange={(e) => setTotalGeral(formatPreco(unformatPreco(e.target.value)))}
          />
        </div>



        {/* Campo OBSERVAÇÃO */}
        <div>
          <strong>OBS:</strong>
          <textarea
            id="observacao"
            style={{ width: '100%' }}
            rows="3"
            defaultValue={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
        </div>




      </div>

      <button onClick={gerarPDF} style={{ marginBottom: '20px' }}>
        Baixar PDF
      </button>
    </div>



  );
};

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

export default Orcamento;
