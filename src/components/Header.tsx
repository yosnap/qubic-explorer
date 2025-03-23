import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQubic } from '../context/QubicContext';

const Header: React.FC = () => {
  const { currentTick, identity, balance } = useQubic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    // Determinar si es una dirección de computador o un tick
    if (searchTerm.length >= 32) {
      // Es probable que sea una dirección
      navigate(`/explorer/address/${searchTerm}`);
    } else if (!isNaN(parseInt(searchTerm))) {
      // Es un número (tick)
      navigate(`/explorer/tick/${searchTerm}`);
    } else {
      // Mostrar mensaje de error o feedback
      alert("Por favor, ingresa un ID de computador válido o un número de tick");
    }
    
    // Cerrar el modal y limpiar el input
    setIsModalOpen(false);
    setSearchTerm('');
  };

  return (
    <header className="bg-primary-main text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="text-xl font-bold no-underline text-white">
            Qubic Sentinel
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <div className="bg-primary-dark bg-opacity-30 text-white px-3 py-1 rounded-full text-sm">
              Tick: {currentTick}
            </div>
            
            {identity && (
              <div className="bg-primary-dark bg-opacity-30 text-white px-3 py-1 rounded-full text-sm">
                Balance: {balance} QU
              </div>
            )}
          </div>

          <nav className="flex items-center gap-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary-dark bg-opacity-30 hover:bg-opacity-50 text-white px-3 py-1.5 rounded-full text-sm flex items-center transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              Buscar
            </button>
            <Link to="/wallet" className="text-white hover:text-gray-200 px-2 py-1">
              Wallet
            </Link>
            <Link to="/contract" className="text-white hover:text-gray-200 px-2 py-1">
              Contract
            </Link>
            {/* <Link to="/transactions" className="text-white hover:text-gray-200 px-2 py-1">
              Transactions
            </Link> */}
          </nav>
        </div>
      </div>

      {/* Modal de búsqueda */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Búsqueda en Explorer</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar por ID o número de tick
                </label>
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ID de computador o número de tick"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800"
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark"
                >
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
