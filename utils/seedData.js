const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('[Seeder] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seeder] Connected to MongoDB.');

    // 1. Clear existing collections
    console.log('[Seeder] Clearing old collections...');
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();

    // 2. Create Users
    console.log('[Seeder] Creating users...');
    const adminUser = await User.create({
      name: 'ShopSphere Admin',
      email: 'admin@shopsphere.com',
      password: 'adminPassword123',
      phone: '+91 9876543210',
      address: {
        street: '100 Admin Boulevard',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
      },
      role: 'admin',
    });

    const customerUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'customerPassword123',
      phone: '+91 9876500000',
      address: {
        street: '42 Baker Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
      },
      role: 'customer',
    });

    console.log('[Seeder] Admin & Customer users created.');

    // 3. Create Categories
    console.log('[Seeder] Creating categories...');
    const categories = await Category.insertMany([
      {
        name: 'Electronics',
        description: 'Smartphones, laptops, headphones, audio, and premium smart gadgets',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
        isActive: true,
      },
      {
        name: 'Fashion',
        description: 'Apparel, footwear, watches, and trendsetting lifestyle accessories',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600',
        isActive: true,
      },
      {
        name: 'Home & Kitchen',
        description: 'Kitchen appliances, modern cookware, decor, and comfort furnishings',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600',
        isActive: true,
      },
      {
        name: 'Sports & Fitness',
        description: 'Gym equipment, athletic sportswear, outdoor gear, and accessories',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
        isActive: true,
      },
      {
        name: 'Books',
        description: 'Bestselling fiction, non-fiction, technology, and self-help literature',
        image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600',
        isActive: true,
      },
    ]);

    const catMap = {};
    categories.forEach((cat) => {
      catMap[cat.name] = cat._id;
    });

    // 4. Create Products with Dynamic Specifications and Variants
    console.log('[Seeder] Creating products with dynamic variants & specifications...');
    const productsData = [
      {
        name: 'iPhone 15 Pro',
        description: 'Titanium design, A17 Pro chip, custom Action button, 48MP main camera system with 3x optical zoom.',
        price: 129900,
        category: catMap['Electronics'],
        brand: 'Apple',
        stock: 37,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
        rating: 4.8,
        isAvailable: true,
        specifications: [
          { name: 'Processor', value: 'Apple A17 Pro (3nm)' },
          { name: 'Display', value: '6.1-inch Super Retina XDR OLED 120Hz' },
          { name: 'Camera', value: '48MP Main + 12MP Ultra-Wide + 12MP Telephoto' },
          { name: 'Battery', value: 'Up to 23 hours video playback' },
        ],
        variants: [
          {
            sku: 'IPH15P-128-NAT',
            title: 'Natural Titanium / 128GB',
            color: 'Natural Titanium',
            storage: '128GB',
            size: '128GB',
            price: 129900,
            stock: 12,
          },
          {
            sku: 'IPH15P-256-NAT',
            title: 'Natural Titanium / 256GB',
            color: 'Natural Titanium',
            storage: '256GB',
            size: '256GB',
            price: 139900,
            stock: 15,
          },
          {
            sku: 'IPH15P-256-BLU',
            title: 'Blue Titanium / 256GB',
            color: 'Blue Titanium',
            storage: '256GB',
            size: '256GB',
            price: 139900,
            stock: 10,
          },
        ],
      },
      {
        name: 'Sony WH-1000XM5 Wireless Headphones',
        description: 'Industry-leading noise canceling with dual processors, 8 microphones, and ultra-comfortable lightweight design.',
        price: 29990,
        category: catMap['Electronics'],
        brand: 'Sony',
        stock: 45,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        rating: 4.9,
        isAvailable: true,
        specifications: [
          { name: 'Driver Unit', value: '30mm Carbon Fiber Composite' },
          { name: 'Battery Life', value: '30 hours (ANC On), 40 hours (ANC Off)' },
          { name: 'Bluetooth', value: 'v5.2 with LDAC and Hi-Res Wireless Audio' },
          { name: 'Weight', value: '250g' },
        ],
        variants: [
          {
            sku: 'WH1000XM5-BLK',
            title: 'Black',
            color: 'Black',
            price: 29990,
            stock: 25,
          },
          {
            sku: 'WH1000XM5-SLV',
            title: 'Silver',
            color: 'Silver',
            price: 29990,
            stock: 20,
          },
        ],
      },
      {
        name: 'MacBook Air M2 13-inch',
        description: 'Strikingly thin design, 13.6-inch Liquid Retina display, 8-core CPU, up to 18 hours of battery life.',
        price: 99900,
        category: catMap['Electronics'],
        brand: 'Apple',
        stock: 20,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
        rating: 4.7,
        isAvailable: true,
        specifications: [
          { name: 'Chip', value: 'Apple M2 8-Core CPU' },
          { name: 'Display', value: '13.6-inch Liquid Retina with True Tone' },
          { name: 'Weight', value: '1.24 kg' },
        ],
        variants: [
          {
            sku: 'MBA-M2-MID-256',
            title: 'Midnight / 8GB RAM / 256GB SSD',
            color: 'Midnight',
            storage: '256GB',
            price: 99900,
            stock: 12,
          },
          {
            sku: 'MBA-M2-SLV-512',
            title: 'Silver / 16GB RAM / 512GB SSD',
            color: 'Silver',
            storage: '512GB',
            price: 129900,
            stock: 8,
          },
        ],
      },
      {
        name: 'Nike Air Max Pulse Sneakers',
        description: 'Loaded with incredible cushioning, breathable mesh upper, and vibrant urban streetwear styling.',
        price: 13995,
        category: catMap['Fashion'],
        brand: 'Nike',
        stock: 50,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
        rating: 4.8,
        isAvailable: true,
        specifications: [
          { name: 'Sole Material', value: 'Rubber with Air Max unit' },
          { name: 'Upper Material', value: 'Breathable textile mesh and leather overlays' },
        ],
        variants: [
          {
            sku: 'NIKE-PULSE-BLK-8',
            title: 'Black & Red / UK 8',
            color: 'Black/Red',
            size: 'UK 8',
            price: 13995,
            stock: 15,
          },
          {
            sku: 'NIKE-PULSE-BLK-9',
            title: 'Black & Red / UK 9',
            color: 'Black/Red',
            size: 'UK 9',
            price: 13995,
            stock: 20,
          },
          {
            sku: 'NIKE-PULSE-BLK-10',
            title: 'Black & Red / UK 10',
            color: 'Black/Red',
            size: 'UK 10',
            price: 13995,
            stock: 15,
          },
        ],
      },
      {
        name: 'Men Premium Leather Jacket',
        description: 'Handcrafted genuine lambskin leather jacket with smooth satin lining and reinforced metallic hardware.',
        price: 8499,
        category: catMap['Fashion'],
        brand: 'UrbanHide',
        stock: 35,
        image: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600',
        rating: 4.6,
        isAvailable: true,
        specifications: [
          { name: 'Material', value: '100% Genuine Lambskin' },
          { name: 'Closure', value: 'YKK Asymmetric Metallic Zipper' },
        ],
        variants: [
          {
            sku: 'LJ-BRN-M',
            title: 'Vintage Brown / Medium',
            color: 'Vintage Brown',
            size: 'M',
            price: 8499,
            stock: 15,
          },
          {
            sku: 'LJ-BRN-L',
            title: 'Vintage Brown / Large',
            color: 'Vintage Brown',
            size: 'L',
            price: 8499,
            stock: 20,
          },
        ],
      },
      {
        name: 'Atomic Habits by James Clear',
        description: 'An easy and proven way to build good habits and break bad ones. Millions of copies sold worldwide.',
        price: 499,
        category: catMap['Books'],
        brand: 'Penguin Random House',
        stock: 100,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
        rating: 5.0,
        isAvailable: true,
        specifications: [
          { name: 'Format', value: 'Paperback' },
          { name: 'Pages', value: '320' },
          { name: 'Language', value: 'English' },
        ],
        variants: [],
      },
    ];

    const createdProducts = await Product.insertMany(productsData);
    console.log(`[Seeder] ${createdProducts.length} Products created with dynamic variants.`);

    // 5. Initialize Cart for Customer with a specific variant
    console.log('[Seeder] Creating sample cart for customer with selected variants...');
    const iphone = createdProducts[0];
    const sonyHeadphones = createdProducts[1];

    await Cart.create({
      user: customerUser._id,
      items: [
        {
          product: iphone._id,
          variant: {
            variantId: iphone.variants[0]._id,
            sku: iphone.variants[0].sku,
            title: iphone.variants[0].title,
            color: iphone.variants[0].color,
            storage: iphone.variants[0].storage,
            size: iphone.variants[0].size,
          },
          quantity: 1,
          price: iphone.variants[0].price,
        },
        {
          product: sonyHeadphones._id,
          variant: {
            variantId: sonyHeadphones.variants[0]._id,
            sku: sonyHeadphones.variants[0].sku,
            title: sonyHeadphones.variants[0].title,
            color: sonyHeadphones.variants[0].color,
          },
          quantity: 1,
          price: sonyHeadphones.variants[0].price,
        },
      ],
    });

    console.log('\n========================================');
    console.log('✅ ShopSphere Database Seeded Successfully!');
    console.log('========================================');
    console.log('Admin Account:');
    console.log('  Email:    admin@shopsphere.com');
    console.log('  Password: adminPassword123');
    console.log('\nCustomer Account:');
    console.log('  Email:    john@example.com');
    console.log('  Password: customerPassword123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder] Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
