const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true // Ensures every product belongs to an Admin or Seller
    },
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Smartphones', 'Laptops', 'Gadgets', 'Accessories', 'Cameras', 'Smart Watches']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        min: 0
    },
    condition_type: {
        type: String,
        default: 'New'
    },
    image: {
        type: String,
        default: 'no-image.jpg' // Will be replaced by Cloudinary URL
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);