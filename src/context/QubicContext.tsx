import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { qubicService, IdentityPackage, ContractStats } from '../services/qubicService';
import { config } from '../config';

// Interfaz para las estadísticas de red
interface NetworkStats {
  currentTick: number;
  ticksInCurrentEpoch: number;
  emptyTicksInCurrentEpoch: number;
  epochTickQuality: number;
  circulatingSupply: string;
  epochNumber: number;
  timestamp: number;
  marketCap: string;
  price: number;
  activeAddresses: number;
  averageTickTime?: number; // Calculado localmente
}

// Interfaz para el estado del contexto
interface QubicContextState {
  currentTick: number;
  identity: IdentityPackage | null;
  balance: string;
  contractStats: ContractStats | null;
  networkStats: NetworkStats | null;
  tickHistory: { tick: number; timestamp: number }[];
  isLoading: boolean;
  error: string | null;
}

// Interfaz para las acciones del contexto
interface QubicContextActions {
  createWallet: (seedPhrase: string) => Promise<void>;
  refreshBalance: () => Promise<void>;
  refreshContractStats: () => Promise<void>;
  refreshNetworkStats: () => Promise<void>;
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
    networkStats: null,
    tickHistory: [],
    isLoading: false,
    error: null
  });

  // Efecto para actualizar las estadísticas de red periódicamente
  useEffect(() => {
    const fetchNetworkStats = async () => {
      try {
        // Obtener estadísticas de red completas
        const networkStats = await qubicService.getNetworkStats();
        
        // Actualizar estado
        setState(prev => {
          // Actualizar historial de ticks si el tick ha cambiado
          let newTickHistory = [...prev.tickHistory];
          if (networkStats.currentTick !== prev.currentTick) {
            newTickHistory = [
              { tick: networkStats.currentTick, timestamp: Date.now() },
              ...prev.tickHistory
            ].slice(0, 10); // Mantener los últimos 10 ticks
          }
          
          // Calcular tiempo promedio entre ticks
          let averageTickTime = 0;
          if (newTickHistory.length > 1) {
            const times = [];
            for (let i = 0; i < newTickHistory.length - 1; i++) {
              times.push(newTickHistory[i].timestamp - newTickHistory[i + 1].timestamp);
            }
            averageTickTime = times.reduce((sum, time) => sum + time, 0) / times.length;
          }
          
          return { 
            ...prev, 
            currentTick: networkStats.currentTick,
            networkStats: {
              ...networkStats,
              averageTickTime
            },
            tickHistory: newTickHistory,
            error: null 
          };
        });
      } catch (error) {
        console.error('Error al obtener estadísticas de red:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'Error de conexión con el nodo Qubic. Por favor, verifica tu conexión.'
        }));
      }
    };

    // Llamar inmediatamente
    fetchNetworkStats();

    // Configurar intervalo para actualizar periódicamente
    const interval = setInterval(fetchNetworkStats, config.networkRefreshInterval);

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, []); // Array de dependencias vacío - solo se ejecuta al montar el componente

  // Refrescar estadísticas de red manualmente
  const refreshNetworkStats = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const networkStats = await qubicService.getNetworkStats();
      setState(prev => ({ 
        ...prev, 
        currentTick: networkStats.currentTick,
        networkStats,
        error: null
      }));
    } catch (error) {
      console.error('Error al refrescar estadísticas de red:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Error al obtener estadísticas de red.'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Acciones
  const createWallet = async (seedPhrase: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const identity = await qubicService.createIdentity(seedPhrase);
      setState(prev => ({ ...prev, identity }));
      await refreshBalance();
      // Deshabilitada la actualización de estadísticas para evitar bucles
      // await refreshContractStats();
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
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const stats = await qubicService.getContractStats(config.hm25ContractIndex);
      setState(prev => ({ ...prev, contractStats: stats }));
    } catch (error) {
      console.error('Error al obtener estadísticas del contrato:', error);
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
      
      // Actualizar solo el balance después de ejecutar Echo
      setTimeout(() => {
        // Deshabilitada la actualización de estadísticas para evitar bucles
        // refreshContractStats();
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
      
      // Actualizar solo el balance después de ejecutar Burn
      setTimeout(() => {
        // Deshabilitada la actualización de estadísticas para evitar bucles
        // refreshContractStats();
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
    refreshNetworkStats,
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
