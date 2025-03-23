// Configuración global de la aplicación
export const config = {
  // URL base del nodo Qubic
  nodeUrl: 'https://rpc.qubic.org',
  
  // URL base para transacciones
  transactionsUrl: 'https://dev02.qubic.org/gotr',
  
  // Intervalo para refrescar los datos de la red (en milisegundos)
  networkRefreshInterval: 1000,
  
  // Tamaño máximo del historial de ticks a almacenar
  maxTickHistorySize: 30,
  
  // Índice del contrato HM25
  hm25ContractIndex: Number(process.env.REACT_APP_HM25_CONTRACT_INDEX || 12),
  
  // Endpoints de la API
  api: {
    // Estado y estadísticas
    getStatus: '/v1/status',
    latestStats: '/v1/latest-stats',
    
    // Entidades y balance
    getBalance: '/v1/entities/balance',
    
    // Información de ticks
    tickInfo: '/v2/ticks',
    
    // Transacciones
    transactions: '/v1/transactions',
    broadcast: '/v1/broadcast',
    quTransfers: '/api/v1/entities/{identity}/events/qu-transfers',
    assetTransfers: '/api/v1/entities/{identity}/events/asset-transfers',
    tickAssetIssuances: '/api/v1/ticks/{tick}/events/asset-issuances',
    tickTransfers: '/api/v1/ticks/{tick}/events/qu-transfers',
    tickAssetTransfers: '/api/v1/ticks/{tick}/events/asset-transfers',
    tickAssets: '/api/v1/ticks/{tick}/events/assets',
    
    // Computadores
    computors: '/v1/computors',
    
    // Estado de salud
    health: '/status/health'
  }
};