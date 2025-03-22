// Configuración de la aplicación
export const config = {
  // URL del nodo Qubic para mainnet
  nodeUrl: 'https://rpc.qubic.org', // Ejemplo de endpoint de la mainnet

  // Índice del contrato HM25
  hm25ContractIndex: Number(process.env.REACT_APP_HM25_CONTRACT_INDEX || 12),

  // Configuración de la red
  networkRefreshInterval: 5000, // ms

  // Configuración de la UI
  defaultPageSize: 10,

  // Endpoints RPC según la documentación de Qubic
  api: {
    getCurrentTick: '/tick',
    getBalance: '/id',
    getTick: '/getTick',
    broadcast: '/broadcast-transaction',
    querySmartContract: '/querySmartContract'
  }
};