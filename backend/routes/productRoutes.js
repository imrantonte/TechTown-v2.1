const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    deleteProduct,
    getSellerProducts,
    updateProduct
} = require('../controllers/productController');

const { protect, adminOrSeller } = require('../middlewares/authMiddleware'); 
const upload = require('../config/upload'); 

router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/seller/myproducts', protect, adminOrSeller, getSellerProducts); 

// Create product (with image upload)
router.post('/', protect, adminOrSeller, upload.single('image'), createProduct);

// Update product (with optional image upload)
router.put('/:id', protect, adminOrSeller, upload.single('image'), updateProduct); // <-- 2. Add the route!

// Delete product
router.delete('/:id', protect, adminOrSeller, deleteProduct);

module.exports = router;