import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { qubicService } from '../services/qubicService';

interface Transaction {
  id: string;
  sourceAddress: string;
  targetAddress: string;
  amount: string;
  tick: number;
  timestamp: Date;
  type: 'transfer' | 'contract' | 'burn';
  status: 'confirmed' | 'pending';
  inputType?: number;
  inputSize?: number;
  inputHex?: string;
  signatureHex?: string;
}

interface TickInfo {
  computerId: string;
  timestamp: number;
}

const TickDetail: React.FC = () => {
  const { tickId } = useParams<{ tickId: string }>();
  const [tickInfo, setTickInfo] = useState<TickInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!tickId) {
          throw new Error('ID de tick no proporcionado');
        }
        
        const tickNumber = parseInt(tickId);
        
        // Obtener detalles del tick
        const tickDetails = await qubicService.getTickDetails(tickNumber, tickNumber);
        setTickInfo(tickDetails[tickNumber] || null);
        
        // Obtener transacciones de este tick
        const tickTransactions = await qubicService.getTickTransactions(tickNumber);
        setTransactions(tickTransactions);
        
      } catch (err) {
        console.error('Error al cargar detalles del tick:', err);
        setError('No se pudieron cargar los detalles del tick. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickDetails();
  }, [tickId]);

  // Formatear dirección (versión corta)
  const formatAddress = (address: string): string => {
    if (!address || address === "Desconocido") return "Desconocido";
    if (address.length > 16) {
      return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
    }
    return address;
  };

  // Después de formatAddress, añado una función para formatear los ID de transacción
  const formatTransactionId = (id: string): string => {
    if (!id || id === "Desconocido") return "Desconocido";
    if (id.length > 16) {
      return `${id.substring(0, 6)}...${id.substring(id.length - 6)}`;
    }
    return id;
  };

  // Formatear fecha
  const formatDate = (date: Date | number): string => {
    if (date instanceof Date) {
      return date.toLocaleString();
    }
    return new Date(date).toLocaleString();
  };

  // Formatear tipo de transacción
  const formatTransactionType = (type: string): string => {
    switch (type) {
      case 'transfer': return 'Transferencia';
      case 'contract': return 'Contrato';
      case 'burn': return 'Quema';
      default: return type;
    }
  };

  // Formatear estado de transacción
  const formatStatus = (status: string): string => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  // Obtener clase CSS según tipo de transacción
  const getTypeClass = (type: string): string => {
    switch (type) {
      case 'transfer': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'burn': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener clase CSS según estado de transacción
  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-primary-main hover:text-primary-dark">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">Detalles del Tick #{tickId}</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main"></div>
            <p className="mt-2 text-gray-500">Cargando detalles del tick...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Información del Tick</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Número de Tick:</span>
                    <p className="font-medium">{tickId}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Timestamp:</span>
                    <p className="font-medium">{tickInfo?.timestamp ? formatDate(tickInfo.timestamp) : 'No disponible'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Computador:</span>
                    {tickInfo?.computerId ? (
                      <Link 
                        to={`/explorer/computor/${tickInfo.computerId}`} 
                        className="text-blue-600 hover:text-blue-800 hover:underline block font-medium"
                      >
                        {formatAddress(tickInfo.computerId)}
                      </Link>
                    ) : (
                      <p className="font-medium">Desconocido</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Resumen de Transacciones</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Total de Transacciones:</span>
                    <p className="font-medium">{transactions.length}</p>
                  </div>
                  {/* Estadísticas de transacciones */}
                  <div>
                    <span className="text-sm text-gray-500">Transferencias:</span>
                    <p className="font-medium">{transactions.filter(tx => tx.type === 'transfer').length}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Llamadas a Contratos:</span>
                    <p className="font-medium">{transactions.filter(tx => tx.type === 'contract').length}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Quemas:</span>
                    <p className="font-medium">{transactions.filter(tx => tx.type === 'burn').length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de transacciones */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Transacciones</h2>
          
          {transactions.length > 0 ? (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 text-left">ID TX</th>
                      <th className="py-2 px-4 text-left">De</th>
                      <th className="py-2 px-4 text-left">A</th>
                      <th className="py-2 px-4 text-right">Cantidad</th>
                      <th className="py-2 px-4 text-center">Tipo</th>
                      <th className="py-2 px-4 text-center">Input</th>
                      <th className="py-2 px-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-xs">
                          <span title={tx.id} className="cursor-help">
                            {formatTransactionId(tx.id)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <Link 
                            to={`/explorer/address/${tx.sourceAddress}`} 
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {formatAddress(tx.sourceAddress)}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <Link 
                            to={`/explorer/address/${tx.targetAddress}`} 
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {formatAddress(tx.targetAddress)}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{tx.amount} QU</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-1 text-xs rounded ${getTypeClass(tx.type)}`}>
                            {formatTransactionType(tx.type)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {tx.inputType !== undefined && (
                            <div className="text-xs">
                              <span className="font-medium">Tipo: </span>{tx.inputType}
                              {tx.inputSize !== undefined && tx.inputSize > 0 && (
                                <span>, <span className="font-medium">Tamaño: </span>{tx.inputSize}</span>
                              )}
                              {tx.inputHex && tx.inputHex.length > 0 && (
                                <div className="mt-1">
                                  <details className="text-left">
                                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Ver Datos</summary>
                                    <div className="p-2 mt-1 bg-gray-100 rounded overflow-auto max-h-20 text-xs font-mono">
                                      {tx.inputHex.length > 50 
                                        ? `${tx.inputHex.substring(0, 50)}...` 
                                        : tx.inputHex}
                                    </div>
                                  </details>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-1 text-xs rounded ${getStatusClass(tx.status)}`}>
                            {formatStatus(tx.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Detalles de Firmas */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Firmas de Transacciones</h3>
                <div className="grid grid-cols-1 gap-4">
                  {transactions.map(tx => (
                    <div key={`sig-${tx.id}`} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-sm">
                          TX ID: <span title={tx.id} className="cursor-help">{formatTransactionId(tx.id)}</span>
                        </span>
                        <span className="text-sm">{formatAddress(tx.sourceAddress)} → {formatAddress(tx.targetAddress)}</span>
                      </div>
                      {tx.signatureHex && (
                        <div className="mt-1">
                          <h4 className="text-xs font-medium mb-1">Firma:</h4>
                          <p className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto">
                            {tx.signatureHex}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2 text-gray-500">No hay transacciones registradas para este tick.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TickDetail; 