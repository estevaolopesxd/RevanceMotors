import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Toolbar from '@mui/material/Toolbar';
import { useNavigate } from 'react-router-dom';

const lightColor = 'rgba(255, 255, 255, 0.7)';

function Header(props) {
  const { onDrawerToggle } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('permissao');
      sessionStorage.removeItem('user');
      console.log('Usuário deslogado com sucesso');
      window.location.reload(); // Redireciona para a página de login após deslogar
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
    handleMenuClose(); // Fecha o menu após deslogar
  };

  return (
    <React.Fragment>
      {/* AppBar for Menu and Notifications */}
      <AppBar
        color="primary"
        position="sticky"
        elevation={0}
        sx={{ display: { xs: 'none', sm: 'block' } }} // Ocultar em telas pequenas
      >
        <Toolbar>
          <Grid container spacing={1} alignItems="center">
            {/* <Grid item>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={onDrawerToggle}
                edge="start"
              >
                <MenuIcon />
              </IconButton>
            </Grid> */}
            <Grid item xs />

            <Grid item>
              <IconButton
                color="inherit"
                sx={{ p: 0.5 }}
                onClick={handleMenuOpen}
              >
                <Avatar src="/static/images/avatar/1.jpg" alt="Meu Avatar" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    width: 200,
                    maxWidth: '100%',
                  },
                }}
              >
                <MenuItem onClick={handleLogout}>
                  Deslogar
                </MenuItem>
              </Menu>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>

      {/* AppBar for Title */}
      <AppBar
        component="div"
        color="primary"
        position="static"
        elevation={0}
        sx={{ zIndex: 0, display: { xs: 'none', sm: 'block' } }} // Ocultar em telas pequenas
      >
        <Toolbar>
          <Grid container alignItems="center" justifyContent="center">
            <Typography color="inherit" variant="h5" component="h1">
              Sistema de Orçamento Revancers
            </Typography>
          </Grid>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}

Header.propTypes = {
  onDrawerToggle: PropTypes.func.isRequired,
};

export default Header;
