// Configuración de la aplicación
export const config = {
  // URL del nodo Qubic para mainnet (sin v1 al final)
  nodeUrl: 'https://rpc.qubic.org', // Endpoint de la mainnet sin /v1

  // Índice del contrato HM25
  hm25ContractIndex: Number(process.env.REACT_APP_HM25_CONTRACT_INDEX || 12),

  // Configuración de la red
  networkRefreshInterval: 1000, // ms - actualización cada segundo

  // Configuración de la UI
  defaultPageSize: 10,

  // Endpoints RPC según la documentación oficial
  // Las URLs completas se pueden consultar en:
  // - https://qubic.github.io/integration/Partners/qubic-rpc-doc.html?urls.primaryName=Qubic%20RPC%20Live%20Tree
  // - https://qubic.github.io/integration/Partners/qubic-rpc-doc.html?urls.primaryName=Qubic%20Stats%20API
  // - https://qubic.github.io/integration/Partners/qubic-rpc-doc.html?urls.primaryName=Qubic%20Transfers%20API
  api: {
    getCurrentTick: '/v1/status',
    getBalance: '/v1/id',
    getStatus: '/v1/status',
    getTick: '/v1/tick',
    tickInfo: '/v1/tick-info',
    transactions: '/v1/tick-transactions',
    broadcast: '/v1/broadcast-transaction',
    latestStats: '/v1/latest-stats'
  }
};