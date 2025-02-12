import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useNavigate } from 'react-router-dom';

const defaultTheme = createTheme();

export default function SignUp() {
    const navigate = useNavigate();
    const [isTermsAccepted, setIsTermsAccepted] = React.useState(false);
    const [telefone, setTelefone] = React.useState('');
    const [telefoneError, setTelefoneError] = React.useState('');

    // Função para formatar telefone
    const formatTelefone = (value) => {
        value = value.replace(/\D/g, ''); // Remove caracteres não numéricos
        if (value.length > 10) {
            return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
        } else if (value.length > 5) {
            return `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
        } else if (value.length > 2) {
            return `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else {
            return value;
        }
    };

    // Função para validar Telefone
    const validateTelefone = (telefone) => {
        const telefoneRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;
        return telefoneRegex.test(telefone);
    };

    const handleTelefoneChange = (event) => {
        const formattedTelefone = formatTelefone(event.target.value);
        setTelefone(formattedTelefone);
        if (!validateTelefone(formattedTelefone)) {
            setTelefoneError('Telefone inválido. Use o formato (XX) XXXXX-XXXX');
        } else {
            setTelefoneError('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const data = new FormData(event.currentTarget);
    
        // Cria o objeto de dados que será enviado para o backend
        const userData = {
            fullName: data.get('fullName'),
            email: data.get('email'),
            password: data.get('password'),
            telefone: telefone, // Adicionando o telefone
            status: 'Ativo', // Adicionando o status
        };
    
        console.log('Enviando dados:', userData); // Log para depuração
    
        try {
            const response = await fetch(`${process.env.REACT_APP_ENDERECO_URL}/revanceback/user/cadastrar_usuario.php`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
    
            const result = await response.json();
    
            if (response.ok && result.status === 'success') {
                alert('Usuário registrado com sucesso!');
                navigate('/login');
            } else {
                alert(`Erro: ${result.message || 'Erro no servidor'}`);
            }
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            alert('Erro ao registrar usuário. Tente novamente.');
        }
    };
    

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Registre-se
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    autoComplete="given-name"
                                    name="fullName"
                                    required
                                    fullWidth
                                    id="fullName"
                                    label="Nome Completo"
                                    autoFocus
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="E-mail"
                                    name="email"
                                    autoComplete="email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Senha"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="telefone"
                                    label="Telefone"
                                    name="telefone"
                                    autoComplete="telefone"
                                    value={telefone}
                                    onChange={handleTelefoneChange}
                                    error={!!telefoneError}
                                    helperText={telefoneError}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            value="acceptTerms"
                                            color="primary"
                                            checked={isTermsAccepted}
                                            onChange={(e) => setIsTermsAccepted(e.target.checked)}
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
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={!isTermsAccepted}
                        >
                            Criar
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/login" variant="body2">
                                    Já tem uma conta? Entrar
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}
