import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  Divider,
  CircularProgress
} from '@mui/material';
import { useQubic } from '../context/QubicContext';

const Wallet: React.FC = () => {
  const { 
    identity, 
    balance, 
    isLoading, 
    error, 
    createWallet, 
    refreshBalance,
    transferQU
  } = useQubic();

  // Estado local
  const [seedPhrase, setSeedPhrase] = useState('');
  const [targetAddress, setTargetAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Manejadores
  const handleCreateWallet = async () => {
    if (!seedPhrase.trim()) {
      setNotification({
        open: true,
        message: 'Por favor, ingresa una frase semilla',
        severity: 'error'
      });
      return;
    }

    try {
      await createWallet(seedPhrase);
      setNotification({
        open: true,
        message: 'Wallet creada exitosamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al crear wallet:', error);
      setNotification({
        open: true,
        message: `Error al crear wallet: ${error instanceof Error ? error.message : 'Desconocido'}`,
        severity: 'error'
      });
    }
  };

  const handleTransfer = async () => {
    if (!targetAddress.trim() || !amount.trim()) {
      setNotification({
        open: true,
        message: 'Por favor, completa todos los campos',
        severity: 'error'
      });
      return;
    }

    if (!/^\d+$/.test(amount)) {
      setNotification({
        open: true,
        message: 'El monto debe ser un número entero',
        severity: 'error'
      });
      return;
    }

    try {
      const result = await transferQU(targetAddress, amount);
      setNotification({
        open: true,
        message: result,
        severity: 'success'
      });
      setTargetAddress('');
      setAmount('');
    } catch (error) {
      console.error('Error al transferir QU:', error);
      setNotification({
        open: true,
        message: `Error al transferir QU: ${error instanceof Error ? error.message : 'Desconocido'}`,
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Wallet Qubic
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Sección para crear wallet */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Crear o Importar Wallet
            </Typography>
            <Box component="form" noValidate sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Frase Semilla"
                placeholder="Ingresa tu frase semilla"
                margin="normal"
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
                disabled={isLoading}
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleCreateWallet}
                disabled={isLoading || !seedPhrase.trim()}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Crear/Importar Wallet'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Sección de información de la wallet */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Información de la Wallet
            </Typography>
            
            {identity ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Dirección
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    wordBreak: 'break-all', 
                    bgcolor: 'action.hover', 
                    p: 1, 
                    borderRadius: 1 
                  }}
                >
                  {identity.address}
                </Typography>

                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Balance
                    </Typography>
                    <Typography variant="h5">
                      {balance} QU
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    onClick={refreshBalance}
                    disabled={isLoading}
                  >
                    Actualizar
                  </Button>
                </Box>
              </Box>
            ) : (
              <Alert severity="info">
                Crea o importa una wallet para ver su información
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Sección para transferir QU */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transferir QU
              </Typography>

              {identity ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Dirección Destino"
                      placeholder="Ingresa la dirección de destino"
                      margin="normal"
                      value={targetAddress}
                      onChange={(e) => setTargetAddress(e.target.value)}
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Cantidad de QU"
                      placeholder="Ingresa la cantidad a transferir"
                      margin="normal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={isLoading}
                      type="number"
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="warning">
                  Necesitas crear o importar una wallet primero
                </Alert>
              )}
            </CardContent>
            {identity && (
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleTransfer}
                  disabled={isLoading || !targetAddress.trim() || !amount.trim()}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Transferir'}
                </Button>
              </CardActions>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Notificación */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Wallet;