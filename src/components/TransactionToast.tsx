import React, { useEffect, useState } from 'react';

interface TransactionToastProps {
  title: string;
  message: string;
  type: 'incoming' | 'outgoing';
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const TransactionToast: React.FC<TransactionToastProps> = ({
  title,
  message,
  type,
  onClose,
  autoClose = true,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Dar tiempo para la animación de salida
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <div 
      className={`w-full max-w-sm transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div 
        className={`p-4 rounded-lg shadow-lg border-l-4 ${
          type === 'incoming' 
            ? 'bg-green-50 border-green-500' 
            : 'bg-blue-50 border-blue-500'
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {type === 'incoming' ? (
              <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            )}
            <h3 className={`text-lg font-bold ${type === 'incoming' ? 'text-green-800' : 'text-blue-800'}`}>
              {title}
            </h3>
          </div>
          <button 
            className="text-gray-500 hover:text-gray-800" 
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className={`mt-2 ${type === 'incoming' ? 'text-green-700' : 'text-blue-700'}`}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default TransactionToast; 