import React, { useState, useEffect } from 'react';
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination, Modal, Box } from '@mui/material';

//pages
import Preorcamento from '../Preorcamento/Preorcamento';



const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openPreBudgetModal, setOpenPreBudgetModal] = useState(false);
  const [openFullscreenModal, setOpenFullscreenModal] = React.useState(false); //modal para abrir o pdf
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', plate: '' });

const handleOpenFullscreenModal = () => setOpenFullscreenModal(true);
const handleCloseFullscreenModal = () => setOpenFullscreenModal(false);



  // Função para buscar clients com filtros de pesquisa
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_ENDERECO_URL}/revanceback/clients/get_clients.php?page=${page}&search=${searchTerm}`);
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm]);

  // Abrir e fechar modal de adicionar usuário
  const handleOpenUserModal = () => setOpenUserModal(true);
  const handleCloseUserModal = () => setOpenUserModal(false);

  // Abrir e fechar modal de pré-orçamento
  const handleOpenPreBudgetModal = (user) => {
    setSelectedUser(user);
    setOpenPreBudgetModal(true);
  };
  const handleClosePreBudgetModal = () => {
    setSelectedUser(null);
    setOpenPreBudgetModal(false);
  };

  // Adicionar novo cliente
  const handleAddUser = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_ENDERECO_URL}/revanceback/clients/add_clients.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: newUser.name,   
          email: newUser.email,   
          telefone: newUser.phone,  
          placa: newUser.plate,   
        }),
      });
      
      if (response.ok) {
        fetchUsers();
        handleCloseUserModal();
        setNewUser({ name: '', email: '', phone: '', plate: '' });
      } else {
        console.error('Erro ao adicionar usuário:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
    }
  };

  return (
    <div>
      {/* Barra de pesquisa e botão de adicionar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
  <TextField
    label="Pesquisar (Nome, Telefone, Placa)"
    variant="outlined"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{ flex: 1, marginRight: '10px' }} // Faz o campo ocupar mais espaço
  />
  <Button variant="contained" color="primary" onClick={handleOpenUserModal}>
    Adicionar Cliente
  </Button>
</div>

      {/* Tabela de usuários */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Placa</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.nome}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.telefone}</TableCell>
                <TableCell>{user.placa}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleOpenPreBudgetModal(user)}
                  >
                    Gerar Pré Orçamento
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <Pagination
        count={totalPages}
        page={page}
        onChange={(event, value) => setPage(value)}
        color="primary"
        style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
      />

      {/* Modal para adicionar novo usuário */}
      <Modal open={openUserModal} onClose={handleCloseUserModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
          }}
        >
          <h2>Adicionar Novo Usuário</h2>
          <TextField
            fullWidth
            label="Nome"
            variant="outlined"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Telefone"
            variant="outlined"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Placa"
            variant="outlined"
            value={newUser.plate}
            onChange={(e) => setNewUser({ ...newUser, plate: e.target.value })}
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddUser}
            style={{ marginTop: '20px' }}
          >
            Criar
          </Button>
        </Box>
      </Modal>

      {/* Modal de pré-orçamento */}
      <Modal open={openPreBudgetModal} onClose={handleClosePreBudgetModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
          }}
        >
          <h2>Pré-Orçamento para {selectedUser?.nome}</h2>
          {/* Aqui você pode adicionar o conteúdo do seu formulário de pré-orçamento */}
          <TextField
            fullWidth
            label="Descrição do Serviço"
            variant="outlined"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Valor Estimado"
            variant="outlined"
            margin="normal"
          />


          <Button
            variant="contained"
            color="primary"
            style={{ marginTop: '20px' }}
            onClick={handleOpenFullscreenModal} // Troque por sua função de envio do pré-orçamento
          >
            Pré-Orçamento
          </Button>
        </Box>
      </Modal>



      <Modal open={openFullscreenModal} onClose={handleCloseFullscreenModal}>
  <Box
    sx={{
      position: 'fixed', // Usando 'fixed' para garantir que o modal fique fixo na tela
      top: '50%', // Centraliza verticalmente
      left: '50%', // Centraliza horizontalmente
      transform: 'translate(-50%, -50%)', // Ajusta para garantir centralização completa
      width: '52%', // Ajuste de largura conforme necessário
      height: '90%', // Ajuste de altura para garantir um bom espaço
      bgcolor: 'background.paper',
      overflow: 'auto',
      borderRadius: '8px', // Opcional, para bordas arredondadas
      boxShadow: 24, // Opcional, para dar um efeito de sombra no modal
    }}
  >
    {/* Botão para fechar o modal */}
    <Button
      variant="contained"
      color="secondary"
      style={{ position: 'absolute', top: '10px', right: '10px' }}
      onClick={handleCloseFullscreenModal}
    >
      Fechar
    </Button>

    {/* Renderizar o componente Preorcamento */}
    <Preorcamento user={selectedUser}  />
  </Box>
</Modal>



    </div>
  );
};

export default UserTable;
