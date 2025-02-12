import React, { useState, useEffect } from 'react';
import {
  TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  InputAdornment, TablePagination, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import { Search, Add, Description } from '@mui/icons-material';
import Preorcamento from '../OrcamentoEntregue/OrcamentoEntregue';

const OrcamentosTable = () => {
  const [orcamentos, setOrcamentos] = useState([]);
  const [search, setSearch] = useState('');
  const [openPreorcamentoModal, setOpenPreorcamentoModal] = useState(false);
  const [selectedOrcamento, setSelectedOrcamento] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusToUpdate, setStatusToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

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

  const handleSearchChange = (e) => setSearch(e.target.value.toLowerCase());

  const handleStatusChange = (orcamentoId) => setStatusToUpdate(orcamentoId);

  const handleSaveStatusChange = () => setOpenConfirmModal(true);

  const handleConfirmSaveStatusChange = async () => {
    if (statusToUpdate && newStatus) {
      setOrcamentos(orcamentos.map((orcamento) =>
        orcamento.id === statusToUpdate
          ? { ...orcamento, status: newStatus }
          : orcamento
      ));
      await updateStatusOnServer(statusToUpdate, newStatus);
      fetchOrcamentos();
      setOpenConfirmModal(false);
      setStatusToUpdate(null);
      setNewStatus('');
    }
  };

  const updateStatusOnServer = async (orcamentoId, status) => {
    try {
      await fetch(`${process.env.REACT_APP_ENDERECO_URL}/revanceback/budget/update_status.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orcamentoId, status })
      });
    } catch (error) {
      console.error('Erro ao atualizar o status:', error);
    }
  };

  const filteredOrcamentos = orcamentos.filter(orcamento =>
    orcamento.nome?.toLowerCase().includes(search) ||
    orcamento.id.toString().includes(search) ||
    orcamento.placa?.toLowerCase().includes(search)
  );

  const handleOpenPreorcamento = (orcamento) => {
    setSelectedOrcamento(orcamento);
    setOpenPreorcamentoModal(true);
  };

  const handleClosePreorcamento = () => {
    setSelectedOrcamento(null);
    setOpenPreorcamentoModal(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Placa</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Ano</TableCell>
              <TableCell>Data Orçamento</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrcamentos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((orcamento) => (
              <TableRow key={orcamento.id}>
                <TableCell>{orcamento.id}</TableCell>
                <TableCell>{orcamento.nome}</TableCell>
                <TableCell>{orcamento.placa || 'N/A'}</TableCell>
                <TableCell>{orcamento.modelo || 'N/A'}</TableCell>
                <TableCell>{orcamento.ano || 'N/A'}</TableCell>
                <TableCell>{orcamento.data_orcamento ? formatDate(orcamento.data_orcamento) : 'N/A'}</TableCell>
                <TableCell>
                  {statusToUpdate === orcamento.id ? (
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <MenuItem value="Realizado">Realizado</MenuItem>
                        <MenuItem value="Não Realizado">Não Realizado</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    orcamento.status || 'N/A'
                  )}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenPreorcamento(orcamento)}>
                    <Description />
                  </IconButton>
                  {orcamento.status === "Não Realizado" && statusToUpdate !== orcamento.id && (
                    <Button variant="outlined" onClick={() => handleStatusChange(orcamento.id)}>
                      Alterar Status
                    </Button>
                  )}
                  {statusToUpdate === orcamento.id && (
                    <Button variant="contained" onClick={handleSaveStatusChange}>
                      Salvar
                    </Button>
                  )}
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
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />

      <Dialog open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
        <DialogTitle>Confirmar Alteração</DialogTitle>
        <DialogContent>
          <p>Deseja alterar o status para "{newStatus}"?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmModal(false)}>Cancelar</Button>
          <Button onClick={handleConfirmSaveStatusChange}>Confirmar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPreorcamentoModal} onClose={handleClosePreorcamento} maxWidth="lg" fullWidth>
        <DialogTitle>Detalhes do Orçamento</DialogTitle>
        <DialogContent>
          {selectedOrcamento ? <Preorcamento user={selectedOrcamento} /> : <p>Carregando...</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreorcamento}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OrcamentosTable;
