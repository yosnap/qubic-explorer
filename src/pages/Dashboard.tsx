import React from 'react';
import { useQubic } from '../context/QubicContext';

const Dashboard: React.FC = () => {
  const { currentTick, networkStats, tickHistory } = useQubic();
  
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

  return (
    <div className="container mx-auto px-4 mt-8 mb-8">
      <h1 className="text-2xl font-bold mb-6">Qubic Network Dashboard</h1>

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
        </div>

        {/* Historial de ticks */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Historial de Ticks</h2>
            
            {tickHistory.length > 0 ? (
              <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                {tickHistory.map((item, index) => (
                  <li key={item.tick} className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">Tick #{item.tick}</span>
                        <p className="text-sm text-gray-500">{new Date(item.timestamp).toLocaleTimeString()}</p>
                      </div>
                      {index > 0 && tickHistory[index+1] && (
                        <span className="text-sm text-gray-600">
                          + {formatTime(item.timestamp - tickHistory[index+1]?.timestamp)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main"></div>
                <p className="mt-2 text-gray-500">Cargando historial de ticks...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
