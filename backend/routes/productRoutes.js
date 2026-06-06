const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    deleteProduct,
    getSellerProducts 
} = require('../controllers/productController');

const { protect, adminOrSeller } = require('../middlewares/authMiddleware'); 

// 1. IMPORT YOUR CLOUDINARY MULTER CONFIG
const upload = require('../config/upload'); 

// --- PUBLIC ROUTES (Anyone can view products) ---
router.get('/', getProducts);
router.get('/:id', getProductById);

// --- MULTI-VENDOR ROUTES (Admins AND Sellers) ---
router.get('/seller/myproducts', protect, adminOrSeller, getSellerProducts); 

// 2. INJECT 'upload.single' SO EXPRESS READS THE ACTUAL FILE BEFORE CREATING THE PRODUCT
router.post('/', protect, adminOrSeller, upload.single('image'), createProduct);

router.delete('/:id', protect, adminOrSeller, deleteProduct);

module.exports = router;