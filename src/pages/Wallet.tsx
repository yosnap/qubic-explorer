import React, { useState } from 'react';
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
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

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
    <div className="container mx-auto px-4 mt-8 mb-8">
      <h1 className="text-2xl font-bold mb-4">Wallet Qubic</h1>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sección para crear wallet */}
        <div className="bg-white rounded-lg shadow-md p-6 h-full">
          <h2 className="text-lg font-semibold mb-3">Crear o Importar Wallet</h2>
          <div className="mt-4">
            <label className="block text-gray-700 mb-2">Frase Semilla</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Ingresa tu frase semilla"
              value={seedPhrase}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeedPhrase(e.target.value)}
              disabled={isLoading}
            />
            <button
              className={`mt-4 w-full py-2 rounded ${
                isLoading || !seedPhrase.trim() 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-primary-main text-white hover:bg-primary-dark'
              }`}
              onClick={handleCreateWallet}
              disabled={isLoading || !seedPhrase.trim()}
            >
              {isLoading ? (
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
              ) : 'Crear/Importar Wallet'}
            </button>
          </div>
        </div>

        {/* Sección de información de la wallet */}
        <div className="bg-white rounded-lg shadow-md p-6 h-full">
          <h2 className="text-lg font-semibold mb-3">Información de la Wallet</h2>
          
          {identity ? (
            <div>
              <div className="mt-3">
                <p className="text-sm text-gray-500">Dirección</p>
                <p className="bg-gray-100 p-2 rounded text-xs break-all mt-1">{identity.address}</p>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500">Balance</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{balance} QU</p>
                  <button 
                    className="ml-2 text-white hover:text-primary-dark"
                    onClick={refreshBalance}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-primary-main"></div>
                    ) : 'Actualizar'}
                  </button>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-medium mb-3">Transferir QU</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-gray-700 mb-1 text-sm">Dirección Destino</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-main"
                      placeholder="Dirección del destinatario"
                      value={targetAddress}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetAddress(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1 text-sm">Cantidad (QU)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-main"
                      placeholder="Cantidad a transferir"
                      value={amount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                      disabled={isLoading}
                      min="1"
                    />
                  </div>
                  
                  <button
                    className={`mt-2 w-full py-2 rounded ${
                      isLoading || !targetAddress.trim() || !amount 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-primary-main text-white hover:bg-primary-dark'
                    }`}
                    onClick={handleTransfer}
                    disabled={isLoading || !targetAddress.trim() || !amount}
                  >
                    {isLoading ? (
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                    ) : 'Transferir'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-gray-500 mb-4">No tienes una wallet activa</p>
              <p className="text-sm text-gray-400 text-center">
                Utiliza la sección "Crear o Importar Wallet" para generar una nueva wallet o importar una existente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;