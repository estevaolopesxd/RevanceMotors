import React, { useState, useEffect } from 'react';
import {
  TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Collapse, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  InputAdornment, TablePagination
} from '@mui/material';
import { Search, ExpandMore, ExpandLess, Add, Description } from '@mui/icons-material';
import Preorcamento from '../OrcamentoEntregue/OrcamentoEntregue';

const OrcamentosTable = () => {
  const [orcamentos, setOrcamentos] = useState([]);
  const [search, setSearch] = useState('');
  const [openCollapse, setOpenCollapse] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [openPreorcamentoModal, setOpenPreorcamentoModal] = useState(false);
  const [selectedOrcamento, setSelectedOrcamento] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  const fetchOrcamentos = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_ENDERECO_URL}/revanceback/budget/get_budget.php`);
      const data = await response.json();
      if (Array.isArray(data.orcamentos)) {
        setOrcamentos(data.orcamentos);
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

  const filteredOrcamentos = Array.isArray(orcamentos)
    ? orcamentos.filter(orcamento =>
      orcamento.nome?.toLowerCase().includes(search) ||
      orcamento.placa?.toLowerCase().includes(search) ||
      orcamento.ano?.toLowerCase().includes(search)
    )
    : [];

  const groupedOrcamentos = orcamentos.reduce((acc, orcamento) => {
    if (!acc[orcamento.id_cliente]) {
      acc[orcamento.id_cliente] = { cliente_id: orcamento.id_cliente, nome: orcamento.nome, historico: [] };
    }
    acc[orcamento.id_cliente].historico.push(orcamento);
    return acc;
  }, {});

  const groupedOrcamentosArray = Object.values(groupedOrcamentos);

  groupedOrcamentosArray.forEach((orcamento) => {
    orcamento.historico.sort((a, b) => new Date(b.data_orcamento) - new Date(a.data_orcamento));
  });

  const toggleCollapse = (id) => {
    setOpenCollapse(prevState => ({ ...prevState, [id]: !prevState[id] }));
  };

  const handleOpenPreorcamento = (orcamento) => {
    // Log para verificar os dados que estamos passando para o modal
    console.log("Abrindo modal para o orçamento:", orcamento);

    setSelectedOrcamento(orcamento); // Atualizando o estado do orçamento selecionado
    setOpenPreorcamentoModal(true); // Abrindo o modal
  };

  const handleClosePreorcamento = () => {
    setSelectedOrcamento(null); // Resetando a seleção
    setOpenPreorcamentoModal(false); // Fechando o modal
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <TextField
          label="Pesquisar Orçamento"
          variant="outlined"
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
          Adicionar Novo Orçamento
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome do Cliente</TableCell>
              <TableCell>Placa</TableCell>
              <TableCell>Ano</TableCell>
              <TableCell>Último Orçamento</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groupedOrcamentosArray.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((orcamento) => (
              <React.Fragment key={orcamento.cliente_id}>
                <TableRow>
                  <TableCell>{orcamento.cliente_id}</TableCell>
                  <TableCell>{orcamento.nome}</TableCell>
                  <TableCell>{orcamento.placa}</TableCell>
                  <TableCell>{orcamento.ano}</TableCell>
                  <TableCell>{formatDate(orcamento.historico[0].data_orcamento)}</TableCell>
                  <TableCell>{orcamento.status}</TableCell>
                  <TableCell>
                    {/* Ação para a linha principal */}
                    <IconButton onClick={() => handleOpenPreorcamento(orcamento.historico[0])}> {/* Passando o último orçamento */}
                      <Description />
                    </IconButton>
                    <IconButton onClick={() => toggleCollapse(orcamento.cliente_id)}>
                      {openCollapse[orcamento.cliente_id] ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={openCollapse[orcamento.cliente_id]} timeout="auto" unmountOnExit>
                      <div style={{ padding: '10px 0' }}>
                        <strong>Histórico de Orçamentos:</strong>
                        <ul>
                          {orcamento.historico.slice(1).map((item, index) => (
                            <li key={index}>
                              <span>{formatDate(item.data_orcamento)}</span>
                              {/* Ação para o histórico de orçamentos */}
                              <IconButton onClick={() => handleOpenPreorcamento(item)}>
                                <Description />
                              </IconButton>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={groupedOrcamentosArray.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, page) => setPage(page)}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />

      {/* Modal do Preorcamento */}
      <Dialog open={openPreorcamentoModal} onClose={handleClosePreorcamento}>
        <DialogTitle>Detalhes do Preorcamento</DialogTitle>
        <DialogContent>
          {selectedOrcamento ? (
            <Preorcamento user={selectedOrcamento} />
          ) : (
            <p>Carregando...</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreorcamento} color="secondary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OrcamentosTable;
