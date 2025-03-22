import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Chip
} from '@mui/material';
import { useQubic } from '../context/QubicContext';
import { config } from '../config';

const Contract: React.FC = () => {
  const { 
    identity, 
    contractStats, 
    isLoading, 
    error, 
    refreshContractStats,
    executeEcho,
    executeBurn
  } = useQubic();

  // Estado local
  const [echoAmount, setEchoAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Cargar estadísticas del contrato al montar el componente
  useEffect(() => {
    refreshContractStats();
  }, [refreshContractStats]);

  // Manejadores
  const handleExecuteEcho = async () => {
    if (!echoAmount.trim() || !/^\d+$/.test(echoAmount)) {
      setNotification({
        open: true,
        message: 'Por favor, ingresa un monto válido',
        severity: 'error'
      });
      return;
    }

    try {
      const result = await executeEcho(echoAmount);
      setNotification({
        open: true,
        message: result,
        severity: 'success'
      });
      setEchoAmount('');
    } catch (error) {
      console.error('Error al ejecutar Echo:', error);
      setNotification({
        open: true,
        message: `Error al ejecutar Echo: ${error instanceof Error ? error.message : 'Desconocido'}`,
        severity: 'error'
      });
    }
  };

  const handleExecuteBurn = async () => {
    if (!burnAmount.trim() || !/^\d+$/.test(burnAmount)) {
      setNotification({
        open: true,
        message: 'Por favor, ingresa un monto válido',
        severity: 'error'
      });
      return;
    }

    try {
      const result = await executeBurn(burnAmount);
      setNotification({
        open: true,
        message: result,
        severity: 'success'
      });
      setBurnAmount('');
    } catch (error) {
      console.error('Error al ejecutar Burn:', error);
      setNotification({
        open: true,
        message: `Error al ejecutar Burn: ${error instanceof Error ? error.message : 'Desconocido'}`,
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Contrato HM25
        </Typography>
        <Chip 
          label={`Índice: ${config.hm25ContractIndex}`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Estadísticas del contrato */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Estadísticas del Contrato
              </Typography>
              <Button 
                variant="outlined" 
                onClick={refreshContractStats}
                disabled={isLoading}
              >
                Actualizar
              </Button>
            </Box>

            {isLoading && !contractStats ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            ) : contractStats ? (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h5" gutterBottom color="primary">
                        Llamadas a Echo
                      </Typography>
                      <Typography variant="h3">
                        {contractStats.numberOfEchoCalls}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h5" gutterBottom color="error">
                        Llamadas a Burn
                      </Typography>
                      <Typography variant="h3">
                        {contractStats.numberOfBurnCalls}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                No se pudieron cargar las estadísticas del contrato
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Interacción con el contrato */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Procedimiento Echo
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Envía QU al contrato y recibirás la misma cantidad de vuelta.
              </Typography>

              {identity ? (
                <TextField
                  fullWidth
                  label="Cantidad de QU"
                  placeholder="Ingresa la cantidad a enviar"
                  margin="normal"
                  value={echoAmount}
                  onChange={(e) => setEchoAmount(e.target.value)}
                  disabled={isLoading}
                  type="number"
                  InputProps={{ inputProps: { min: 1 } }}
                />
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
                  onClick={handleExecuteEcho}
                  disabled={isLoading || !echoAmount.trim()}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Ejecutar Echo'}
                </Button>
              </CardActions>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error">
                Procedimiento Burn
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Envía QU al contrato para que sean quemados permanentemente.
              </Typography>

              {identity ? (
                <TextField
                  fullWidth
                  label="Cantidad de QU"
                  placeholder="Ingresa la cantidad a quemar"
                  margin="normal"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  disabled={isLoading}
                  type="number"
                  InputProps={{ inputProps: { min: 1 } }}
                />
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
                  color="error"
                  onClick={handleExecuteBurn}
                  disabled={isLoading || !burnAmount.trim()}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Ejecutar Burn'}
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

export default Contract;
