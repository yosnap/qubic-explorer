import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { qubicService, IdentityPackage, ContractStats } from '../services/qubicService';
import { config } from '../config';

// Interfaz para el estado del contexto
interface QubicContextState {
  currentTick: number;
  identity: IdentityPackage | null;
  balance: string;
  contractStats: ContractStats | null;
  isLoading: boolean;
  error: string | null;
}

// Interfaz para las acciones del contexto
interface QubicContextActions {
  createWallet: (seedPhrase: string) => Promise<void>;
  refreshBalance: () => Promise<void>;
  refreshContractStats: () => Promise<void>;
  executeEcho: (amount: string) => Promise<string>;
  executeBurn: (amount: string) => Promise<string>;
  transferQU: (targetAddress: string, amount: string) => Promise<string>;
}

// Tipo completo del contexto
type QubicContextType = QubicContextState & QubicContextActions;

// Crear el contexto con un valor predeterminado undefined
const QubicContext = createContext<QubicContextType | undefined>(undefined);

// Props para el proveedor del contexto
interface QubicProviderProps {
  children: ReactNode;
}

// Proveedor de contexto de Qubic
export const QubicProvider: React.FC<QubicProviderProps> = ({ children }) => {
  // Estado
  const [state, setState] = useState<QubicContextState>({
    currentTick: 0,
    identity: null,
    balance: '0',
    contractStats: null,
    isLoading: false,
    error: null
  });

  // Efecto para actualizar el tick actual periódicamente
  useEffect(() => {
    const fetchTick = async () => {
      try {
        const tick = await qubicService.getCurrentTick();
        setState(prev => ({ ...prev, currentTick: tick }));
      } catch (error) {
        console.error('Error al obtener el tick actual:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'Error de conexión con el nodo Qubic. Por favor, verifica tu conexión.'
        }));
      }
    };

    // Llamar inmediatamente
    fetchTick();

    // Configurar intervalo para actualizar periódicamente
    const interval = setInterval(fetchTick, config.networkRefreshInterval);

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, []);

  // Acciones
  const createWallet = async (seedPhrase: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const identity = await qubicService.createIdentity(seedPhrase);
      setState(prev => ({ ...prev, identity }));
      await refreshBalance();
      await refreshContractStats();
    } catch (error) {
      console.error('Error al crear la wallet:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Error al crear la wallet. Verifica la frase semilla.' 
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const refreshBalance = async () => {
    if (!state.identity) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const balanceBigInt = await qubicService.getBalance(state.identity.address);
      setState(prev => ({ ...prev, balance: balanceBigInt.toString() }));
    } catch (error) {
      console.error('Error al obtener el balance:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Error al obtener el balance. Verifica la conexión al nodo.' 
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const refreshContractStats = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const stats = await qubicService.getContractStats(config.hm25ContractIndex);
      setState(prev => ({ ...prev, contractStats: stats }));
    } catch (error) {
      console.error('Error al obtener estadísticas del contrato:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Error al obtener estadísticas del contrato. Verifica la conexión al nodo.' 
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const executeEcho = async (amount: string) => {
    if (!state.identity) {
      throw new Error('No hay una wallet activa');
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await qubicService.executeEchoProcedure(
        config.hm25ContractIndex,
        BigInt(amount),
        state.identity
      );
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Actualizar estadísticas después de ejecutar Echo
      setTimeout(() => {
        refreshContractStats();
        refreshBalance();
      }, 3000); // Esperar 3 segundos para que la transacción se procese
      
      return result.message;
    } catch (error) {
      console.error('Error al ejecutar Echo:', error);
      setState(prev => ({ 
        ...prev, 
        error: `Error al ejecutar Echo: ${error instanceof Error ? error.message : 'Desconocido'}` 
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const executeBurn = async (amount: string) => {
    if (!state.identity) {
      throw new Error('No hay una wallet activa');
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await qubicService.executeBurnProcedure(
        config.hm25ContractIndex,
        BigInt(amount),
        state.identity
      );
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Actualizar estadísticas después de ejecutar Burn
      setTimeout(() => {
        refreshContractStats();
        refreshBalance();
      }, 3000); // Esperar 3 segundos para que la transacción se procese
      
      return result.message;
    } catch (error) {
      console.error('Error al ejecutar Burn:', error);
      setState(prev => ({ 
        ...prev, 
        error: `Error al ejecutar Burn: ${error instanceof Error ? error.message : 'Desconocido'}` 
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const transferQU = async (targetAddress: string, amount: string) => {
    if (!state.identity) {
      throw new Error('No hay una wallet activa');
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await qubicService.transferQU(
        targetAddress,
        BigInt(amount),
        state.identity
      );
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Actualizar balance después de la transferencia
      setTimeout(() => {
        refreshBalance();
      }, 3000); // Esperar 3 segundos para que la transacción se procese
      
      return result.message;
    } catch (error) {
      console.error('Error al transferir QU:', error);
      setState(prev => ({ 
        ...prev, 
        error: `Error al transferir QU: ${error instanceof Error ? error.message : 'Desconocido'}` 
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Valor del contexto
  const contextValue: QubicContextType = {
    ...state,
    createWallet,
    refreshBalance,
    refreshContractStats,
    executeEcho,
    executeBurn,
    transferQU
  };

  return (
    <QubicContext.Provider value={contextValue}>
      {children}
    </QubicContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useQubic = () => {
  const context = useContext(QubicContext);
  if (context === undefined) {
    throw new Error('useQubic debe ser usado dentro de un QubicProvider');
  }
  return context;
};
