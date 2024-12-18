import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Grid, Button } from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const CadastrarUsuarioModal = ({ open, onClose }) => {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('Ativo');
  const [permission, setPermission] = useState('usuario');
  const [error, setError] = useState('');


  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name || !email || !password) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    const hashedPassword = btoa(password); // Simples hash base64, considere usar um hash mais seguro no backend

    const userData = {
      fullName: name,
      email: email,
      password: hashedPassword,
      status: status,
      permissao: permission,
      data_criacao: new Date().toISOString(), // Data atual
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_ENDERECO_URL}/revanceback/user/cadastrar_usuario.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      if (response.ok && result.status === 'success') {
        console.log('Usuário criado com sucesso:', result.message);
        onClose(); // Fecha o modal ao criar o usuário
      } else {
        setError(result.message || 'Erro ao criar usuário.');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      setError('Erro de conexão. Tente novamente mais tarde.');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2">
          Criar Novo Usuário
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="Ativo">Ativo</MenuItem>
              <MenuItem value="Inativo">Inativo</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Permissão</InputLabel>
            <Select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
            >
              <MenuItem value="administrador">Administrador</MenuItem>
              <MenuItem value="usuario">Usuário</MenuItem>
              <MenuItem value="observador">Observador</MenuItem>
            </Select>
          </FormControl>
          {error && (
            <Typography color="error" variant="body2" align="center">
              {error}
            </Typography>
          )}
          <Grid container spacing={2} marginTop={2}>
            <Grid item xs={6}>
              <Button variant="contained" color="primary" fullWidth type="submit">
                Criar
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button variant="outlined" color="secondary" fullWidth onClick={onClose}>
                Cancelar
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Modal>
  );
};

export default CadastrarUsuarioModal;
