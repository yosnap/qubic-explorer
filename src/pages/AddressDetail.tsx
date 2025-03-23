import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { qubicService } from "../services/qubicService";
import { io, Socket } from "socket.io-client";

// Interfaz para los detalles de una dirección
interface AddressDetails {
  id: string;
  balance: string;
  validForTick: number;
  latestIncomingTransferTick: number;
  latestOutgoingTransferTick: number;
  incomingAmount: string;
  outgoingAmount: string;
  numberOfIncomingTransfers: number;
  numberOfOutgoingTransfers: number;
}

// Interfaz para las transacciones
interface Transaction {
  id: string;
  sourceAddress: string;
  targetAddress: string;
  amount: string;
  tick: number;
  timestamp: Date | string;
  type: string;
  status: string;
  direction?: "incoming" | "outgoing";
}

// URL del servicio de notificaciones
const NOTIFICATION_SERVICE_URL = "http://localhost:3112";

const AddressDetail: React.FC = () => {
  // Obtener el ID de la dirección de los parámetros de la URL
  const { addressId } = useParams<{ addressId: string }>();
  
  // Estados
  const [addressDetails, setAddressDetails] = useState<AddressDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Estado para el seguimiento
  const [tracking, setTracking] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  // Referencia al socket
  const socketRef = useRef<Socket | null>(null);
  // Estado para notificaciones
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'incoming' | 'outgoing';
    amount: string;
    timestamp: string;
  } | null>(null);
  
  // Formatear un número grande
  const formatNumber = (num: string): string => {
    const parsedNum = parseFloat(num);
    
    if (isNaN(parsedNum)) return "0";
    
    // Para números grandes, usar notación abreviada
    if (parsedNum >= 1_000_000_000) {
      return (parsedNum / 1_000_000_000).toFixed(2) + ' B';
    } else if (parsedNum >= 1_000_000) {
      return (parsedNum / 1_000_000).toFixed(2) + ' M';
    } else if (parsedNum >= 1_000) {
      return (parsedNum / 1_000).toFixed(2) + ' K';
    }
    
    return parsedNum.toString();
  };
  
  // Formatear fecha
  const formatDate = (date: Date | string): string => {
    if (date instanceof Date) {
      return date.toLocaleString();
    }
    if (typeof date === 'string') {
      return new Date(date).toLocaleString();
    }
    return 'Fecha desconocida';
  };
  
  // Formatear dirección (mostrar versión corta)
  const formatAddress = (address: string): string => {
    if (!address || address === "Desconocido") return "Desconocido";
    if (address.length > 16) {
      return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
    }
    return address;
  };

  // Solicitar permiso para notificaciones
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPermissionGranted(true);
        return true;
      } else {
        alert('Para recibir notificaciones, debes permitir el acceso a las notificaciones en tu navegador.');
        return false;
      }
    } else {
      alert('Tu navegador no soporta notificaciones.');
      return false;
    }
  };

  // Mostrar notificación de transacción
  const showTransactionNotification = useCallback((title: string, message: string, type: 'incoming' | 'outgoing', amount: string) => {
    console.log(`Ejecutando showTransactionNotification para ${type} de ${amount}`);
    
    // Mostrar toast de notificación
    const toastManager = document.getElementById('transaction-toast-manager');
    if (toastManager) {
      console.log('Toast manager encontrado, disparando evento');
      const event = new CustomEvent('show-transaction-toast', { 
        detail: { title, message, type, amount } 
      });
      toastManager.dispatchEvent(event);
    } else {
      console.warn('Toast manager no encontrado');
    }
    
    // Siempre intentar mostrar una notificación del sistema
    try {
      console.log('Creando notificación del navegador');
      // Solicitar permiso si aún no se ha concedido
      if (Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            setPermissionGranted(true);
            // Crear la notificación después de obtener permiso
            const notification = new Notification(title, {
              body: message,
              icon: type === 'incoming' ? '/icons/incoming.png' : '/icons/outgoing.png'
            });
            
            // Cerrar automáticamente después de 5 segundos
            setTimeout(() => notification.close(), 5000);
          }
        });
      } else {
        // Si ya tenemos permiso, mostrar la notificación directamente
        const notification = new Notification(title, {
          body: message,
          icon: type === 'incoming' ? '/icons/incoming.png' : '/icons/outgoing.png'
        });
        
        // Cerrar automáticamente después de 5 segundos
        setTimeout(() => notification.close(), 5000);
      }
    } catch (error) {
      console.error('Error al crear notificación:', error);
      // No mostramos alert como fallback
    }
    
    // Reproducir un sonido de notificación
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(err => console.error('Error al reproducir sonido:', err));
    } catch (error) {
      console.error('Error al crear objeto de audio:', error);
    }
  }, []);

  // Función para guardar el estado de seguimiento en localStorage
  const saveTrackingState = useCallback((address: string, isTracking: boolean) => {
    try {
      console.log(`[LOCALSTORE] Intentando guardar dirección ${address} con estado ${isTracking}`);
      // Asegurarnos de que la dirección sea una cadena válida
      if (!address || typeof address !== 'string') {
        console.error('[LOCALSTORE] Error: dirección inválida', address);
        return;
      }
      
      // ARREGLO CRÍTICO: leer el estado actual como un arreglo
      let trackedAddresses;
      try {
        const rawData = localStorage.getItem('qubic_tracked_addresses');
        console.log('[LOCALSTORE] Datos crudos del localStorage:', rawData);
        
        if (rawData) {
          trackedAddresses = JSON.parse(rawData);
          if (!Array.isArray(trackedAddresses)) {
            console.error('[LOCALSTORE] Error: los datos no son un array, reseteando');
            trackedAddresses = [];
          }
        } else {
          trackedAddresses = [];
        }
      } catch (parseError) {
        console.error('[LOCALSTORE] Error al parsear datos:', parseError);
        trackedAddresses = [];
      }
      
      console.log('[LOCALSTORE] Direcciones actualmente guardadas:', trackedAddresses);
      
      if (isTracking) {
        // Añadir a las direcciones seguidas si no existe
        if (!trackedAddresses.includes(address)) {
          trackedAddresses.push(address);
          console.log(`[LOCALSTORE] Añadida nueva dirección ${address}`);
        } else {
          console.log(`[LOCALSTORE] La dirección ${address} ya estaba en seguimiento`);
        }
      } else {
        // Eliminar de las direcciones seguidas
        const index = trackedAddresses.indexOf(address);
        if (index !== -1) {
          trackedAddresses.splice(index, 1);
          console.log(`[LOCALSTORE] Eliminada dirección ${address}`);
        } else {
          console.log(`[LOCALSTORE] La dirección ${address} no estaba en seguimiento`);
        }
      }
      
      // Guardar explícitamente las direcciones
      const jsonData = JSON.stringify(trackedAddresses);
      localStorage.setItem('qubic_tracked_addresses', jsonData);
      console.log('[LOCALSTORE] Nuevas direcciones guardadas:', jsonData);
      
      // Verificar si se guardó correctamente
      const savedData = localStorage.getItem('qubic_tracked_addresses');
      console.log('[LOCALSTORE] Verificación después de guardar:', savedData);
      
      // Forzar un evento de storage para que otros componentes se actualicen
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('[LOCALSTORE] Error al guardar estado de seguimiento:', error);
    }
  }, []);
  
  // Función para verificar si una dirección está siendo seguida
  const isAddressTracked = useCallback((address: string): boolean => {
    try {
      // Asegurarnos de que la dirección sea una cadena válida
      if (!address || typeof address !== 'string') {
        console.error('[LOCALSTORE] Error al verificar seguimiento: dirección inválida', address);
        return false;
      }
      
      const rawData = localStorage.getItem('qubic_tracked_addresses');
      console.log('[LOCALSTORE] Verificando datos crudos:', rawData);
      
      let trackedAddresses;
      try {
        if (rawData) {
          trackedAddresses = JSON.parse(rawData);
          if (!Array.isArray(trackedAddresses)) {
            console.error('[LOCALSTORE] Error: los datos leídos no son un array');
            return false;
          }
        } else {
          return false;
        }
      } catch (parseError) {
        console.error('[LOCALSTORE] Error al parsear datos durante verificación:', parseError);
        return false;
      }
      
      console.log(`[LOCALSTORE] Verificando si la dirección ${address} está en seguimiento:`, trackedAddresses);
      const isTracked = trackedAddresses.includes(address);
      console.log(`[LOCALSTORE] Resultado de verificación: ${isTracked}`);
      return isTracked;
    } catch (error) {
      console.error('[LOCALSTORE] Error al verificar seguimiento:', error);
      return false;
    }
  }, []);

  // Inicializar conexión Socket.IO
  const initializeSocket = useCallback(() => {
    if (!addressId || socketRef.current) return;
    
    console.log(`Iniciando conexión Socket.IO con ${NOTIFICATION_SERVICE_URL}`);
    
    // Conectar al servicio de notificaciones
    const socket = io(NOTIFICATION_SERVICE_URL);
    socketRef.current = socket;
    
    // Manejar eventos de conexión
    socket.on('connect', () => {
      console.log('Conectado al servicio de notificaciones con ID:', socket.id);
      
      // Registrar seguimiento de la dirección
      if (addressId) {
        console.log(`Emitiendo evento trackAddress para: ${addressId}`);
        socket.emit('trackAddress', addressId);
      }
    });
    
    // Manejar eventos de seguimiento
    socket.on('trackingConfirmed', (data: { addressId: string }) => {
      console.log(`Seguimiento confirmado para dirección: ${data.addressId}`);
      setTracking(true);
      setTrackingLoading(false);
    });
    
    // Manejar eventos de error de seguimiento
    socket.on('trackingError', (data: { addressId: string, error: string }) => {
      console.error(`Error al seguir dirección ${data.addressId}: ${data.error}`);
      
      // Mostrar el error pero NO desactivar el seguimiento ni eliminar de localStorage
      setTrackingLoading(false);
      
      // Si el servidor no puede seguir la dirección, mostramos un mensaje pero mantenemos
      // el seguimiento activo localmente para que al menos reciba notificaciones cuando
      // esté en la aplicación
      alert(`Error en el servidor: ${data.error}. El seguimiento funcionará solo mientras estés en la aplicación.`);
    });
    
    // Manejar eventos de untracking
    socket.on('untrackingConfirmed', (data: { addressId: string }) => {
      console.log(`Seguimiento detenido para dirección: ${data.addressId}`);
      
      // No hacemos nada aquí, ya se actualizó en toggleTracking
      setTrackingLoading(false);
    });
    
    // Manejar eventos de transacción detectada
    socket.on('transactionDetected', (data: { 
      addressId: string;
      oldBalance: string;
      newBalance: string;
      difference: string;
      type: 'incoming' | 'outgoing';
      timestamp: string;
    }) => {
      console.log('Transacción detectada:', data);
      
      // Actualizar la información de la dirección
      if (addressId) {
        qubicService.getAddressDetails(addressId)
          .then(details => {
            console.log('Detalles actualizados:', details);
            setAddressDetails(details);
          })
          .catch(err => {
            console.error("Error al actualizar detalles de dirección:", err);
          });
        
        qubicService.getAddressTransactions(addressId)
          .then(txs => {
            console.log('Transacciones actualizadas:', txs);
            setTransactions(txs);
          })
          .catch(err => {
            console.error("Error al actualizar transacciones:", err);
          });
      }
    
      // Mostrar notificación
      const title = data.type === 'incoming'
        ? 'Nueva transacción entrante'
        : 'Nueva transacción saliente';
      
      const message = data.type === 'incoming'
        ? `Has recibido ${data.difference} QU en la dirección ${formatAddress(data.addressId)}`
        : `Se han enviado ${data.difference} QU desde la dirección ${formatAddress(data.addressId)}`;
      
      console.log(`Mostrando notificación: ${title} - ${message}`);
      showTransactionNotification(title, message, data.type as 'incoming' | 'outgoing', data.difference);
    });
    
    // Manejar errores de conexión
    socket.on('connect_error', (error) => {
      console.error('Error al conectar con el servicio de notificaciones:', error);
      
      // No desactivamos el seguimiento local si hay error de conexión
      setTrackingLoading(false);
      
      // Mostrar un mensaje de error en la UI en lugar de un alert
      setError('No se pudo conectar al servicio de notificaciones. El seguimiento funcionará solo mientras estés en la aplicación.');
      
      // Mostrar el error por 5 segundos y luego limpiarlo
      setTimeout(() => {
        setError(null);
      }, 5000);
    });
    
    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log('Desconectado del servicio de notificaciones');
    });
    
    return socket;
  }, [addressId, setTracking, setTrackingLoading, setAddressDetails, setTransactions, showTransactionNotification, saveTrackingState]);
  
  // Función para activar/desactivar seguimiento
  const toggleTracking = async () => {
    setTrackingLoading(true);
    
    try {
      if (!addressId) {
        console.error("ID de dirección no proporcionado");
        return;
      }
      
      if (tracking) {
        // Detener seguimiento
        console.log(`Deteniendo seguimiento para dirección: ${addressId}`);
        
        // Actualizar la UI inmediatamente
        setTracking(false);
        
        // Guardar en localStorage
        saveTrackingState(addressId, false);
        
        // Enviar al servidor si hay conexión
        if (socketRef.current) {
          socketRef.current.emit('untrackAddress', addressId);
        }
      } else {
        // Iniciar seguimiento
        console.log(`Activando seguimiento para dirección: ${addressId}`);
        
        // Pedir permisos si es necesario
        if (!permissionGranted) {
          const granted = await requestNotificationPermission();
          if (!granted) {
            setTrackingLoading(false);
            return;
          }
        }
        
        // Actualizar la UI inmediatamente
        setTracking(true);
        
        // Guardar en localStorage
        saveTrackingState(addressId, true);
        
        // Iniciar conexión al servicio si no existe
        if (!socketRef.current) {
          initializeSocket();
        } else {
          // Si ya existe la conexión, enviar evento de seguimiento
          socketRef.current.emit('trackAddress', addressId);
        }
      }
    } catch (error) {
      console.error("Error al cambiar estado de seguimiento:", error);
    } finally {
      setTrackingLoading(false);
    }
  };
  
  // Cargar datos iniciales y verificar el seguimiento
  useEffect(() => {
    const fetchAddressDetails = async () => {
      if (!addressId) {
        setError("ID de dirección no proporcionado");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Cargar detalles de la dirección
        const details = await qubicService.getAddressDetails(addressId);
        setAddressDetails(details);
        
        // Cargar transacciones de la dirección
        const txs = await qubicService.getAddressTransactions(addressId);
        setTransactions(txs);
        
        // Verificar si esta dirección ya está siendo seguida
        if (addressId) {
          const tracked = isAddressTracked(addressId);
          console.log("[LOCALSTORE] Estado de seguimiento inicial:", tracked);
          setTracking(tracked);
        }
      } catch (err) {
        console.error("Error al cargar detalles de dirección:", err);
        setError("No se pudieron cargar los detalles de la dirección. Por favor, inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAddressDetails();
  }, [addressId, isAddressTracked]);

  // Iniciar la conexión si la dirección está siendo seguida
  useEffect(() => {
    if (tracking && permissionGranted && addressId && !socketRef.current) {
      console.log("Inicializando socket porque el tracking está activo");
      initializeSocket();
    }
  }, [tracking, permissionGranted, addressId, initializeSocket]);

  // Comprobar el estado de los permisos de notificación al cargar
  useEffect(() => {
    // Comprobar si el navegador soporta notificaciones
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setPermissionGranted(true);
      } else if (Notification.permission !== 'denied') {
        // Si el permiso no está denegado ni concedido, solicitarlo automáticamente
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            setPermissionGranted(true);
            // Mostrar una notificación de prueba para confirmar que funciona
            const notification = new Notification('Notificaciones activadas', {
              body: 'Recibirás notificaciones cuando haya cambios en las direcciones que sigues.',
              icon: '/icons/app-icon.png'
            });
            
            // Cerrar automáticamente después de 5 segundos
            setTimeout(() => notification.close(), 5000);
          }
        });
      }
    }
  }, []);

  // Limpiar conexiones al desmontar
  useEffect(() => {
    return () => {
      // Cerrar la conexión al Socket.IO
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  
  // Renderizado de la página
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mensaje de error de conexión */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg">
            <div className="flex items-center">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Notificación */}
      {notification && notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'incoming' 
            ? 'bg-green-100 border-l-4 border-green-500 text-green-700' 
            : 'bg-blue-100 border-l-4 border-blue-500 text-blue-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {notification.type === 'incoming' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                )}
              </svg>
              <h3 className="text-lg font-semibold">
                {notification.type === 'incoming' ? 'Transacción entrante' : 'Transacción saliente'}
              </h3>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-gray-500 hover:text-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-2">
            {notification.type === 'incoming' 
              ? `Has recibido ${notification.amount} QU` 
              : `Se han enviado ${notification.amount} QU`
            }
          </p>
          <p className="text-sm opacity-75 mt-1">
            {formatDate(notification.timestamp)}
          </p>
        </div>
      )}
      
      <div className="flex items-center mb-4">
        <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al dashboard
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Detalles de Dirección</h1>
      
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main"></div>
          <p className="mt-2 text-gray-500">Cargando información...</p>
        </div>
      ) : addressDetails ? (
        <div className="grid grid-cols-1 gap-6">
          {/* Tarjeta de información principal */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="border-b pb-4 mb-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 mb-2">Información General</h2>
                <div>
                  <button
                    onClick={toggleTracking}
                    disabled={trackingLoading}
                    className={`px-4 mb-4 py-2 rounded text-white font-medium flex items-center ${
                      trackingLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : tracking 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {trackingLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {tracking ? 'Deteniendo seguimiento...' : 'Activando seguimiento...'}
                      </>
                    ) : tracking ? (
                      <>
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Detener seguimiento
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Activar seguimiento
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="bg-gray-100 p-3 rounded text-sm font-mono break-all">
                {addressDetails.id}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Balance Actual</h3>
                  <p className="text-2xl font-bold text-primary-main">
                    {formatNumber(addressDetails.balance)} QU
                  </p>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Válido para tick</h3>
                  <p className="text-gray-800">
                    <Link to={`/explorer/tick/${addressDetails.validForTick}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                      {addressDetails.validForTick}
                    </Link>
                  </p>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Último tick entrante</h3>
                  <p className="text-gray-800">
                    {addressDetails.latestIncomingTransferTick > 0 ? (
                      <Link to={`/explorer/transaction/${addressDetails.latestIncomingTransferTick}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                        {addressDetails.latestIncomingTransferTick}
                      </Link>
                    ) : (
                      'Ninguno'
                    )}
                  </p>
                </div>
              </div>
              {/* Columna derecha */}
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Último tick saliente</h3>
                  <p className="text-gray-800">
                    {addressDetails.latestOutgoingTransferTick > 0 ? (
                      <Link to={`/explorer/transaction/${addressDetails.latestOutgoingTransferTick}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                        {addressDetails.latestOutgoingTransferTick}
                      </Link>
                    ) : (
                      'Ninguno'
                    )}
                  </p>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Cantidad entrante</h3>
                  <p className="text-gray-800">
                    {formatNumber(addressDetails.incomingAmount)} QU
                  </p>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Cantidad saliente</h3>
                  <p className="text-gray-800">
                    {formatNumber(addressDetails.outgoingAmount)} QU
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AddressDetail;