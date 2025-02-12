import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, IconButton, TablePagination, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import { Search, Description } from '@mui/icons-material';
import jsPDF from 'jspdf';
import Preorcamento from '../OrcamentoEntregue/OrcamentoEntregue';  // Supondo que o seu componente Preorcamento está nesse caminho

const ListaOrcamento = () => {
  const [orcamentos, setOrcamentos] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0); // Estado para página
  const [rowsPerPage, setRowsPerPage] = useState(5); // Estado para linhas por página

  // Estado para o Modal
  const [selectedOrcamento, setSelectedOrcamento] = useState(null); // Armazena o orçamento selecionado

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  const fetchOrcamentos = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_ENDERECO_URL}/revanceback/budget/get_budget.php`);
      const data = await response.json();
      if (Array.isArray(data.orcamentos)) {
        setOrcamentos(data.orcamentos.filter(orcamento => orcamento.status === 'Realizado'));
      } else {
        setOrcamentos([]);
      }
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      setOrcamentos([]);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value.toLowerCase());
  };

  const filteredOrcamentos = orcamentos.filter(orcamento =>
    orcamento.nome.toLowerCase().includes(search) ||
    orcamento.placa.toLowerCase().includes(search) ||
    orcamento.id.toString().includes(search) // Filtro pelo ID
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() é 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const downloadPDF = (orcamento) => {
    const doc = new jsPDF();
    doc.text("Orçamento Realizado", 20, 20);
    doc.text(`Cliente: ${orcamento.nome}`, 20, 30);
    doc.text(`Placa: ${orcamento.placa}`, 20, 35);
    doc.text(`Modelo: ${orcamento.modelo}`, 20, 40);
    doc.text(`Ano: ${orcamento.ano}`, 20, 45);
    doc.text(`Total: ${orcamento.total_geral}`, 20, 50);
    doc.text(`Data Orçamento: ${formatDate(orcamento.data_orcamento)}`, 20, 55);
    doc.save(`${orcamento.nome}_${orcamento.id}.pdf`);
  };

  const handleOpenPreorcamento = (orcamento) => {
    setSelectedOrcamento(orcamento);  // Define o orçamento selecionado
  };

  const handleClosePreorcamento = () => {
    setSelectedOrcamento(null);  // Limpa o orçamento selecionado
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage); // Atualiza a página quando o usuário navega
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Atualiza as linhas por página
    setPage(0); // Reseta a página para 0 quando as linhas por página mudam
  };


  const formatPreco = (value) => {
    if (!value || isNaN(value)) return 'R$ 0,00';
    let num = Number(value).toFixed(2).replace('.', ',');
    return `R$ ${num.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <TextField
          label="Pesquisar Orçamento"
          variant="outlined"
          fullWidth
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <Search />
            ),
          }}
        />
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Orç.</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Placa</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Data Orçamento</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Visualizar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrcamentos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((orcamento) => (
              <TableRow key={orcamento.id}>
                <TableCell>{orcamento.id}</TableCell>
                <TableCell>{orcamento.nome}</TableCell>
                <TableCell>{orcamento.placa}</TableCell>
                <TableCell>{orcamento.modelo}</TableCell>
                <TableCell>{formatPreco(orcamento.total_geral)}</TableCell>
                <TableCell>{formatDate(orcamento.data_orcamento)}</TableCell>
                <TableCell>{orcamento.status}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenPreorcamento(orcamento)}>
                    <Description />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredOrcamentos.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Modal Preorcamento */}
      <Dialog
        open={Boolean(selectedOrcamento)} // Modal abre se houver orçamento selecionado
        onClose={handleClosePreorcamento} // Fecha o modal
        maxWidth="md"  // Ajusta o modal para ocupar mais espaço na tela
        fullWidth={true}  // Garante que o modal ocupe 100% da largura do seu container
        sx={{ minHeight: '300px' }}  // Ajusta a altura mínima, se necessário
      >
        <DialogTitle>Detalhes do Orçamento</DialogTitle>
        <DialogContent>
          {selectedOrcamento ? (
            <Preorcamento user={selectedOrcamento} /> 
          ) : (
          <p>Carregando...</p>
    )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreorcamento} color="primary">Fechar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ListaOrcamento;
