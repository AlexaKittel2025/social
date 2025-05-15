import React, { useState } from 'react';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface ProPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ProPaymentModal: React.FC<ProPaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white flex items-center">
            <SparklesIcon className="w-6 h-6 text-yellow-400 mr-2" />
            Assine PRO
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center py-8">
          <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-10 h-10 text-yellow-500 dark:text-yellow-300" />
          </div>
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Desbloqueie recursos exclusivos</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Assine o plano PRO para acessar batalhas exclusivas, ganhar mais pontos e ter acesso a recursos premium!
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">Batalhas exclusivas</span>
              <SparklesIcon className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">2x mais pontos</span>
              <SparklesIcon className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">Conquistas especiais</span>
              <SparklesIcon className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          <button
            className={`w-full mt-8 py-3 px-6 rounded-lg font-medium ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-dark text-white'
            }`}
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processando...' : 'Assinar por R$ 9,90/mês'}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Cancele a qualquer momento. Sem compromisso.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProPaymentModal; 