const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        // Find all products and sort by newest first
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product (with Cloudinary Image Upload)
// @route   POST /api/products
// @access  Private (Admin & Seller only)
const createProduct = async (req, res) => {
    try {
        const { name, category, price, stock, condition_type } = req.body;

        // If Multer successfully uploaded the file to Cloudinary, it attaches the URL to req.file.path
        const image = req.file ? req.file.path : 'no-image.jpg';

        const product = new Product({
            name,
            category,
            price,
            stock,
            condition_type,
            image,
            sellerId: req.user._id // Automatically assigned from our Auth Middleware
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin & Seller only)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // SECURITY: Ensure the user deleting it is either an Admin OR the Seller who created it
        if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this product' });
        }

        await product.deleteOne();
        res.status(200).json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in seller's specific products
// @route   GET /api/products/seller/myproducts
// @access  Private (Admin & Seller only)
const getSellerProducts = async (req, res) => {
    try {
        // Fetch only products created by the specific user making the request
        const products = await Product.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product (with optional new image)
// @route   PUT /api/products/:id
// @access  Private (Admin & Seller only)
const updateProduct = async (req, res) => {
    try {
        const { name, category, price, stock, condition_type } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // SECURITY: Ensure the user updating it is either an Admin OR the Seller who created it
        if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this product' });
        }

        // Update fields if they exist in the request
        product.name = name || product.name;
        product.price = price || product.price;
        product.category = category || product.category;
        product.stock = stock || product.stock;
        product.condition_type = condition_type || product.condition_type;

        // If Multer uploaded a NEW file, replace the old image URL
        if (req.file) {
            product.image = req.file.path; 
        }

        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    deleteProduct,
    getSellerProducts,
    updateProduct
};