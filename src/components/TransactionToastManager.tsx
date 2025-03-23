import React, { useState, useCallback } from 'react';
import TransactionToast from './TransactionToast';

export interface ToastProps {
  id: string;
  title: string;
  message: string;
  type: 'incoming' | 'outgoing';
}

const TransactionToastManager: React.FC = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  
  // Método para eliminar un toast específico
  const removeToast = useCallback((id: string) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }, []);
  
  // Método para añadir un nuevo toast
  const addToast = useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newToast = { ...toast, id };
    
    setToasts(currentToasts => [...currentToasts, newToast]);
    
    return id;
  }, []);
  
  // Método para añadir una notificación de transacción entrante
  const addIncomingTransaction = useCallback((amount: string, from: string) => {
    return addToast({
      title: 'Nueva transacción entrante',
      message: `Has recibido ${amount} QU de ${from}`,
      type: 'incoming'
    });
  }, [addToast]);
  
  // Método para añadir una notificación de transacción saliente
  const addOutgoingTransaction = useCallback((amount: string, to: string) => {
    return addToast({
      title: 'Nueva transacción saliente',
      message: `Se han enviado ${amount} QU a ${to}`,
      type: 'outgoing'
    });
  }, [addToast]);
  
  // Exponer métodos a través del objeto window para uso global
  React.useEffect(() => {
    // Extender el objeto Window para añadir nuestras funciones
    interface ExtendedWindow extends Window {
      transactionToasts?: {
        addIncomingTransaction: (amount: string, from: string) => string;
        addOutgoingTransaction: (amount: string, to: string) => string;
        removeToast: (id: string) => void;
      };
    }
    
    // Añadir métodos al objeto global window
    const extendedWindow = window as ExtendedWindow;
    extendedWindow.transactionToasts = {
      addIncomingTransaction,
      addOutgoingTransaction,
      removeToast
    };
    
    console.log("TransactionToastManager - Métodos registrados en window.transactionToasts");
    
    // Limpiar al desmontar
    return () => {
      if (extendedWindow.transactionToasts) {
        delete extendedWindow.transactionToasts;
        console.log("TransactionToastManager - Métodos eliminados de window.transactionToasts");
      }
    };
  }, [addIncomingTransaction, addOutgoingTransaction, removeToast]);
  
  return (
    <div className="fixed top-0 right-0 z-50 p-4 max-w-sm w-full">
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ marginBottom: '10px' }}>
          <TransactionToast
            title={toast.title}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default TransactionToastManager; 