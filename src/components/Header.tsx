import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Chip,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useQubic } from '../context/QubicContext';

const Header: React.FC = () => {
  const { currentTick, identity, balance } = useQubic();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="static" color="primary">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            Qubic Explorer
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip 
                label={`Tick: ${currentTick}`} 
                color="secondary" 
                variant="outlined" 
              />
              
              {identity && (
                <Chip 
                  label={`Balance: ${balance} QU`} 
                  color="secondary" 
                  variant="outlined" 
                />
              )}
            </Box>
          )}

          <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/wallet"
            >
              Wallet
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/contract"
            >
              Contract
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/transactions"
            >
              Transactions
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
