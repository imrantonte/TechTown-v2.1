const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

// Load env variables
dotenv.config();

const legacyProducts = [
    { name: 'iPhone 13 Pro Max', category: 'Smartphones', price: 67000, stock: 19, condition_type: 'Used - Like New', description: 'Battery Health 98%. Comes with box and cable.', image: '/assets/images/Apple-iPhone-13-Pro-Max.jpg' },
    { name: 'Samsung S23 Ultra', category: 'Smartphones', price: 85500, stock: 4, condition_type: 'Used - Good', description: 'Korean variant. Minor scratches on bezel.', image: '/assets/images/Samsung-Galaxy-S23-Ultra.jpg' },
    { name: 'Google Pixel 7 Pro', category: 'Smartphones', price: 55000, stock: 0, condition_type: 'Used - Fair', description: 'Device only. No issues with camera.', image: '/assets/images/Google-Pixel-7-Pro.jpg' },
    { name: 'OnePlus 11 5G', category: 'Smartphones', price: 52000, stock: 3, condition_type: 'Used - Like New', description: 'Full box available. 12/256GB variant.', image: '/assets/images/OnePlus-11-5G.jpg' },
    { name: 'Xiaomi 13 Ultra', category: 'Smartphones', price: 80000, stock: 3, condition_type: 'Used - Good', description: 'Camera beast. Minor usage signs.', image: '/assets/images/Xiaomi-13-Ultra.jpg' },
    { name: 'MacBook Air M2', category: 'Laptops', price: 91000, stock: 10, condition_type: 'New', description: 'Brand new sealed pack. 1 Year Apple Warranty.', image: '/assets/images/MacBook-Air-M2.jpg' },
    { name: 'Dell XPS 13', category: 'Laptops', price: 215000, stock: 1, condition_type: 'New', description: 'Latest gen, OLED screen.', image: '/assets/images/Dell-XPS-13.jpg' },
    { name: 'HP Spectre x360', category: 'Laptops', price: 140000, stock: 3, condition_type: 'New', description: 'Convertible laptop with pen included.', image: '/assets/images/HP-Spectre-x360.jpg' },
    { name: 'Lenovo ThinkPad X1', category: 'Laptops', price: 165000, stock: 5, condition_type: 'New', description: 'Business class durability.', image: '/assets/images/Lenovo-ThinkPad-X1.jpg' },
    { name: 'Asus ZenBook Pro Duo 15', category: 'Laptops', price: 318000, stock: 2, condition_type: 'New', description: 'Dual screen laptop with pen support.', image: '/assets/images/Asus-ZenBook-Pro-Duo-15.jpg' },
    { name: 'Sony Alpha a6400', category: 'Cameras', price: 78000, stock: 2, condition_type: 'Used - Like New', description: 'Shutter count 5k. Comes with 16-50mm kit lens.', image: '/assets/images/Sony-Alpha-a6400.jpg' },
    { name: 'Canon EOS R50', category: 'Cameras', price: 82000, stock: 4, condition_type: 'New', description: 'Brand new body only. Official warranty available.', image: '/assets/images/Canon-EOS-R50.jpg' },
    { name: 'Apple Watch Ultra', category: 'Smart Watches', price: 65000, stock: 5, condition_type: 'Used - Good', description: 'Battery health 100%. Minor scratch on casing.', image: '/assets/images/Apple-Watch-Ultra.jpg' },
    { name: 'Samsung Galaxy Watch 6', category: 'Smart Watches', price: 28000, stock: 8, condition_type: 'New', description: 'Sealed box. Classic edition 47mm.', image: '/assets/images/Samsung-Galaxy-Watch-6.jpg' }
];

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for Seeding...');

        // 1. Find the Admin user you just created in the database
        const adminUser = await User.findOne({ role: 'admin' });

        if (!adminUser) {
            console.error('❌ Error: No admin user found. Ensure your account is set to "admin" in Compass.');
            process.exit(1);
        }

        // 2. Clear existing products to prevent duplicates
        await Product.deleteMany(); 
        
        // 3. Attach the admin ID as the sellerId for every legacy product
        const productsWithSeller = legacyProducts.map(product => ({
            ...product,
            sellerId: adminUser._id
        }));

        // 4. Inject the data
        await Product.insertMany(productsWithSeller);

        console.log('✅ Legacy TechTown Data Imported Successfully!');
        process.exit();
    } catch (error) {
        // Log the specific error message for cleaner debugging
        console.error('❌ Seeder Error:', error.message);
        process.exit(1);
    }
};

importData();