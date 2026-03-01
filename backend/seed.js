const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});


    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'adminstore@gmail.com',
      password: 'admin@123',
      role: 'admin',
    });

    // Create test user
    await User.create({
      name: 'John Doe',
      email: 'john@test.com',
      password: 'user123',
      role: 'user',
    });

    // Create products
    const products = [
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium wireless headphones with noise cancellation, 30-hour battery life, and comfortable over-ear design.',
        category: 'Electronics',
        price: 2999,
        discountPrice: 1999,
        stock: 50,
        active: true,
        images: [],
        specifications: [
          { key: 'Brand', value: 'SoundMax' },
          { key: 'Connectivity', value: 'Bluetooth 5.2' },
          { key: 'Battery Life', value: '30 hours' },
          { key: 'Driver Size', value: '40mm' },
          { key: 'Weight', value: '250g' },
          { key: 'Noise Cancellation', value: 'Active (ANC)' },
        ],
      },
      {
        name: 'Cotton Casual T-Shirt',
        description: 'Soft 100% cotton t-shirt available in multiple colors. Perfect for everyday wear.',
        category: 'Clothing',
        price: 799,
        discountPrice: 499,
        stock: 200,
        active: true,
        images: [],
        specifications: [
          { key: 'Material', value: '100% Cotton' },
          { key: 'Fit', value: 'Regular Fit' },
          { key: 'Neck Type', value: 'Round Neck' },
          { key: 'Sleeve', value: 'Half Sleeve' },
          { key: 'Care', value: 'Machine Washable' },
        ],
      },
      {
        name: 'Stainless Steel Water Bottle',
        description: 'Double-walled insulated water bottle that keeps drinks cold for 24 hours and hot for 12 hours.',
        category: 'Home & Kitchen',
        price: 599,
        discountPrice: null,
        stock: 100,
        active: true,
        images: [],
        specifications: [
          { key: 'Material', value: 'Stainless Steel (304)' },
          { key: 'Capacity', value: '750ml' },
          { key: 'Insulation', value: 'Double-Wall Vacuum' },
          { key: 'Cold Retention', value: '24 hours' },
          { key: 'Hot Retention', value: '12 hours' },
          { key: 'BPA Free', value: 'Yes' },
        ],
      },
      {
        name: 'Running Shoes Pro',
        description: 'Lightweight running shoes with advanced cushioning and breathable mesh upper.',
        category: 'Footwear',
        price: 3499,
        discountPrice: 2799,
        stock: 75,
        active: true,
        images: [],
        specifications: [
          { key: 'Upper Material', value: 'Breathable Mesh' },
          { key: 'Sole Material', value: 'EVA + Rubber' },
          { key: 'Closure', value: 'Lace-Up' },
          { key: 'Weight', value: '280g (per shoe)' },
          { key: 'Ideal For', value: 'Running, Jogging' },
        ],
      },
      {
        name: 'Smart Watch Series 5',
        description: 'Feature-packed smartwatch with heart rate monitor, GPS, and water resistance.',
        category: 'Electronics',
        price: 8999,
        discountPrice: 6999,
        stock: 30,
        active: true,
        images: [],
        specifications: [
          { key: 'Display', value: '1.4" AMOLED' },
          { key: 'Battery Life', value: '7 days' },
          { key: 'Water Resistance', value: 'IP68 (5ATM)' },
          { key: 'Sensors', value: 'Heart Rate, SpO2, GPS' },
          { key: 'Compatibility', value: 'Android & iOS' },
          { key: 'Strap Material', value: 'Silicone' },
        ],
      },
      {
        name: 'Organic Green Tea Pack',
        description: 'Premium organic green tea leaves sourced from Darjeeling. 100 tea bags per pack.',
        category: 'Food & Beverages',
        price: 450,
        discountPrice: null,
        stock: 500,
        active: true,
        images: [],
        specifications: [
          { key: 'Type', value: 'Green Tea' },
          { key: 'Origin', value: 'Darjeeling, India' },
          { key: 'Quantity', value: '100 Tea Bags' },
          { key: 'Organic Certified', value: 'Yes' },
          { key: 'Net Weight', value: '200g' },
        ],
      },
      {
        name: 'Laptop Backpack',
        description: 'Spacious backpack with dedicated laptop compartment, USB charging port, and anti-theft design.',
        category: 'Accessories',
        price: 1299,
        discountPrice: 999,
        stock: 80,
        active: true,
        images: [],
        specifications: [
          { key: 'Material', value: 'Water-Resistant Polyester' },
          { key: 'Laptop Compartment', value: 'Up to 15.6"' },
          { key: 'USB Charging Port', value: 'Yes' },
          { key: 'Capacity', value: '30L' },
          { key: 'Anti-Theft', value: 'Hidden Zipper' },
          { key: 'Weight', value: '650g' },
        ],
      },
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with adjustable DPI and silent click technology.',
        category: 'Electronics',
        price: 699,
        discountPrice: 499,
        stock: 150,
        active: true,
        images: [],
        specifications: [
          { key: 'Connectivity', value: '2.4GHz Wireless' },
          { key: 'DPI', value: '800/1200/1600 Adjustable' },
          { key: 'Battery', value: 'AA Battery (12 months)' },
          { key: 'Buttons', value: '6 Buttons' },
          { key: 'Silent Click', value: 'Yes' },
          { key: 'Weight', value: '85g' },
        ],
      },
    ];

    await Product.insertMany(products);

    // Create coupons
    const coupons = [
      {
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        minOrderValue: 500,
        maxDiscountCap: 200,
        usageLimit: 100,
        usedCount: 0,
        expiry: new Date('2026-12-31'),
        active: true,
      },
      {
        code: 'FLAT100',
        type: 'fixed',
        value: 100,
        minOrderValue: 1000,
        maxDiscountCap: null,
        usageLimit: 50,
        usedCount: 0,
        expiry: new Date('2026-12-31'),
        active: true,
      },
      {
        code: 'MEGA25',
        type: 'percentage',
        value: 25,
        minOrderValue: 2000,
        maxDiscountCap: 500,
        usageLimit: 30,
        usedCount: 0,
        expiry: new Date('2026-06-30'),
        active: true,
      },
      {
        code: 'EXPIRED5',
        type: 'percentage',
        value: 5,
        minOrderValue: 0,
        maxDiscountCap: null,
        usageLimit: null,
        usedCount: 0,
        expiry: new Date('2025-01-01'),
        active: true,
      },
    ];

    await Coupon.insertMany(coupons);

    console.log('Database seeded successfully!');
    console.log('Admin: adminstore@gmail.com / admin@123');
    console.log('User:  john@test.com / user123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
