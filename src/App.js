// App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

// Import components
import Navigator from './Components/Navigator';
import Header from './Components/Header';

// Import permissionamento
import PermissionGate from './Hooks/PermissionGate/PermissionGate';

// Import pages
import Homepage from './Pages/Homepage/Homepage';
import Login from './Pages/Login/Login';
import Registrar from './Pages/Registrar/Registrar';
import Usuarios from './Pages/Usuarios/Usuarios';
import Orcamento from './Pages/Orcamento/Orcamento';
import Preorcamento from './Pages/Preorcamento/Preorcamento';
import ListaOrcamento from './Pages/ListaOrcamento/ListaOrcamento';
import Clients from './Pages/Clients/Clients'
import AddClient from './Pages/AddClient/AddClient.js';


// Define o tema
const theme = createTheme({
  palette: {
    primary: {
      light: '#63ccff',
      main: '#009be5',
      dark: '#006db3',
    },
  },
  typography: {
    h5: {
      fontWeight: 500,
      fontSize: 26,
      letterSpacing: 0.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#081627',
          width: 256,
        },
      },
    },
  },
});

function App() {
  const [user, setUser] = useState(null);


  useEffect(() => {
    const storedUser = sessionStorage.getItem('user'); // Usa sessionStorage
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Erro ao parsear o usuário do sessionStorage:", error);
      }
    } else {
      console.log("Nenhum usuário encontrado no sessionStorage.");
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('user'); // Usa sessionStorage
    setUser(null);
    window.location.reload();

  };

  // Função para verificar autenticação
  const isAuthenticated = () => !!user;

  if (isAuthenticated == true) {
    <Navigate to="/homepage" />

  } else {
    <Navigate to="/login" />

  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter basename="/">
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {isAuthenticated() && <Navigator />}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {isAuthenticated() && <Header />}
            <Box component="main" sx={{ flex: 1, py: 6, px: 4, bgcolor: '#eaeff1' }}>
              <Routes>
                <Route path="/login" element={isAuthenticated() ? <Navigate to="/homepage" /> : <Login />} />
                <Route path="/registrar" element={isAuthenticated() ? <Navigate to="/homepage" /> : <Registrar />} />
                <Route path="/" element={isAuthenticated() ? <Homepage /> : <Navigate to="/login" />} />
                <Route path="/homepage" element={isAuthenticated() ? <Homepage /> : <Navigate to="/login" />} />
                <Route path="/pre-budget" element={isAuthenticated() ? <Preorcamento /> : <Navigate to="/login" />} />
                <Route path="/budget" element={isAuthenticated() ? <Orcamento /> : <Navigate to="/login" />} />
                <Route path="/list-budget" element={isAuthenticated() ? <ListaOrcamento /> : <Navigate to="/login" />} />
                <Route path="/addclient" element={isAuthenticated() ? <AddClient /> : <Navigate to="/login" />} />
                <Route path="/clients" element={isAuthenticated() ? <Clients /> : <Navigate to="/login" />} />
                
                <Route path="/usuarios" element={isAuthenticated() ? (<PermissionGate allowedRoutes={['administrador']}><Usuarios />
                </PermissionGate>
                ) : (
                  <Navigate to="/login" />
                )
                }
                />

              </Routes>
            </Box>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
