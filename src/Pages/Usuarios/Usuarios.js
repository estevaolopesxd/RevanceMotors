import React, { useState, useEffect } from 'react';
import {
  Paper,
  AppBar,
  Toolbar,
  Grid,
  TextField,
  Button,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Select,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CadastrarUsuario from './CadastrarUsuario';

export default function Usuarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState([]);
  const [openCreateUserModal, setOpenCreateUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPermission, setNewPermission] = useState('');
  const permissions = ['usuario', 'observador', 'administrador']; // Lista de permissões

  useEffect(() => {
    fetchUsers(); // Fetch users on component mount
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_ENDERECO_URL}/revanceback/user/get_users.php`);
      if (!response.ok) {
        throw new Error(`Erro na resposta da API: ${response.status}`);
      }
      const data = await response.json();
      setRows(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredRows = rows.filter((row) =>
    row.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setNewName(user.nome);
    setNewEmail(user.email);
    setNewPermission(user.permissao);
    setIsUserModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingUser) return; // Verificar se editingUser é null

    try {
      await fetch(`${process.env.REACT_APP_ENDERECO_URL}/revanceback/user/update_users.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          operation: 'update',
          ID: editingUser.ID,
          nome: newName,
          email: newEmail,
          permissao: newPermission,
          status: editingUser.status // Use existing status to avoid changing it accidentally
        })
      });

      setRows(rows.map(row => row.ID === editingUser.ID
        ? { ...row, nome: newName, email: newEmail, permissao: newPermission }
        : row
      ));
      setConfirmDialogOpen(true);
      setIsUserModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Erro ao editar usuário:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return; // Verificar se selectedUser é null

    try {
      await fetch(`${process.env.REACT_APP_ENDERECO_URL}/revanceback/user/update_users.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          operation: 'delete',
          ID: selectedUser.ID
        })
      });

      setRows(rows.filter(row => row.ID !== selectedUser.ID));
      setDeleteConfirmDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
    }
  };

  const handleStatusChange = async () => {
    if (!editingUser) return; // Verificar se editingUser é null

    try {
      const newStatus = editingUser.status === 'Ativo' ? 'Inativo' : 'Ativo';
      await fetch(`${process.env.REACT_APP_ENDERECO_URL}/revanceback/user/update_users.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          operation: 'update',
          ID: editingUser.ID,
          status: newStatus
        })
      });

      setRows(rows.map(row => row.ID === editingUser.ID
        ? { ...row, status: newStatus }
        : row
      ));
      setEditingUser({ ...editingUser, status: newStatus });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const handleUserModalClose = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const handleOpenCreateUserModal = () => {
    setOpenCreateUserModal(true);
  };

  const handleCreateUserModalClose = () => {
    setOpenCreateUserModal(false);
  };

  return (
    <Paper sx={{ maxWidth: '100%', margin: 'auto', overflow: 'hidden' }}>
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
      >
        <Toolbar>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <SearchIcon color="inherit" sx={{ display: 'block' }} />
            </Grid>
            <Grid item xs>
              <TextField
                fullWidth
                placeholder="Pesquise por nome ou departamento"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: 'default' },
                }}
                variant="standard"
              />
            </Grid>
            <Grid item>
              <Button variant="contained" sx={{ mr: 1 }} onClick={handleOpenCreateUserModal}>
                Adicionar Usuário
              </Button>
              <Tooltip title="Atualizar">
                <IconButton onClick={fetchUsers}>
                  <RefreshIcon color="inherit" sx={{ display: 'block' }} />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>

      <TableContainer component={Paper} sx={{ margin: '16px' }}>
        <Table>
          <TableHead sx={{ fontWeight: 'bold' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>E-mail</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Data da Criação</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Permissão</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.ID} sx={{ '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}>
                <TableCell>{row.ID}</TableCell>
                <TableCell>{row.nome}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell> {new Date(row.data_criacao).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{row.permissao}</TableCell>
                <TableCell>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => handleOpenEditModal(row)}>
                      <EditIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para criar usuário */}
      <CadastrarUsuario open={openCreateUserModal} onClose={handleCreateUserModalClose} />

      {/* Modal para editar usuário */}
      <Dialog open={isUserModalOpen} onClose={handleUserModalClose}>
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="E-mail"
            type="email"
            fullWidth
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Select
            fullWidth
            value={newPermission}
            onChange={(e) => setNewPermission(e.target.value)}
            margin="dense"
            sx={{ mb: 2 }}
          >
            {permissions.map((permission) => (
              <MenuItem key={permission} value={permission}>
                {permission}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleStatusChange}
            sx={{ mt: 2 }}
          >
            {editingUser?.status === 'Ativo' ? 'Desativar' : 'Ativar'}
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUserModalClose}>Cancelar</Button>
          <Button
            onClick={() => {
              handleEditSubmit();
              setConfirmDialogOpen(true);
            }}
          >
            Salvar
          </Button>
          <Button
            color="error"
            onClick={() => {
              setDeleteConfirmDialogOpen(true);
            }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para confirmar exclusão */}
      <Dialog
        open={deleteConfirmDialogOpen}
        onClose={() => setDeleteConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>Você tem certeza de que deseja excluir o usuário {selectedUser?.nome}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete}>Excluir</Button>
        </DialogActions>
      </Dialog>

      {/* Modal para confirmação das alterações */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Alterações Salvas</DialogTitle>
        <DialogContent>
          <Typography>As alterações foram salvas com sucesso!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}