import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Post from '../Post';
import { Post as PostInterface } from '../../types/index';
import { useAuth } from '../../context/AuthContext';
import CreatePostModal from '../../components/CreatePostModal';
import { postApi } from '../../services/api';

interface PostsTabProps {
  userId: string;
  isOwnProfile?: boolean;
}

const PostsTab: React.FC<PostsTabProps> = ({ userId, isOwnProfile = false }) => {
  const [posts, setPosts] = useState<PostInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await postApi.getByUser(userId);
        setPosts(data);
      } catch (error) {
        console.error('Erro ao carregar posts:', error);
        setError('Não foi possível carregar os posts. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  const handleCreatePost = async (newPost: Omit<PostInterface, 'id' | 'createdAt' | 'reactions' | 'judgements' | 'comments'>) => {
    try {
      setError(null);
      const createdPost = await postApi.create({
        ...newPost,
        userId: user?.id || '',
      });
      setPosts([createdPost, ...posts]);
    } catch (error) {
      console.error('Erro ao criar post:', error);
      setError('Não foi possível criar o post. Tente novamente mais tarde.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isOwnProfile && (
        <div className="mb-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Criar Nova História
          </button>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {isOwnProfile ? 'Você ainda não criou nenhuma história.' : 'Este usuário ainda não criou nenhuma história.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      )}

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePost={handleCreatePost}
      />
    </div>
  );
};

export default PostsTab; 