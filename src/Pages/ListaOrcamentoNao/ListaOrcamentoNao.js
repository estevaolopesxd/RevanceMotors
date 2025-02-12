import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, TablePagination, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { Search, Description, Edit } from '@mui/icons-material';
import OrcamentoEntregue from '../OrcamentoEntregue/OrcamentoEntregue'; // Importando o componente OrcamentoEntregue

const ListaOrcamentoNao = () => {
  const [orcamentos, setOrcamentos] = useState([]); // Inicializa orcamentos como array vazio
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [openModal, setOpenModal] = useState(false); // Estado para abrir o modal
  const [selectedOrcamento, setSelectedOrcamento] = useState(null);


  // para editar o orçamento
  const [editOrcamento, setEditOrcamento] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  const fetchOrcamentos = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_ENDERECO_URL}/revanceback/budget/get_budget.php`);
      const data = await response.json();
      console.log('Dados de orçamentos após a atualização:', data);

      // Verificação de que 'orcamentos' está sendo retornado como um array
      if (Array.isArray(data.orcamentos)) {
        setOrcamentos(data.orcamentos.filter(orcamento => orcamento.status === 'Não Realizado'));
      } else {
        console.error('Dados de orçamentos não estão em formato de array', data.orcamentos);
        setOrcamentos([]); // Garantir que seja sempre um array
      }
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      setOrcamentos([]); // Garantir que seja sempre um array caso haja erro
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value.toLowerCase());
  };

  // Certifique-se de que orcamentos sempre é um array, mesmo que seja vazio
  const filteredOrcamentos = Array.isArray(orcamentos) ?
    orcamentos.filter((orcamento) =>
      orcamento.nome.toLowerCase().includes(search) ||
      orcamento.placa.toLowerCase().includes(search) ||
      orcamento.id.toString().includes(search)
    ) : [];  // Se não for um array, retorna um array vazio

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenModal = (orcamento) => {
    setSelectedOrcamento(orcamento);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedOrcamento(null);
  };


  const handleOpenEditModal = (orcamento) => {
    setEditOrcamento(orcamento);
    setOpenEditModal(true);
  };


  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditOrcamento(null);
  };

  const handleEditChange = (field, value) => {
    setEditOrcamento((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  const handleSaveEdit = async () => {
    if (!editOrcamento) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_ENDERECO_URL}/revanceback/budget/update_budget.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editOrcamento),
      });

      const responseData = await response.json();
      console.log('Resposta da API:', responseData);

      if (response.ok) {
        setOrcamentos(prevOrcamentos =>
          prevOrcamentos.map(orcamento => (orcamento.id === editOrcamento.id ? editOrcamento : orcamento))
        );
        setOpenConfirmModal(false);
        handleCloseEditModal();
      } else {
        alert(`Erro ao atualizar orçamento: ${responseData.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao enviar requisição:', error);
      alert('Erro ao atualizar o orçamento. Verifique a conexão ou o servidor.');
    }
  };


  const updateStatus = async () => {
    if (!selectedOrcamento) return;

    console.log('Enviando atualização para o orçamento com ID:', selectedOrcamento.id);

    try {
      const response = await fetch(`${process.env.REACT_APP_ENDERECO_URL}/revanceback/budget/update_status.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedOrcamento.id,
          status: 'Realizado',
        }),
      });

      const responseData = await response.json();
      console.log('Resposta da API (POST):', responseData);

      if (response.ok) {
        setOrcamentos(prevOrcamentos => {
          const updatedOrcamentos = prevOrcamentos.map((orcamento) => {
            if (orcamento.id === selectedOrcamento.id) {
              return { ...orcamento, status: 'Realizado' };
            }
            return orcamento;
          });
          return updatedOrcamentos;
        });

        setOpenDialog(false);
      } else {
        alert(`Erro ao atualizar o status: ${responseData.message || 'Desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao enviar requisição:', error);
      alert('Erro ao atualizar o status. Verifique a conexão ou o servidor.');
    }
  };

  const handleOpenDialog = (orcamento) => {
    setSelectedOrcamento(orcamento);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedOrcamento(null);
    setOpenDialog(false);
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
            startAdornment: <Search />,
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
              <TableCell>Ações</TableCell>
              <TableCell>Visualizar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrcamentos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((orcamento) => (
              <TableRow key={orcamento.id}>
                <TableCell>{orcamento.id}</TableCell>
                <TableCell>{orcamento.nome}</TableCell>
                <TableCell>{orcamento.placa}</TableCell>
                <TableCell>{orcamento.Modelo}</TableCell>
                <TableCell>{formatPreco(orcamento.total_geral)}</TableCell>
                <TableCell>{formatDate(orcamento.data_orcamento)}</TableCell>
                <TableCell>{orcamento.status}</TableCell>
                <TableCell>
                  {orcamento.status === 'Não Realizado' && (
                    <Button variant="contained" color="primary" onClick={() => handleOpenDialog(orcamento)}>
                      Realizar
                    </Button>
                  )}


                  <IconButton onClick={() => handleOpenEditModal(orcamento)}>
                    <Edit />
                  </IconButton>

                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenModal(orcamento)}>
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


      {/* Modal para visualizar o orçamento */}
      <Dialog
        open={Boolean(selectedOrcamento)} // Modal abre se houver orçamento selecionado
        onClose={handleCloseModal} // Fecha o modal
        maxWidth="md"  // Ajusta o modal para ocupar mais espaço na tela
        fullWidth={true}  // Garante que o modal ocupe 100% da largura do seu container
        sx={{ minHeight: '300px' }}  // Ajusta a altura mínima, se necessário
      >
        <DialogTitle>Detalhes do Orçamento</DialogTitle>
        <DialogContent>
          {selectedOrcamento ? (
            <OrcamentoEntregue user={selectedOrcamento} /> // Componente renderizado quando o orçamento é selecionado
          ) : (
            <p>Carregando...</p> // Exibe "Carregando..." enquanto os dados não estão disponíveis
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmação</DialogTitle>
        <DialogContent>
          <p>Tem certeza de que deseja alterar o status para "Realizado"?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancelar
          </Button>
          <Button onClick={updateStatus} color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>




      <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="md" fullWidth>
        <DialogTitle>Editar Orçamento</DialogTitle>
        <DialogContent>
          {editOrcamento && (
            <>
              <TextField
                label="Nome"
                fullWidth
                margin="dense"
                value={editOrcamento.nome}
                onChange={(e) => handleEditChange("nome", e.target.value)}
              />
              <TextField
                label="Placa"
                fullWidth
                margin="dense"
                value={editOrcamento.placa}
                onChange={(e) => handleEditChange("placa", e.target.value)}
              />
              <TextField
                label="Modelo"
                fullWidth
                margin="dense"
                value={editOrcamento.modelo}
                onChange={(e) => handleEditChange("modelo", e.target.value)}
              />
              <TextField
                label="Ano"
                fullWidth
                margin="dense"
                value={editOrcamento.ano}
                onChange={(e) => handleEditChange("ano", e.target.value)}
              />
              <TextField
                label="KM"
                fullWidth
                margin="dense"
                value={editOrcamento.km}
                onChange={(e) => handleEditChange("km", e.target.value)}
              />
              <TextField
                label="Telefone"
                fullWidth
                margin="dense"
                value={editOrcamento.telefone}
                onChange={(e) => handleEditChange("telefone", e.target.value)}
              />
              <TextField
                label="Celular"
                fullWidth
                margin="dense"
                value={editOrcamento.celular}
                onChange={(e) => handleEditChange("celular", e.target.value)}
              />
              <TextField
                label="Total"
                fullWidth
                margin="dense"
                value={editOrcamento.total_geral}
                onChange={(e) => handleEditChange("total_geral", e.target.value)}
              />
              <TextField
                label="Observação"
                fullWidth
                margin="dense"
                multiline
                rows={3}
                value={editOrcamento.observacao}
                onChange={(e) => handleEditChange("observacao", e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal} color="secondary">Cancelar</Button>
          <Button onClick={() => setOpenConfirmModal(true)} color="primary">Salvar</Button>
        </DialogActions>
      </Dialog>





      <Dialog open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
        <DialogTitle>Confirmação</DialogTitle>
        <DialogContent>
          <p>Tem certeza de que deseja salvar as alterações?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmModal(false)} color="secondary">Cancelar</Button>
          <Button onClick={handleSaveEdit} color="primary">Confirmar</Button>
        </DialogActions>
      </Dialog>


    </div>
  );
};

export default ListaOrcamentoNao;
