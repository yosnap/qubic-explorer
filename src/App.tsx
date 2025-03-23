import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QubicProvider } from './context/QubicContext';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Contract from './pages/Contract';
import Transactions from './pages/Transactions';
import TickDetail from './pages/TickDetail';
import ComputorDetail from './pages/ComputorDetail';
import AddressDetail from './pages/AddressDetail';

function App() {
  return (
    <QubicProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow py-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/contract" element={<Contract />} />
              <Route path="/explorer">
                <Route path="tick/:tickId" element={<TickDetail />} />
                <Route path="computor/:computorId" element={<ComputorDetail />} />
                <Route path="address/:addressId" element={<AddressDetail />} />
              </Route>
            </Routes>
          </main>
        </div>
      </Router>
    </QubicProvider>
  );
}

export default App;
