import React from 'react';
import { Link } from 'react-router-dom';
import { useQubic } from '../context/QubicContext';

const Header: React.FC = () => {
  const { currentTick, identity, balance } = useQubic();

  return (
    <header className="bg-primary-main text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="text-xl font-bold no-underline text-white">
            Qubic Explorer
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

          <nav className="flex gap-3">
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
    </header>
  );
};

export default Header;
