import React, { useMemo, useState, useEffect } from 'react';
import { useQubic } from '../context/QubicContext';
import { Link } from 'react-router-dom';
import { qubicService } from '../services/qubicService';

const Dashboard: React.FC = () => {
  const { currentTick, networkStats, tickHistory, lastRefresh } = useQubic();
  const [allTicks, setAllTicks] = useState<Array<{ tick: number, timestamp: number, computerId?: string }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingTicks, setIsLoadingTicks] = useState(false);
  const [totalTicks, setTotalTicks] = useState(0);
  const ticksPerPage = 20;

  // Formatear milisegundos a formato legible
  const formatTime = (ms: number): string => {
    if (!ms || isNaN(ms)) return 'Calculando...';
    if (ms < 1000) return `${ms.toFixed(0)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  // Formatear números grandes
  const formatNumber = (num: number | string): string => {
    const value = typeof num === 'string' ? parseInt(num) : num;
    return value.toLocaleString();
  };

  // Formatear fecha
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Tiempo desde la última actualización
  const timeSinceLastRefresh = useMemo(() => {
    const elapsed = Date.now() - lastRefresh;
    return Math.floor(elapsed / 1000);
  }, [lastRefresh]);

  // Formatear dirección de computador (mostrar versión corta)
  const formatComputerId = (id: string): string => {
    if (!id || id === "desconocido") return "desconocido";
    if (id.length > 16) {
      return `${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
    }
    return id;
  };

  // Función para cargar ticks secuenciales
  const loadSequentialTicks = async (page: number) => {
    if (!currentTick) return;
    
    setIsLoadingTicks(true);
    try {
      // Calcular rango de ticks a cargar para la página actual
      const endTick = currentTick - (page - 1) * ticksPerPage;
      const startTick = Math.max(1, endTick - ticksPerPage + 1);
      
      console.log(`Cargando ticks desde ${startTick} hasta ${endTick}`);
      
      // Obtener información de los ticks
      const ticksInfo = await qubicService.getTickDetails(startTick, endTick);
      
      // Crear array con todos los ticks en el rango
      const ticksArray = [];
      for (let tick = endTick; tick >= startTick; tick--) {
        const tickInfo = ticksInfo[tick] || {
          computerId: "desconocido",
          timestamp: Date.now() - (currentTick - tick) * 1000 // Estimación de timestamp
        };
        
        ticksArray.push({
          tick,
          timestamp: tickInfo.timestamp,
          computerId: tickInfo.computerId
        });
      }
      
      setAllTicks(ticksArray);
      setTotalTicks(currentTick); // El total es el tick actual
    } catch (error) {
      console.error('Error al cargar ticks secuenciales:', error);
    } finally {
      setIsLoadingTicks(false);
    }
  };

  // Cargar ticks cuando cambie la página o el tick actual
  useEffect(() => {
    loadSequentialTicks(currentPage);
  }, [currentPage, currentTick]);

  // Calcular número total de páginas
  const totalPages = useMemo(() => {
    return Math.ceil(totalTicks / ticksPerPage);
  }, [totalTicks, ticksPerPage]);

  // Cambiar a la página anterior
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Cambiar a la página siguiente
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Actualizar ticks cuando se solicite manualmente
  const refreshTicks = () => {
    loadSequentialTicks(currentPage);
  };

  return (
    <div className="container mx-auto px-4 mt-8 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Qubic Network Dashboard</h1>
        <div className="text-sm text-gray-500">
          Última actualización: hace {timeSinceLastRefresh}s 
          <span className="ml-2 inline-block w-2 h-2 rounded-full bg-green-500"></span>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-primary-main mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
            </svg>
            <h3 className="text-gray-600 font-medium">Tick Actual</h3>
          </div>
          <p className="text-2xl font-bold">{currentTick || 'Cargando...'}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-primary-main mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5.5 2a3.5 3.5 0 015 0l.5.5.5-.5a3.5 3.5 0 015 0v0a3.5 3.5 0 010 5l-5 5-5-5a3.5 3.5 0 010-5z" clipRule="evenodd"></path>
            </svg>
            <h3 className="text-gray-600 font-medium">Velocidad Promedio</h3>
          </div>
          <p className="text-2xl font-bold">
            {networkStats ? formatTime(networkStats.averageTickTime || 0) : 'Calculando...'}
          </p>
          <p className="text-xs text-gray-500">Tiempo promedio entre ticks</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-primary-main mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd"></path>
            </svg>
            <h3 className="text-gray-600 font-medium">Época Actual</h3>
          </div>
          <p className="text-2xl font-bold">{networkStats ? networkStats.epochNumber : 'Cargando...'}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-primary-main mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
            </svg>
            <h3 className="text-gray-600 font-medium">Direcciones Activas</h3>
          </div>
          <p className="text-2xl font-bold">{networkStats ? formatNumber(networkStats.activeAddresses) : 'Cargando...'}</p>
        </div>
      </div>

      {/* Detalles de estadísticas y historial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estadísticas detalladas */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Detalles de Red</h2>
            
            {networkStats ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Calidad de Tick</p>
                  <p className="text-lg font-medium">{networkStats.epochTickQuality.toFixed(2)}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Ticks en Época</p>
                  <p className="text-lg font-medium">{formatNumber(networkStats.ticksInCurrentEpoch)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Ticks Vacíos</p>
                  <p className="text-lg font-medium">{formatNumber(networkStats.emptyTicksInCurrentEpoch)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Suministro Circulante</p>
                  <p className="text-lg font-medium">{formatNumber(networkStats.circulatingSupply)} QU</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Timestamp</p>
                  <p className="text-lg font-medium">{formatDate(networkStats.timestamp)}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main"></div>
                <p className="mt-2 text-gray-500">Cargando estadísticas...</p>
              </div>
            )}
          </div>
          
          {/* Estadísticas simplificadas de ticks */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Monitoreo de Ticks</h2>
            
            {networkStats ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Tick Actual</p>
                  <p className="text-lg font-medium">{currentTick}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Total Histórico</p>
                  <p className="text-lg font-medium">{formatNumber(totalTicks)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Tiempo Promedio</p>
                  <p className="text-lg font-medium">{formatTime(networkStats.averageTickTime || 0)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Última Actualización</p>
                  <p className="text-lg font-medium">{formatDate(lastRefresh)}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">Esperando datos...</p>
              </div>
            )}
          </div>
        </div>

        {/* Historial de ticks con paginación */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Historial de Ticks</h2>
              <button 
                onClick={refreshTicks}
                className="text-primary-main hover:text-primary-dark"
                title="Actualizar"
              >
                <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            {isLoadingTicks ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main"></div>
                <p className="mt-2 text-gray-500">Cargando ticks...</p>
              </div>
            ) : allTicks.length > 0 ? (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4 text-left">Tick</th>
                        <th className="py-2 px-4 text-left">Timestamp</th>
                        <th className="py-2 px-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allTicks.map((item, index) => (
                        <tr key={item.tick} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">#{item.tick}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(item.timestamp)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Link 
                              to={`/explorer/tick/${item.tick}`}
                              className="text-primary-main hover:text-primary-dark inline-flex items-center"
                            >
                              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <span>Ver transacciones</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Paginación */}
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Mostrando ticks {(currentPage - 1) * ticksPerPage + 1} - {Math.min(currentPage * ticksPerPage, totalTicks)} de {formatNumber(totalTicks)}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary-main text-white hover:bg-primary-dark'}`}
                    >
                      Anterior
                    </button>
                    <span className="px-3 py-1 bg-gray-100 rounded">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary-main text-white hover:bg-primary-dark'}`}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No se encontraron ticks.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
