import React, { useState, useEffect } from 'react';
import { Post as PostType } from '../types';
import Post from '../components/Post';
import CreatePostModal from '../components/CreatePostModal';
import { postService } from '../services/postService';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await postService.getPosts();
      setPosts(response.posts);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      setError('Não foi possível carregar os posts. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostUpdate = (updatedPost: PostType | null) => {
    if (!updatedPost) {
      // Post foi deletado
      setPosts(posts.filter(p => p.id !== updatedPost?.id));
    } else {
      // Post foi atualizado
      setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
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
          onClick={fetchPosts}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
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

      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhuma história encontrada. Seja o primeiro a criar uma!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Post key={post.id} post={post} onPostUpdate={handlePostUpdate} />
          ))}
        </div>
      )}

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={(newPost) => {
          setPosts([newPost, ...posts]);
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
};

export default HomePage; 