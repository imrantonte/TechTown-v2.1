const express = require('express');
const router = express.Router();

// IMPORT ALL 5 FUNCTIONS HERE
const { 
    getCart, 
    addToCart, 
    removeFromCart, 
    clearCart, 
    updateQuantity 
} = require('../controllers/cartController');

const { protect } = require('../middlewares/authMiddleware');

// ROUTES
router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.delete('/clear', protect, clearCart);
router.delete('/:productId', protect, removeFromCart);
router.put('/:productId', protect, updateQuantity); 

module.exports = router;