import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import "./Preorcamento.css"

const Orcamento = ({ user, description, estimatedValue }) => {
  const pdfRef = useRef();

  // Adicione os estados para os campos editáveis
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [km, setKm] = useState('');
  const [celular, setCelular] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [endereco, setEndereco] = useState('');




  useEffect(() => {
    if (user) {
      setModelo(user?.modelo || '');
      setAno(user?.ano || '');
      setKm(user?.km || '');
      setCelular(user?.celular || '');
      setCidade(user?.cidade || '');
      setEstado(user?.estado || '');
      setEndereco(user?.endereco || '');
    }
  }, [user]);


  // Estado para controlar as tabelas de peças e mão de obra
  const [pecas, setPecas] = useState(Array(20).fill({ quant: '', peca: '', un: '', preco: '' }));
  const [maoDeObra, setMaoDeObra] = useState(Array(10).fill({ descricao: '', preco: '' }));



  // Estados para total e total geral
  const [total, setTotal] = useState('');
  const [totalGeral, setTotalGeral] = useState('');

  const [maoDeObraInput, setMaoDeObraInput] = useState('');
  const [totalMaoDeObraInput, setTotalMaoDeObraInput] = useState('');
  const [observacao, setObservacao] = useState('');


  useEffect(() => {
    // Sempre que o 'user' mudar, atualize o estado
    // console.log("Dados de user recebidos:", user); // Verifique o conteúdo de user
    if (user) {
      setModelo(user?.modelo || '');
      setAno(user?.ano || '');
      setKm(user?.km || '');
      setCelular(user?.celular || '');
    }
  }, [user]); // O efeito só é disparado quando 'user' mudar



  // Função para atualizar os dados das peças
  const handlePecaChange = (index, field, value) => {
    setPecas(prevPecas => {
      const newPecas = [...prevPecas];
      newPecas[index] = { ...newPecas[index], [field]: value };
      return newPecas;
    });
  };

  // Função para atualizar os dados da mão de obra
  const handleMaoDeObraChange = (index, field, value) => {
    setMaoDeObra(prevMaoDeObra => {
      const newMaoDeObra = [...prevMaoDeObra];
      newMaoDeObra[index] = { ...newMaoDeObra[index], [field]: value };
      return newMaoDeObra;
    });
  };

  const formatPreco = (value) => {
    if (!value) return '';
    // Remove qualquer caractere que não seja número ou vírgula
    const cleanValue = value.replace(/\D/g, '');

    // Divide em centavos e milhar
    const formattedValue = (Number(cleanValue) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return formattedValue;
  };


  // Função para converter valores formatados para o formato decimal (sem "R$" e usando ".")
  const parseCurrency = (value) => {
    if (!value) return 0; // Se o valor for null, undefined ou vazio, retorna 0
    return parseFloat(String(value).replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
  };



  // Função para salvar no banco
  const salvarNoBanco = async () => {
    // Calcula o total das peças
    const total = pecas.reduce((acc, item) => acc + parseCurrency(item.preco || '0'), 0);
  
    // Calcula o total da mão de obra
    const totalMaoDeObra = maoDeObra.reduce((acc, item) => acc + parseCurrency(item.preco || '0'), 0);
  
    // Pega os valores dos campos e formata para o formato numérico
    const totalValue = total; // Já calculado como número
    const totalGeralValue = parseCurrency(totalGeral); // Converte o valor total geral
    const maoDeObraValue = parseCurrency(maoDeObraInput); // Converte o valor mão de obra
    const totalMaoDeObraValue = parseCurrency(totalMaoDeObraInput); // Converte o total mão de obra
  
    // Monta o objeto com os dados a serem enviados
    const dados = {
      id_cliente: user?.id,
      nome: user?.nome,
      endereco: endereco || user?.endereco,
      cidade: cidade || user?.cidade,
      estado: estado || user?.estado,
      telefone: user?.telefone,
      celular: celular || user?.celular,
      modelo: modelo || user?.modelo || 'N/A',
      ano: parseInt(ano) || null, // Inteiro
      placa: user?.placa,
      km: parseInt(km) || null, // Inteiro
      data_orcamento: new Date().toISOString().split('T')[0],
      pecas: pecas
        .filter((item) => item.peca && item.preco)
        .map((item) => ({
          ...item,
          quant: parseInt(item.quant) || 0, // Inteiro
          un: parseFloat(item.un) || 0, // Alterado para float
          preco: parseCurrency(item.preco), // Decimal para salvar
        })),
      mao_de_obra: maoDeObra
        .filter((item) => item.descricao && item.preco)
        .map((item) => ({
          ...item,
          preco: parseCurrency(item.preco), // Decimal para salvar
        })),
      total: totalValue, // Total das peças
      total_geral: totalGeralValue, // Total geral
      total_mao_de_obra_input: totalMaoDeObraValue, // Total mão de obra
      mao_de_obra_input: maoDeObraValue, // Input mão de obra
      observacao: observacao || '',
      description: description,
      estimatedValue: estimatedValue,
      status: 'Não Realizado',
    };
  
    try {
      // Envia os dados para o servidor via POST
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
    salvarNoBanco();

    const input = pdfRef.current;

    html2canvas(input, {
      scale: 3, // Aumenta a qualidade
      width: input.offsetWidth,
      height: input.offsetHeight,
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Largura A4 em mm
      const pageHeight = 297; // Altura A4 em mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;

        if (heightLeft > 0) pdf.addPage();
      }

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
          <div><strong>Ao(s) Sr.(a):</strong> <input type="text" style={{ width: '80%', height: '30px' }} defaultValue={user?.nome || ''} /></div>
          <div><strong>Endereço:</strong> <input type="text" style={{ width: '80%' }} defaultValue={user?.endereco || ''} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div><strong>Cidade:</strong> <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} /></div>
          <div><strong>Estado:</strong> <input type="text" value={estado} onChange={(e) => setEstado(e.target.value)} /></div>
          <div><strong>Tel:</strong> <input type="text" defaultValue={user?.telefone || ''} /></div>


          <div><strong>Cel.:</strong> <input type="text" value={celular} onChange={(e) => setCelular(e.target.value)} /></div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div><strong>Modelo:</strong> <input type="text" value={modelo} onChange={(e) => setModelo(e.target.value)} /></div>

          <div><strong>Ano:</strong> <input type="text" value={ano} onChange={(e) => setAno(e.target.value)} /></div>


          <div><strong>Placa:</strong> <input type="text" defaultValue={user?.placa || ''} /></div>


          <div><strong>Km:</strong> <input type="text" value={km} onChange={(e) => setKm(e.target.value)} /></div>


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
              <th style={{ ...headerStyle, width: '10%', height: '20px' }}>UN</th>
              <th style={{ ...headerStyle, width: '20%', }}>PREÇO</th>
            </tr>
          </thead>
          <tbody>
            {pecas.map((item, i) => (
              <tr key={i}>
                <td style={cellStyle}>
                  <input
                    type="number"
                    value={item.quant}
                    onChange={(e) => handlePecaChange(i, 'quant', e.target.value)}
                    style={{ ...inputStyle, width: '60px', height: '30px' }}
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
                    step="any"
                    value={item.un}
                    onChange={(e) => handlePecaChange(i, 'un', e.target.value)}
                    style={{ ...inputStyle, width: '60px', height: '30px' }}
                  />
                </td>
                <td style={cellStyle}>
                  <input
                    type="text"
                    value={item.preco}
                    onChange={(e) => handlePecaChange(i, 'preco', formatPreco(e.target.value))}
                    style={{ ...inputStyle, height: '30px' }}
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
              id="maoDeObraInput"
              type="text"
              value={maoDeObraInput}
              onChange={(e) => setMaoDeObraInput(formatPreco(e.target.value))}
              style={{ textAlign: 'center', padding: '5px', width: '150px', height: '30px' }}
            />
          </strong>
          <strong style={{ marginLeft: '120px' }}>TOTAL
            <input
              id="totalMaoDeObraInput"
              type="text"
              value={totalMaoDeObraInput}
              onChange={(e) => setTotalMaoDeObraInput(formatPreco(e.target.value))}
              style={{ textAlign: 'center', padding: '5px', width: '150px', height: '30px' }}
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
                    value={item.preco}
                    onChange={(e) => handleMaoDeObraChange(i, 'preco', formatPreco(e.target.value))}
                    style={{ ...inputStyle, height: '60px' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>



        {/* Campo TOTAL */}
        <div style={{ marginLeft: '430px', marginTop: '10px' }}>
          <strong>TOTAL</strong>:
          <input
            id="total"
            type="text"
            value={total}
            onChange={(e) => setTotal(formatPreco(e.target.value))}
            style={{ width: '50%', textAlign: 'center', padding: '5px', height: '30px' }}
          />
        </div>

        {/* Campo TOTAL GERAL */}
        <div style={{ marginLeft: '430px', marginTop: '8px' }}>
          <strong>TOTAL GERAL</strong>:
          <input
            id="totalGeral"
            type="text"
            value={totalGeral}
            onChange={(e) => setTotalGeral(formatPreco(e.target.value))}
            style={{ width: '50%', textAlign: 'center', padding: '5px', height: '30px' }}
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

      <button onClick={gerarPDF} style={{ marginBottom: '20px' }} class="btn">
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
  height: '25px',
  boxSizing: 'border-box', // Adicionado para ajustar margens internas
  overflow: 'hidden',      // Garante que o texto não transborde
  lineHeight: '1'
};



export default Orcamento;