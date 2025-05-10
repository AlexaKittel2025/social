const express = require('express');
const storymentController = require('../controllers/storymentController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Rotas protegidas (requerem autenticação)
router.get('/active', authenticate, storymentController.getActiveStoryments);
router.get('/:id', authenticate, storymentController.getStorymentById);
router.get('/user/:userId', authenticate, storymentController.getStorymentsByUserId);
router.post('/', authenticate, storymentController.createStoryment);
router.delete('/:id', authenticate, storymentController.deleteStoryment);
router.post('/:id/view', authenticate, storymentController.markAsViewed);
router.get('/:id/viewed/:userId', authenticate, storymentController.hasUserViewed);

module.exports = router; 