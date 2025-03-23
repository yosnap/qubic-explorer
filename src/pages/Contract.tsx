import React, { useState, useEffect } from 'react';
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
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  // Cargar estadísticas del contrato al montar el componente
  useEffect(() => {
    // Deshabilitado para evitar bucles infinitos
    // refreshContractStats();
    console.log('Carga de estadísticas del contrato deshabilitada');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="container mx-auto px-4 mt-8 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contrato HM25</h1>
        <span className="px-3 py-1 rounded-full text-primary-main border border-primary-main text-sm">
          Índice: {config.hm25ContractIndex}
        </span>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {notification.open && (
        <div className={`${
          notification.severity === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
        } border px-4 py-3 rounded mb-4 relative`}>
          <span>{notification.message}</span>
          <button 
            className="absolute top-0 right-0 p-1 mt-1 mr-2"
            onClick={handleCloseNotification}
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Estadísticas del contrato */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Estadísticas del Contrato</h2>
            <button 
              className={`px-4 py-1 rounded border border-primary-main text-primary-main hover:bg-primary-main hover:text-white ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={refreshContractStats}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-primary-main"></div>
              ) : 'Actualizar'}
            </button>
          </div>

          {isLoading && !contractStats ? (
            <div className="flex justify-center my-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-primary-main"></div>
            </div>
          ) : contractStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xl font-medium text-primary-main mb-1">Llamadas a Echo</h3>
                <p className="text-3xl font-bold">{contractStats.numberOfEchoCalls}</p>
                <p className="text-sm text-gray-500 mt-2">
                  La función Echo responde con un eco de la cantidad de QU enviada al contrato.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xl font-medium text-secondary-main mb-1">Llamadas a Burn</h3>
                <p className="text-3xl font-bold">{contractStats.numberOfBurnCalls}</p>
                <p className="text-sm text-gray-500 mt-2">
                  La función Burn destruye permanentemente la cantidad de QU enviada al contrato.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-gray-500">
              No se pudieron cargar las estadísticas del contrato.
            </div>
          )}
        </div>

        {/* Interacción con el contrato */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Interactuar con el Contrato</h2>
          
          {identity ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Función Echo */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-primary-main mb-2">Función Echo</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Envía QU al contrato para probar la función de eco. Recibirás la misma cantidad de vuelta.
                </p>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1 text-sm">Cantidad (QU)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-main"
                    placeholder="Cantidad a enviar"
                    value={echoAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEchoAmount(e.target.value)}
                    disabled={isLoading}
                    min="1"
                  />
                </div>
                
                <button
                  className={`w-full py-2 rounded ${
                    isLoading || !echoAmount.trim() 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-primary-main text-white hover:bg-primary-dark'
                  }`}
                  onClick={handleExecuteEcho}
                  disabled={isLoading || !echoAmount.trim()}
                >
                  {isLoading ? (
                    <div className="inline-block h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                  ) : 'Ejecutar Echo'}
                </button>
              </div>
              
              {/* Función Burn */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-secondary-main mb-2">Función Burn</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Quema permanentemente una cantidad de QU. Esta acción es irreversible.
                </p>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1 text-sm">Cantidad (QU)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-main"
                    placeholder="Cantidad a quemar"
                    value={burnAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBurnAmount(e.target.value)}
                    disabled={isLoading}
                    min="1"
                  />
                </div>
                
                <button
                  className={`w-full py-2 rounded ${
                    isLoading || !burnAmount.trim() 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-secondary-main text-white hover:bg-secondary-dark'
                  }`}
                  onClick={handleExecuteBurn}
                  disabled={isLoading || !burnAmount.trim()}
                >
                  {isLoading ? (
                    <div className="inline-block h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                  ) : 'Ejecutar Burn'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 mb-2">Necesitas una wallet para interactuar con el contrato</p>
              <a href="/wallet" className="text-primary-main hover:underline">Ir a la sección de Wallet</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contract;
