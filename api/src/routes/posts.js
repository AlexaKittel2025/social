const express = require('express');
const postController = require('../controllers/postController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);

// Rotas existentes
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.get('/user/:userId', postController.getPostsByUserId);
router.get('/tag/:tagName', postController.getPostsByTag);
router.post('/', postController.createPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

// Novas rotas para reações
router.post('/:postId/reactions', postController.reactToPost);
router.delete('/:postId/reactions', postController.removeReaction);
router.get('/:postId/reactions', postController.getPostReactions);

// Rotas para categorias
router.post('/:postId/categories/:categoryId', postController.addPostToCategory);
router.delete('/:postId/categories/:categoryId', postController.removePostFromCategory);
router.get('/:postId/categories', postController.getPostCategories);

// Rotas para posts salvos
router.post('/:postId/save', postController.savePost);
router.delete('/:postId/save', postController.unsavePost);
router.get('/saved', postController.getSavedPosts);
router.get('/:postId/saved-status', postController.checkSavedStatus);

module.exports = router; 