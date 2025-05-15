import React, { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { getCurrentUserProStatus } from '../services/userService';
import { Post, Battle } from '../types';
import battleService, { BattleWithPosts } from '../services/battleService';
import ProPaymentModal from './ProPaymentModal';
import { Link } from 'react-router-dom';

interface ProBattlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const ProBattlesModal: React.FC<ProBattlesModalProps> = ({ isOpen, onClose, userId }) => {
  const [activeBattleIndex, setActiveBattleIndex] = useState(0);
  const [battles, setBattles] = useState<BattleWithPosts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProPaymentModal, setShowProPaymentModal] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkProStatus();
      fetchBattles();
    }
  }, [isOpen]);

  const checkProStatus = async () => {
    try {
      const proStatus = await getCurrentUserProStatus(userId);
      setIsPro(proStatus);
    } catch (error) {
      console.error('Erro ao verificar status PRO:', error);
      setIsPro(false);
    }
  };

  const fetchBattles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await battleService.getProBattles();
      setBattles(data);
    } catch (error) {
      console.error('Erro ao carregar batalhas:', error);
      setError('Não foi possível carregar as batalhas. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (battleId: string, postId: string) => {
    if (!isPro) {
      setShowProPaymentModal(true);
      return;
    }

    try {
      const updatedBattle = await battleService.voteInBattle(battleId, postId);
      setBattles(battles.map(b => b.id === battleId ? updatedBattle : b));
    } catch (error) {
      console.error('Erro ao votar:', error);
      // Mostrar mensagem de erro ao usuário
    }
  };

  const getVoteCount = (battleId: string, postId: string): number => {
    const battle = battles.find(b => b.id === battleId);
    return battle?.votes[postId] || 0;
  };

  const getTotalVotes = (battleId: string): number => {
    const battle = battles.find(b => b.id === battleId);
    if (!battle) return 0;
    const voteValues = Object.values(battle.votes) as number[];
    return voteValues.reduce((sum, count) => sum + count, 0);
  };

  const getVotePercentage = (battleId: string, postId: string): number => {
    const total = getTotalVotes(battleId);
    if (total === 0) return 0;
    return (getVoteCount(battleId, postId) / total) * 100;
  };

  const handleNext = () => {
    setActiveBattleIndex(prev => (prev + 1) % battles.length);
  };

  const handlePrevious = () => {
    setActiveBattleIndex(prev => (prev - 1 + battles.length) % battles.length);
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl">
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchBattles}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentBattle = battles[activeBattleIndex];

  if (!currentBattle) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl">
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma batalha disponível no momento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                <SparklesIcon className="h-6 w-6 text-yellow-500" />
                Batalhas PRO
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Vote nas melhores histórias e ganhe recompensas exclusivas!
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Conteúdo da batalha */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 dark:text-white">{currentBattle.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{currentBattle.description}</p>
          </div>

          {/* Posts da batalha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentBattle.posts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                {/* Conteúdo do post */}
                <div className="flex items-start mb-4">
                  <img
                    src={post.user?.photoURL}
                    alt={post.user?.displayName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <Link
                      to={`/profile/${post.user?.username}`}
                      className="font-medium text-gray-900 dark:text-white hover:underline"
                    >
                      {post.user?.displayName}
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {post.content}
                    </p>
                  </div>
                </div>

                {/* Imagem do post */}
                {post.imageURL && (
                  <img
                    src={post.imageURL}
                    alt="Post"
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}

                {/* Barra de progresso e botão de voto */}
                <div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full mb-2">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${getVotePercentage(currentBattle.id, post.id)}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {getVoteCount(currentBattle.id, post.id)} votos
                    </span>
                    <button
                      onClick={() => handleVote(currentBattle.id, post.id)}
                      className={`px-4 py-2 rounded ${
                        isPro
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                      disabled={!isPro}
                    >
                      Votar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navegação entre batalhas */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrevious}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Anterior
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      {/* Modal de pagamento PRO */}
      <ProPaymentModal
        isOpen={showProPaymentModal}
        onClose={() => setShowProPaymentModal(false)}
        onSuccess={() => {
          setShowProPaymentModal(false);
          checkProStatus();
        }}
      />
    </>
  );
};

export default ProBattlesModal; 