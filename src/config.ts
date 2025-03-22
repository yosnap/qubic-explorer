// Configuración de la aplicación
export const config = {
  // URL del nodo Qubic
  nodeUrl: process.env.REACT_APP_QUBIC_NODE_URL || 'http://66.248.205.32',

  // Índice del contrato HM25
  hm25ContractIndex: Number(process.env.REACT_APP_HM25_CONTRACT_INDEX || 12),

  // Configuración de la red
  networkRefreshInterval: 5000, // ms

  // Configuración de la UI
  defaultPageSize: 10,

  // Endpoints de la API (ajustados según la documentación real de Qubic)
  api: {
    getCurrentTick: '/v1/tick',
    getBalance: '/v1/id',
    getTick: '/v1/getTick',
    broadcast: '/v1/broadcast-transaction',
    querySmartContract: '/v1/querySmartContract'
  }
};