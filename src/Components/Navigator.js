import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PeopleIcon from '@mui/icons-material/People';
import ClearIcon from '@mui/icons-material/Clear';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BusinessIcon from '@mui/icons-material/Business';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import Groups2Icon from '@mui/icons-material/Groups2';
import { useTheme, useMediaQuery, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';


// Função para obter o usuário do sessionStorage
const getUserPermissions = () => {
  const storedUser = sessionStorage.getItem('user');
  let permissions = [];
  try {
    const user = storedUser ? JSON.parse(storedUser) : null;
    permissions = user ? user.permissao : [];
  } catch (error) {
    console.error("Erro ao parsear o usuário do sessionStorage:", error);
  }
  return permissions;
};

// Define as categorias para o menu de navegação
const categories = [

  {
    id: 'Clientes',
    children: [
      { id: 'Todos Clientes', icon: <PeopleIcon />, route: '/clients' , allowedPermissions: ['administrador']},
      // { id: 'Logs', icon: <Logger />, route: '/logger' , allowedPermissions: ['administrador']},
    ],
  },
  {
    id: 'Assistencia',
    children: [
      { id: 'Pré Orçamentos', icon: <RequestQuoteIcon />, route: '/pre-budget', allowedPermissions: ['administrador', 'usuario', 'observador'] },
      { id: 'Orçamentos Realizados', icon: <ClearIcon />, route: '/budget', allowedPermissions: ['administrador', 'usuario', 'observador'] },
      { id: 'Serviços Prestados ', icon: <ClearIcon />, route: '/list-budget', allowedPermissions: ['administrador', 'usuario', 'observador'] },
    ],
  },
  {
    id: 'Administrador',
    children: [
      { id: 'Todos Usuários', icon: <Groups2Icon />, route: '/usuarios' , allowedPermissions: ['administrador']},
      // { id: 'Logs', icon: <Logger />, route: '/logger' , allowedPermissions: ['administrador']},
    ],
  },
];

const item = {
  py: '2px',
  px: 3,
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover, &:focus': {
    bgcolor: 'rgba(255, 255, 255, 0.08)',
  },
};

const itemCategory = {
  boxShadow: '0 -1px 0 rgb(255,255,255,0.1) inset',
  py: 1.5,
  px: 3,
};

// Define o componente Navigator
export default function Navigator(props) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const userPermissions = getUserPermissions();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={() => setOpen(true)}
          sx={{ display: { xs: 'block', md: 'none' }, position: 'absolute', top: 0, left: 0 }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          width: 256,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 256,
            boxSizing: 'border-box',
          },
        }}
        {...props}
      >
        <List disablePadding>
          <ListItem sx={{ ...item, ...itemCategory, fontSize: 22, color: '#fff' }}>
           Revance Motors
          </ListItem>

          {categories.map(({ id, children }) => {
            const filteredChildren = children.filter(({ allowedPermissions }) =>
              allowedPermissions.length === 0 || allowedPermissions.some(permission => userPermissions.includes(permission))
            );

            if (filteredChildren.length === 0) return null;

            return (
              <Box key={id} sx={{ bgcolor: '#101F33' }}>
                <ListItem sx={{ py: 2, px: 3 }}>
                  <ListItemText sx={{ color: '#fff' }}>{id}</ListItemText>
                </ListItem>
                {filteredChildren.map(({ id: childId, icon, route }) => (
                  <ListItem disablePadding key={childId}>
                    <ListItemButton onClick={() => handleNavigation(route)} sx={item}>
                      <ListItemIcon sx={{ color: '#fff' }}>{icon}</ListItemIcon>
                      <ListItemText sx={{ color: '#fff' }}>{childId}</ListItemText>
                    </ListItemButton>
                  </ListItem>
                ))}
                <Divider sx={{ mt: 2 }} />
              </Box>
            );
          })}
        </List>
      </Drawer>
    </>
  );
}
