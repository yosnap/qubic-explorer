import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  AccountBalanceWallet as WalletIcon 
} from '@mui/icons-material';
import { useQubic } from '../context/QubicContext';
import { Link as RouterLink } from 'react-router-dom';
import { config } from '../config';

// Tipo para el historial de ticks
interface TickHistory {
  tick: number;
  timestamp: number;
}

const Dashboard: React.FC = () => {
  const { currentTick, identity, balance, contractStats, refreshContractStats } = useQubic();
  
  // Estado local
  const [tickHistory, setTickHistory] = useState<TickHistory[]>([]);
  const [networkInfo, setNetworkInfo] = useState({
    averageTickTime: 0,
    startTime: new Date()
  });

  // Actualizar historial de ticks cuando cambia el tick actual
  useEffect(() => {
    if (currentTick > 0) {
      setTickHistory(prev => {
        // Agregar nuevo tick al historial
        const newHistory = [
          { tick: currentTick, timestamp: Date.now() },
          ...prev
        ].slice(0, 10); // Limitar a los últimos 10 ticks
        
        // Calcular tiempo promedio entre ticks si tenemos más de 1
        if (newHistory.length > 1) {
          const times = [];
          for (let i = 0; i < newHistory.length - 1; i++) {
            times.push(newHistory[i].timestamp - newHistory[i + 1].timestamp);
          }
          const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
          setNetworkInfo(prev => ({
            ...prev,
            averageTickTime: avgTime
          }));
        }
        
        return newHistory;
      });
    }
  }, [currentTick]);

  // Cargar estadísticas del contrato al montar el componente
  useEffect(() => {
    refreshContractStats();
  }, [refreshContractStats]);

  // Formatear milisegundos a formato legible
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Qubic Network Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Estadísticas de la red */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Estadísticas de la Red
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" color="text.secondary">
                        Tick Actual
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {currentTick}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SpeedIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" color="text.secondary">
                        Velocidad Promedio
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {networkInfo.averageTickTime ? formatTime(networkInfo.averageTickTime) : 'Calculando...'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tiempo promedio entre ticks
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Historial de Ticks
            </Typography>
            
            {tickHistory.length > 0 ? (
              <List>
                {tickHistory.map((item, index) => (
                  <React.Fragment key={item.tick}>
                    <ListItem>
                      <ListItemText 
                        primary={`Tick #${item.tick}`}
                        secondary={new Date(item.timestamp).toLocaleTimeString()}
                      />
                      {index > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          + {formatTime(item.timestamp - tickHistory[index+1]?.timestamp)}
                        </Typography>
                      )}
                    </ListItem>
                    {index < tickHistory.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Información de la wallet y contrato */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3} direction="column">
            <Grid item>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WalletIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Mi Wallet
                    </Typography>
                  </Box>
                  
                  {identity ? (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Dirección
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ 
                          wordBreak: 'break-all', 
                          bgcolor: 'action.hover', 
                          p: 1, 
                          borderRadius: 1,
                          mb: 2,
                          fontSize: '0.75rem'
                        }}
                      >
                        {identity.address}
                      </Typography>

                      <Typography variant="h5" gutterBottom>
                        {balance} QU
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        No tienes una wallet activa
                      </Typography>
                      <Button 
                        variant="contained" 
                        component={RouterLink} 
                        to="/wallet"
                        fullWidth
                      >
                        Crear Wallet
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <StorageIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Contrato HM25
                    </Typography>
                  </Box>
                  
                  {contractStats ? (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Llamadas a Echo
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {contractStats.numberOfEchoCalls}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Llamadas a Burn
                        </Typography>
                        <Typography variant="h5" color="error">
                          {contractStats.numberOfBurnCalls}
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <CircularProgress size={24} />
                  )}

                  <Button 
                    variant="outlined" 
                    component={RouterLink} 
                    to="/contract"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Interactuar con el Contrato
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Información del Nodo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    URL del Nodo
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      wordBreak: 'break-all', 
                      bgcolor: 'action.hover', 
                      p: 1, 
                      borderRadius: 1
                    }}
                  >
                    {config.nodeUrl}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
