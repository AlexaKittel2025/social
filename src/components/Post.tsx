import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Post as PostType, ReactionType, JudgementType } from '../types/index';
import { judgementLabels, Comment as CommentType } from '../types';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/postService';
import {
  ChatBubbleLeftIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  HandThumbUpIcon,
  FaceSmileIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface PostProps {
  post: PostType;
  onPostUpdate?: (updatedPost: PostType) => void;
}

const Post: React.FC<PostProps> = ({ post, onPostUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReaction = async (type: ReactionType) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const updatedPost = post.userReactions[user.id] === type
        ? await postService.removeReaction(post.id, type)
        : await postService.addReaction(post.id, type);
      
      onPostUpdate?.(updatedPost);
    } catch (error) {
      console.error('Erro ao reagir ao post:', error);
      setError('Não foi possível registrar sua reação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJudgement = async (type: JudgementType) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const updatedPost = post.userJudgements[user.id] === type
        ? await postService.removeJudgement(post.id, type)
        : await postService.addJudgement(post.id, type);
      
      onPostUpdate?.(updatedPost);
    } catch (error) {
      console.error('Erro ao julgar o post:', error);
      setError('Não foi possível registrar seu julgamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || user.id !== post.userId) return;

    try {
      setIsLoading(true);
      setError(null);
      await postService.deletePost(post.id);
      // Remover o post da lista (implementado pelo componente pai)
      onPostUpdate?.(null as any);
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      setError('Não foi possível deletar o post. Tente novamente.');
    } finally {
      setIsLoading(false);
      setShowMenu(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Post de ${post.user?.displayName}`,
        text: post.content,
        url: `${window.location.origin}/post/${post.id}`
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      {/* Cabeçalho do post */}
      <div className="flex items-center justify-between mb-4">
        <Link
          to={`/profile/${post.user?.username}`}
          className="flex items-center space-x-2"
        >
          <img
            src={post.user?.photoURL || '/default-avatar.png'}
            alt={post.user?.displayName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {post.user?.displayName}
            </h3>
            <p className="text-sm text-gray-500">@{post.user?.username}</p>
          </div>
        </Link>
        
        {/* Menu de opções */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <EllipsisHorizontalIcon className="h-6 w-6" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10">
              {/* Opções do menu */}
              {user?.id === post.userId && (
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Excluir post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo do post */}
      <div className="mb-4">
        <p className="text-gray-900 dark:text-white">{post.content}</p>
        {post.imageURL && (
          <img
            src={post.imageURL}
            alt="Post"
            className="mt-2 rounded-lg w-full object-cover max-h-96"
          />
        )}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Ações do post */}
      <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
        <button
          onClick={() => handleReaction('quaseAcreditei')}
          className="flex items-center space-x-1 hover:text-blue-500"
        >
          <HandThumbUpIcon className="h-5 w-5" />
          <span>{post.reactions?.quaseAcreditei || 0}</span>
        </button>

        <button
          onClick={() => handleReaction('hahaha')}
          className="flex items-center space-x-1 hover:text-yellow-500"
        >
          <FaceSmileIcon className="h-5 w-5" />
          <span>{post.reactions?.hahaha || 0}</span>
        </button>

        <button
          onClick={() => handleReaction('mentiraEpica')}
          className="flex items-center space-x-1 hover:text-red-500"
        >
          <FireIcon className="h-5 w-5" />
          <span>{post.reactions?.mentiraEpica || 0}</span>
        </button>

        <button
          onClick={() => handleJudgement('crivel')}
          className="flex items-center space-x-1 hover:text-blue-500"
        >
          <HandThumbUpIcon className="h-5 w-5" />
          <span>{post.judgements?.crivel || 0}</span>
        </button>

        <button
          onClick={() => handleJudgement('inventiva')}
          className="flex items-center space-x-1 hover:text-yellow-500"
        >
          <FaceSmileIcon className="h-5 w-5" />
          <span>{post.judgements?.inventiva || 0}</span>
        </button>

        <button
          onClick={() => handleJudgement('totalmentePirada')}
          className="flex items-center space-x-1 hover:text-red-500"
        >
          <FireIcon className="h-5 w-5" />
          <span>{post.judgements?.totalmentePirada || 0}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ShareIcon className="h-5 w-5" />
          <span>Compartilhar</span>
        </button>
      </div>
    </div>
  );
};

export default Post; 