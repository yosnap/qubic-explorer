import React, { useState, useEffect } from "react";
import { useQubic } from "../context/QubicContext";
import { qubicService } from "../services/qubicService";

// Interfaz para transacciones
interface Transaction {
  id: string;
  sourceAddress: string;
  targetAddress: string;
  amount: string;
  tick: number;
  timestamp: Date;
  type: "transfer" | "contract" | "burn";
  status: "confirmed" | "pending";
}

const Transactions: React.FC = () => {
  // Quitamos identity para evitar la advertencia de ESLint
  // const { identity } = useQubic();

  // Estado local
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Cargar transacciones al montar o cuando cambia la página/tamaño
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);

      try {
        // Usar el método del servicio para obtener transacciones
        const transactionsData = await qubicService.getTransactions(page, rowsPerPage);
        
        console.log('Transacciones obtenidas en el componente:', transactionsData);
        
        if (Array.isArray(transactionsData) && transactionsData.length > 0) {
          // Asegurarnos de que los datos son del tipo correcto
          const formattedTransactions = transactionsData.map(tx => ({
            id: tx.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            sourceAddress: tx.sourceAddress || "Desconocido",
            targetAddress: tx.targetAddress || "Desconocido",
            amount: tx.amount?.toString() || "0",
            tick: tx.tick || 0,
            timestamp: tx.timestamp instanceof Date ? tx.timestamp : new Date(),
            type: (tx.type === "transfer" || tx.type === "contract" || tx.type === "burn") 
              ? tx.type as "transfer" | "contract" | "burn" 
              : "transfer",
            status: tx.status === "pending" ? "pending" : "confirmed" as "confirmed" | "pending"
          }));
          
          setTransactions(formattedTransactions);
          setFilteredTransactions(formattedTransactions);
          console.log('Transacciones formateadas:', formattedTransactions);
        } else {
          console.warn('No se recibieron transacciones válidas');
          setTransactions([]);
          setFilteredTransactions([]);
        }
      } catch (error) {
        console.error("Error al cargar transacciones:", error);
        setTransactions([]);
        setFilteredTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [page, rowsPerPage]);

  // Filtrar transacciones cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTransactions(transactions);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = transactions.filter(
      (tx) =>
        tx.sourceAddress.toLowerCase().includes(term) ||
        tx.targetAddress.toLowerCase().includes(term) ||
        tx.amount.includes(term) ||
        tx.tick.toString().includes(term)
    );

    setFilteredTransactions(filtered);
    setPage(0); // Resetear a la primera página
  }, [searchTerm, transactions]);

  // Manejadores
  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (perPage: number) => {
    setRowsPerPage(perPage);
    setPage(0);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const renderTransactionType = (type: string, status: string) => {
    let bgColor = "";
    let textColor = "";
    let icon = null;
    let label = "";

    if (type === "transfer") {
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      label = "Transferencia";
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      );
    } else if (type === "contract") {
      bgColor = "bg-purple-100";
      textColor = "text-purple-800";
      label = "Contrato";
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else if (type === "burn") {
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      label = "Quema";
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      );
    }

    const statusColor = status === "confirmed" ? "bg-green-400" : "bg-yellow-400";

    return (
      <div className={`flex items-center px-2 py-1 rounded-full ${bgColor} ${textColor}`}>
        {icon}
        <span className="text-xs">{label}</span>
        <span className={`ml-1 h-2 w-2 rounded-full ${statusColor}`}></span>
      </div>
    );
  };

  const truncateAddress = (address: string, length: number = 10) => {
    if (!address) return "";
    return `${address.substring(0, length)}...${address.substring(
      address.length - length
    )}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 mt-8 mb-8">
      <h1 className="text-2xl font-bold mb-6">Historial de Transacciones</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div className="relative">
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full md:w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Buscar por dirección, monto o tick..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
              value={rowsPerPage}
              onChange={(e) => handleChangeRowsPerPage(parseInt(e.target.value, 10))}
            >
              <option value={5}>5 por página</option>
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-primary-main"></div>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Origen
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destino
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tick
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderTransactionType(tx.type, tx.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {truncateAddress(tx.sourceAddress)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {truncateAddress(tx.targetAddress)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium">
                            {tx.amount} QU
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">
                            {tx.tick}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">
                            {formatDate(tx.timestamp)}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                Mostrando {Math.min(filteredTransactions.length, page * rowsPerPage + 1)} - {Math.min(filteredTransactions.length, (page + 1) * rowsPerPage)} de {filteredTransactions.length} transacciones
              </div>
              <div className="flex items-center gap-1">
                <button
                  className={`px-3 py-1 rounded ${page > 0 ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  onClick={() => page > 0 && handleChangePage(page - 1)}
                  disabled={page === 0}
                >
                  Anterior
                </button>
                {Array.from({ length: Math.ceil(filteredTransactions.length / rowsPerPage) }, (_, i) => (
                  <button
                    key={i}
                    className={`w-8 h-8 rounded-full ${page === i ? 'bg-primary-main text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    onClick={() => handleChangePage(i)}
                  >
                    {i + 1}
                  </button>
                )).slice(Math.max(0, page - 2), Math.min(Math.ceil(filteredTransactions.length / rowsPerPage), page + 3))}
                <button
                  className={`px-3 py-1 rounded ${page < Math.ceil(filteredTransactions.length / rowsPerPage) - 1 ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  onClick={() => page < Math.ceil(filteredTransactions.length / rowsPerPage) - 1 && handleChangePage(page + 1)}
                  disabled={page >= Math.ceil(filteredTransactions.length / rowsPerPage) - 1}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">No se encontraron transacciones</p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-2">
                Prueba con otro término de búsqueda
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
