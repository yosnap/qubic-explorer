import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { qubicService } from '../services/qubicService';

interface ComputorStat {
  tickCount: number;
  lastSeen: number;
  firstSeen: number;
  recentTicks: Array<{ tick: number, timestamp: number }>;
}

const ComputorDetail: React.FC = () => {
  const { computorId } = useParams<{ computorId: string }>();
  const [stats, setStats] = useState<ComputorStat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComputorStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!computorId) {
          throw new Error('ID de computador no proporcionado');
        }
        
        // Simulamos obtener estadísticas del computador
        // En una implementación real, se haría una llamada a la API
        
        // Obtenemos el tick actual para simular datos
        const currentTick = await qubicService.getCurrentTick();
        
        // Simulamos datos del computador
        const mockRecentTicks = Array(10).fill(0).map((_, index) => {
          const tickNum = currentTick - (index * Math.floor(Math.random() * 10) + 1);
          return { 
            tick: tickNum, 
            timestamp: Date.now() - (index * 1000 * 60 * Math.floor(Math.random() * 10) + 1)
          };
        }).sort((a, b) => b.tick - a.tick);
        
        const computorStats: ComputorStat = {
          tickCount: Math.floor(Math.random() * 1000) + 100,
          lastSeen: mockRecentTicks[0].timestamp,
          firstSeen: Date.now() - (60 * 60 * 24 * 30 * 1000), // ~1 mes atrás
          recentTicks: mockRecentTicks
        };
        
        setStats(computorStats);
      } catch (err) {
        console.error('Error al cargar estadísticas del computador:', err);
        setError('No se pudieron cargar los detalles del computador. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchComputorStats();
  }, [computorId]);

  // Formatear dirección (versión corta)
  const formatAddress = (address: string): string => {
    if (!address) return "Desconocido";
    if (address.length > 20) {
      return `${address.substring(0, 10)}...${address.substring(address.length - 10)}`;
    }
    return address;
  };

  // Formatear fecha
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Calcular tiempo pasado desde una fecha
  const timeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) {
      return Math.floor(interval) + " años";
    }
    
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " meses";
    }
    
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " días";
    }
    
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " horas";
    }
    
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutos";
    }
    
    return Math.floor(seconds) + " segundos";
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
        <h1 className="text-xl font-bold mb-6">Detalles del Computador</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main"></div>
            <p className="mt-2 text-gray-500">Cargando detalles del computador...</p>
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
                <h3 className="text-lg font-medium mb-4">Información del Computador</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">ID:</span>
                    <p className="font-medium break-all">{computorId}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Formato corto:</span>
                    <p className="font-medium">{formatAddress(computorId || '')}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Ticks Registrados:</span>
                    <p className="font-medium">{stats?.tickCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Actividad</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">Última Actividad:</span>
                    <p className="font-medium">
                      {stats?.lastSeen ? (
                        <>
                          {formatDate(stats.lastSeen)}
                          <span className="text-xs text-gray-500 ml-2">
                            (hace {timeAgo(stats.lastSeen)})
                          </span>
                        </>
                      ) : 'Desconocido'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Primera Actividad:</span>
                    <p className="font-medium">
                      {stats?.firstSeen ? (
                        <>
                          {formatDate(stats.firstSeen)}
                          <span className="text-xs text-gray-500 ml-2">
                            (hace {timeAgo(stats.firstSeen)})
                          </span>
                        </>
                      ) : 'Desconocido'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ticks recientes procesados por este computador */}
      {!loading && !error && stats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Ticks Recientes</h2>
          
          {stats.recentTicks.length > 0 ? (
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
                  {stats.recentTicks.map((tick) => (
                    <tr key={tick.tick} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">#{tick.tick}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(tick.timestamp)}
                        <span className="text-xs text-gray-500 ml-2">
                          (hace {timeAgo(tick.timestamp)})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link 
                          to={`/explorer/tick/${tick.tick}`}
                          className="text-primary-main hover:text-primary-dark inline-flex items-center"
                        >
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span>Ver detalles</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron ticks procesados por este computador.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComputorDetail; 