import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

const defaultTheme = createTheme();

export default function SignInSide() {
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Cria uma instância do navigate
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);



  const handleTermsChange = (event) => {
    setIsTermsAccepted(event.target.checked);
  };



  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');

    if (email !== "" && password !== "") {
      const requestBody = JSON.stringify({ email, password });

      try {
        const response = await fetch(`${process.env.REACT_APP_ENDERECO_URL}/revanceback/login.php`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: requestBody
        });

        const result = await response.json();
        console.log("Resposta completa da API:", result);

        if (response.ok) {
          if (result.status === "success") {
            console.log("Login bem-sucedido:", result.message);

            if (result.user) {
              sessionStorage.setItem('user', JSON.stringify(result.user)); // Armazena no sessionStorage
              console.log("Dados armazenados no sessionStorage:", sessionStorage.getItem('user'));

              // Verifica se o status do usuário é Ativo
              if (result.user.status === "Ativo") {
                navigate('/homepage'); // Redireciona para a página inicial
                window.location.reload(); // Recarrega a página para garantir que o usuário esteja logado
              } else {
                setError("Seu usuario está inativo. Entre em contato com o administrador.");
              }
            } else {
              setError("Dados do usuário não encontrados.");
            }
          } else {
            setError(result.message);
          }
        } else {
          throw new Error("Erro na resposta do servidor");
        }
      } catch (error) {
        console.error("Erro de conexão:", error);
        setError("Erro de conexão. Tente novamente mais tarde.");
      }
    } else {
      setError("Preencha todos os campos");
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Grid container component="main" sx={{ height: '100vh', overflow: 'hidden' }}>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url("background.jpg")',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Bem vindo novamente!
            </Typography>

            <Typography component="h5" variant="h6">
              Faça login na sua conta
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Senha"
                type="password"
                id="password"
                autoComplete="current-password"
              />



              {/* <Grid md={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      value="acceptTerms"
                      color="primary"
                      checked={isTermsAccepted}
                      onChange={handleTermsChange}
                    />
                  }
                  label={
                    <>
                      Ao continuar, você concorda com nossos Termos de Serviço e {' '}
                      <Link href="/path/to/termos-e-politica.pdf" target="_blank" rel="noopener noreferrer">
                        Política de Privacidade
                      </Link>
                    </>
                  }
                />

              </Grid> */}







              <Button
                type="submit"
                fullWidth
                variant="contained"
                // disabled={!isTermsAccepted}
                sx={{ mt: 3, mb: 2 }}
              >
                Login
              </Button>



                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Lembre-me"
                />




              {error && (
                <Typography color="error" variant="body2" align="center">
                  {error}
                </Typography>
              )}
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Esqueceu sua senha?
                  </Link>
                </Grid>

                <Grid item>

                  <Link href='/registrar' variant="body2">
                    {"Não tem uma conta? Inscrever-se"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
