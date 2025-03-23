import React, { useState, useEffect } from "react";
import { qubicService } from "../services/qubicService";
import { Link } from "react-router-dom";

// Definir interfaz para las transacciones
interface Transaction {
  id: string;
  sourceAddress: string;
  targetAddress: string;
  amount: string;
  tick: number;
  timestamp: Date | string;
  type: "transfer" | "contract" | "burn";
  status: "confirmed" | "pending";
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  // Cargar transacciones
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Obtener transacciones de la API
        const data = await qubicService.getTransactions(currentPage - 1, itemsPerPage);
        if (data) {
          console.log('Transacciones cargadas:', data);
          setTransactions(data);
        } else {
          throw new Error('No se recibieron datos de transacciones');
        }
      } catch (err) {
        console.error('Error al cargar transacciones:', err);
        setError('No se pudieron cargar las transacciones. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage, itemsPerPage]);

  // Filtrar transacciones cuando cambia la búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTransactions(transactions);
      setTotalPages(Math.max(1, Math.ceil(transactions.length / itemsPerPage)));
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = transactions.filter(tx => 
      tx.id.toLowerCase().includes(query) ||
      tx.sourceAddress.toLowerCase().includes(query) ||
      tx.targetAddress.toLowerCase().includes(query) ||
      tx.amount.toString().includes(query) ||
      tx.tick.toString().includes(query)
    );

    setFilteredTransactions(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / itemsPerPage)));
  }, [searchQuery, transactions, itemsPerPage]);

  // Formatear dirección (mostrar versión corta)
  const formatAddress = (address: string): string => {
    if (!address || address === "Desconocido") return "Desconocido";
    if (address.length > 16) {
      return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
    }
    return address;
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

  // Obtener clase CSS según tipo de transacción
  const getTypeClass = (type: string): string => {
    switch (type) {
      case 'transfer': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'burn': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  // Cambiar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Cambiar items por página
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    setItemsPerPage(value);
    setCurrentPage(1); // Resetear a la primera página
  };

  // Manejar cambios en la búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Resetear a la primera página
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Historial de Transacciones</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Barra de búsqueda y selección de items por página */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full sm:w-auto">
            <input 
              type="text" 
                placeholder="Buscar por dirección, monto o tick..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="w-full sm:w-auto flex justify-end">
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>
        </div>

        {/* Tabla de transacciones */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main"></div>
            <p className="mt-2 text-gray-500">Cargando transacciones...</p>
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
            ) : filteredTransactions.length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">TIPO</th>
                    <th className="py-3 px-4 text-left">ORIGEN</th>
                    <th className="py-3 px-4 text-left">DESTINO</th>
                    <th className="py-3 px-4 text-right">MONTO</th>
                    <th className="py-3 px-4 text-center">TICK</th>
                    <th className="py-3 px-4 text-right">FECHA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeClass(tx.type)}`}>
                          {tx.type === 'transfer' && (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                          )}
                          {tx.type === 'contract' && (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                          )}
                          {tx.type === 'burn' && (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                            </svg>
                          )}
                          {formatTransactionType(tx.type)}
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
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Paginación */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de {filteredTransactions.length} transacciones
              </div>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Anterior
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded ${currentPage === pageNum ? 'bg-primary-main text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">No se encontraron transacciones en los ticks consultados.</div>
            <p className="text-sm text-gray-400">
              El explorador consulta los ticks más recientes de la red Qubic. Si no hay transacciones, puede ser por las siguientes razones:
            </p>
            <ul className="text-sm text-gray-400 mt-2 list-disc list-inside">
              <li>No hay transacciones en los ticks más recientes</li>
              <li>Problema de conectividad con el API de transacciones</li>
              <li>La red está experimentando baja actividad en este momento</li>
            </ul>
            <button 
              onClick={() => setCurrentPage(1)} 
              className="mt-4 px-4 py-2 bg-primary-main text-white rounded hover:bg-primary-dark"
            >
              Actualizar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
