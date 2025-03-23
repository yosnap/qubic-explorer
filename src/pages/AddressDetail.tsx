import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { qubicService } from "../services/qubicService";

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

const AddressDetail: React.FC = () => {
  // Obtener el ID de la dirección de los parámetros de la URL
  const { addressId } = useParams<{ addressId: string }>();
  
  // Estados
  const [addressDetails, setAddressDetails] = useState<AddressDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cargar datos
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
      } catch (err) {
        console.error("Error al cargar detalles de dirección:", err);
        setError("No se pudieron cargar los detalles de la dirección. Por favor, inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAddressDetails();
  }, [addressId]);
  
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
  
  // Renderizado de la página
  return (
    <div className="container mx-auto px-4 py-8">
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
      ) : error ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-500">{error}</p>
        </div>
      ) : addressDetails ? (
        <div className="grid grid-cols-1 gap-6">
          {/* Tarjeta de información principal */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Información General</h2>
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
                      <Link to={`/explorer/tick/${addressDetails.latestIncomingTransferTick}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                        {addressDetails.latestIncomingTransferTick}
                      </Link>
                    ) : (
                      <span>No hay transferencias entrantes</span>
                    )}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Último tick saliente</h3>
                  <p className="text-gray-800">
                    {addressDetails.latestOutgoingTransferTick > 0 ? (
                      <Link to={`/explorer/tick/${addressDetails.latestOutgoingTransferTick}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                        {addressDetails.latestOutgoingTransferTick}
                      </Link>
                    ) : (
                      <span>No hay transferencias salientes</span>
                    )}
                  </p>
                </div>
              </div>
              
              {/* Columna derecha - Estadísticas */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-bold text-gray-700 mb-4">Estadísticas de Transferencias</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Transferencias Entrantes</h4>
                    <p className="text-lg font-bold text-green-600">{addressDetails.numberOfIncomingTransfers}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Transferencias Salientes</h4>
                    <p className="text-lg font-bold text-red-600">{addressDetails.numberOfOutgoingTransfers}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Monto Total Entrante</h4>
                    <p className="text-lg font-bold text-green-600">{formatNumber(addressDetails.incomingAmount)} QU</p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Monto Total Saliente</h4>
                    <p className="text-lg font-bold text-red-600">{formatNumber(addressDetails.outgoingAmount)} QU</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tarjeta de transacciones recientes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Transacciones Recientes</h2>
            
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left">TIPO</th>
                      <th className="py-3 px-4 text-left">ORIGEN / DESTINO</th>
                      <th className="py-3 px-4 text-right">MONTO</th>
                      <th className="py-3 px-4 text-center">TICK</th>
                      <th className="py-3 px-4 text-right">FECHA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map(tx => {
                      // Determine si la transacción es entrante o saliente con respecto a esta dirección
                      const isIncoming = tx.targetAddress === addressDetails.id;
                      const peerAddress = isIncoming ? tx.sourceAddress : tx.targetAddress;
                      
                      return (
                        <tr key={tx.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isIncoming ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {isIncoming ? (
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              )}
                              {isIncoming ? 'Entrante' : 'Saliente'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">{isIncoming ? 'De:' : 'Para:'}</span>
                              <Link 
                                to={`/explorer/address/${peerAddress}`} 
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {formatAddress(peerAddress)}
                              </Link>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            <span className={isIncoming ? 'text-green-600' : 'text-red-600'}>
                              {isIncoming ? '+' : '-'}{tx.amount} QU
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Link 
                              to={`/explorer/tick/${tx.tick}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {tx.tick}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-right text-sm text-gray-600">
                            {formatDate(tx.timestamp)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No se encontraron transacciones recientes para esta dirección.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No se encontró información para esta dirección.</p>
        </div>
      )}
    </div>
  );
};

export default AddressDetail; 