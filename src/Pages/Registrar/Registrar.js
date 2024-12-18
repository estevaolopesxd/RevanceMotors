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
    const [cpfError, setCpfError] = React.useState('');
    const [telefoneError, setTelefoneError] = React.useState('');

    // Função para validar CPF
    const validateCPF = (cpf) => {
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
        return cpfRegex.test(cpf);
    };

    // Função para validar Telefone
    const validateTelefone = (telefone) => {
        const telefoneRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;
        return telefoneRegex.test(telefone);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);

        const cpf = data.get('cpf');
        const telefone = data.get('telefone');

        // Verificar se CPF e Telefone estão no formato correto
        if (!validateCPF(cpf)) {
            setCpfError('CPF inválido. Use o formato XXX.XXX.XXX-XX');
            return;
        } else {
            setCpfError('');
        }

        if (!validateTelefone(telefone)) {
            setTelefoneError('Telefone inválido. Use o formato (XX) XXXXX-XXXX');
            return;
        } else {
            setTelefoneError('');
        }

        const userData = {
            fullName: data.get('fullName'),
            email: data.get('email'),
            password: data.get('password'),
            cpf: data.get('cpf'),
            telefone: data.get('telefone'),
            oab: data.get('oab'),
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_ENDERECO_URL}/revanceback/user/cadastrar_usuario.php`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                const result = await response.json();
                if (result.status === 'success') {
                    alert('Usuário registrado com sucesso!');
                    navigate('/login');
                } else {
                    alert(`Erro: ${result.message}`);
                }
            } else {
                alert('Erro na resposta do servidor.');
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
                                    id="cpf"
                                    label="CPF"
                                    name="cpf"
                                    autoComplete="cpf"
                                    error={!!cpfError}
                                    helperText={cpfError}
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
                                    error={!!telefoneError}
                                    helperText={telefoneError}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="oab"
                                    label="OAB"
                                    name="oab"
                                    autoComplete="oab"
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
                                <Link href="/processos/login" variant="body2">
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
