const express = require('express');
const postController = require('../controllers/postController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Rotas protegidas (requerem autenticação)
router.get('/', authenticate, postController.getAllPosts);
router.get('/:id', authenticate, postController.getPostById);
router.get('/user/:userId', authenticate, postController.getPostsByUserId);
router.get('/tag/:tagName', authenticate, postController.getPostsByTag);
router.post('/', authenticate, postController.createPost);
router.put('/:id', authenticate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);
router.post('/:id/reactions', authenticate, postController.addReaction);
router.post('/:id/judgements', authenticate, postController.addJudgement);

module.exports = router; 