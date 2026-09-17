/**
 * ReMarket Database Seed Script
 * DEVELOPMENT ONLY — clears and repopulates demo data.
 *
 * Usage: npm run seed (from server directory)
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import PurchaseRequest from '../models/PurchaseRequest.js';
import Notification from '../models/Notification.js';
dotenv.config();

const CONNECT_OPTIONS = { serverSelectionTimeoutMS: 5000 };

const DEMO_PASSWORD = 'Demo@123';

const categories = [
  { name: 'Electronics', subcategories: ['Audio', 'Cameras', 'Accessories'] },
  { name: 'Mobile Phones', subcategories: ['Android', 'iPhone', 'Accessories'] },
  { name: 'Laptops', subcategories: ['Gaming', 'Business', 'Student'] },
  { name: 'Furniture', subcategories: ['Sofa', 'Bed', 'Desk', 'Chair'] },
  { name: 'Vehicles', subcategories: ['Bikes', 'Scooters', 'Cars'] },
  { name: 'Books', subcategories: ['Academic', 'Novels', 'Competitive'] },
  { name: 'Clothing', subcategories: ['Men', 'Women', 'Kids'] },
  { name: 'Sports', subcategories: ['Cricket', 'Football', 'Gym'] },
  { name: 'Home Appliances', subcategories: ['Kitchen', 'Cleaning', 'Cooling'] },
  { name: 'Other', subcategories: ['Miscellaneous'] },
];

const users = [
  {
    name: 'Admin User',
    email: 'admin@remarket.demo',
    phone: '9876543210',
    city: 'Mumbai',
    role: 'admin',
  },
  {
    name: 'Rahul Sharma',
    email: 'rahul@remarket.demo',
    phone: '9876543211',
    city: 'Thane',
    role: 'user',
  },
  {
    name: 'Priya Patel',
    email: 'priya@remarket.demo',
    phone: '9876543212',
    city: 'Navi Mumbai',
    role: 'user',
  },
  {
    name: 'Amit Desai',
    email: 'amit@remarket.demo',
    phone: '9876543213',
    city: 'Borivali',
    role: 'user',
  },
  {
    name: 'Sneha Kulkarni',
    email: 'sneha@remarket.demo',
    phone: '9876543214',
    city: 'Andheri',
    role: 'user',
  },
];

const placeholder = (text, color = '4F46E5') =>
  `https://placehold.co/600x400/${color}/FFFFFF?text=${encodeURIComponent(text)}`;

const products = (sellerIds) => [
  {
    title: 'Sony WH-1000XM4 Headphones',
    description: 'Premium noise-cancelling wireless headphones. Used for 8 months, excellent battery life and sound quality. Includes original box and cable.',
    category: 'Electronics',
    subcategory: 'Audio',
    price: 12500,
    condition: 'Excellent',
    brand: 'Sony',
    images: [placeholder('Sony Headphones')],
    location: 'Thane',
    contactPreference: 'Both',
    seller: sellerIds.rahul,
    status: 'Available',
    views: 42,
  },
  {
    title: 'iPhone 13 128GB',
    description: 'iPhone 13 in blue colour. Battery health 89%. Minor scratches on back cover. Face ID and camera working perfectly.',
    category: 'Mobile Phones',
    subcategory: 'iPhone',
    price: 38000,
    condition: 'Good',
    brand: 'Apple',
    images: [placeholder('iPhone 13', '1D4ED8')],
    location: 'Navi Mumbai',
    contactPreference: 'Phone',
    seller: sellerIds.priya,
    status: 'Available',
    views: 78,
  },
  {
    title: 'Dell Inspiron 15 Laptop',
    description: 'Intel i5 11th gen, 8GB RAM, 512GB SSD. Ideal for students and office work. Charger included.',
    category: 'Laptops',
    subcategory: 'Student',
    price: 32000,
    condition: 'Good',
    brand: 'Dell',
    images: [placeholder('Dell Laptop', '059669')],
    location: 'Borivali',
    contactPreference: 'Both',
    seller: sellerIds.amit,
    status: 'Available',
    views: 55,
  },
  {
    title: 'IKEA Study Desk with Drawer',
    description: 'Compact wooden study desk with one drawer. Perfect for small rooms. Self-pickup from Andheri.',
    category: 'Furniture',
    subcategory: 'Desk',
    price: 4500,
    condition: 'Like New',
    brand: 'IKEA',
    images: [placeholder('Study Desk', 'D97706')],
    location: 'Andheri',
    contactPreference: 'Phone',
    seller: sellerIds.sneha,
    status: 'Available',
    views: 23,
  },
  {
    title: 'Hero Splendor Plus 2019',
    description: 'Well maintained bike, single owner. All service records available. 35,000 km driven.',
    category: 'Vehicles',
    subcategory: 'Bikes',
    price: 42000,
    condition: 'Good',
    brand: 'Hero',
    images: [placeholder('Splendor Bike', 'DC2626')],
    location: 'Mira Road',
    contactPreference: 'Phone',
    seller: sellerIds.rahul,
    status: 'Available',
    views: 91,
  },
  {
    title: 'Engineering Mathematics Textbook Set',
    description: 'Complete set of 4 engineering maths books for FE/SE. Highlighted notes in some chapters.',
    category: 'Books',
    subcategory: 'Academic',
    price: 1200,
    condition: 'Fair',
    brand: 'Various',
    images: [placeholder('Books', '7C3AED')],
    location: 'Thane',
    contactPreference: 'Email',
    seller: sellerIds.priya,
    status: 'Available',
    views: 12,
  },
  {
    title: 'Samsung 7kg Washing Machine',
    description: 'Fully automatic front-load washing machine. Works perfectly. Selling due to relocation.',
    category: 'Home Appliances',
    subcategory: 'Cleaning',
    price: 15000,
    condition: 'Excellent',
    brand: 'Samsung',
    images: [placeholder('Washing Machine', '0891B2')],
    location: 'Borivali',
    contactPreference: 'Both',
    seller: sellerIds.amit,
    status: 'Pending',
    views: 34,
  },
  {
    title: 'Adidas Cricket Bat + Kit',
    description: 'English willow bat with gloves and thigh guard. Used for one season in college cricket.',
    category: 'Sports',
    subcategory: 'Cricket',
    price: 3500,
    condition: 'Good',
    brand: 'Adidas',
    images: [placeholder('Cricket Kit', '16A34A')],
    location: 'Andheri',
    contactPreference: 'Both',
    seller: sellerIds.sneha,
    status: 'Sold',
    views: 67,
  },
  {
    title: 'Men Formal Blazer - Size 40',
    description: 'Navy blue formal blazer, worn twice for interviews. Dry cleaned and ready to use.',
    category: 'Clothing',
    subcategory: 'Men',
    price: 1800,
    condition: 'Like New',
    brand: 'Peter England',
    images: [placeholder('Blazer', '1E40AF')],
    location: 'Navi Mumbai',
    contactPreference: 'Email',
    seller: sellerIds.rahul,
    status: 'Available',
    views: 19,
  },
  {
    title: 'Boat Airdopes 131',
    description: 'True wireless earbuds with charging case. 6 months old, good sound quality.',
    category: 'Electronics',
    subcategory: 'Audio',
    price: 900,
    condition: 'Good',
    brand: 'Boat',
    images: [placeholder('Earbuds', '9333EA')],
    location: 'Mumbai',
    contactPreference: 'Both',
    seller: sellerIds.priya,
    status: 'Available',
    views: 28,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, CONNECT_OPTIONS);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      PurchaseRequest.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('Cleared existing collections');

    // Create users
    const createdUsers = {};
    for (const u of users) {
      const user = await User.create({ ...u, password: DEMO_PASSWORD, isEmailVerified: true });
      createdUsers[u.email.split('@')[0]] = user._id;
      console.log(`  User: ${u.name} (${u.email})`);
    }

    const sellerIds = {
      rahul: createdUsers.rahul,
      priya: createdUsers.priya,
      amit: createdUsers.amit,
      sneha: createdUsers.sneha,
    };

    // Create categories
    await Category.insertMany(categories);
    console.log(`  Categories: ${categories.length}`);

    // Create products
    const createdProducts = await Product.insertMany(products(sellerIds));
    console.log(`  Products: ${createdProducts.length}`);

    // Add wishlist items for demo buyer
    await User.findByIdAndUpdate(createdUsers.amit, {
      wishlist: [createdProducts[0]._id, createdProducts[1]._id, createdProducts[9]._id],
    });

    // Sample purchase requests
    const pendingRequest = await PurchaseRequest.create({
      product: createdProducts[0]._id,
      buyer: createdUsers.amit,
      seller: sellerIds.rahul,
      message: 'Hi, I am interested in these headphones. Is the price negotiable?',
      offeredPrice: 11000,
      status: 'Pending',
    });

    const acceptedRequest = await PurchaseRequest.create({
      product: createdProducts[6]._id,
      buyer: createdUsers.sneha,
      seller: sellerIds.amit,
      message: 'I would like to buy this washing machine. Can you deliver to Andheri?',
      offeredPrice: 14000,
      status: 'Accepted',
    });

    const completedRequest = await PurchaseRequest.create({
      product: createdProducts[7]._id,
      buyer: createdUsers.rahul,
      seller: sellerIds.sneha,
      message: 'Need this cricket kit for weekend match.',
      status: 'Completed',
    });

    console.log('  Purchase requests: 3');

    // Sample notifications
    await Notification.insertMany([
      {
        recipient: sellerIds.rahul,
        message: 'Amit Desai sent a purchase request for "Sony WH-1000XM4 Headphones"',
        type: 'request_received',
        relatedProduct: createdProducts[0]._id,
        relatedRequest: pendingRequest._id,
        read: false,
      },
      {
        recipient: createdUsers.sneha,
        message: 'Your purchase request for "Samsung 7kg Washing Machine" was accepted',
        type: 'request_accepted',
        relatedProduct: createdProducts[6]._id,
        relatedRequest: acceptedRequest._id,
        read: false,
      },
      {
        recipient: createdUsers.rahul,
        message: 'Transaction for "Adidas Cricket Bat + Kit" was completed',
        type: 'request_completed',
        relatedProduct: createdProducts[7]._id,
        relatedRequest: completedRequest._id,
        read: true,
      },
      {
        recipient: sellerIds.priya,
        message: 'Welcome to ReMarket! Start listing your used products today.',
        type: 'general',
        read: true,
      },
    ]);
    console.log('  Notifications: 4');

    console.log('\n========================================');
    console.log('  ReMarket seed completed successfully!');
    console.log('========================================');
    console.log('\nDEVELOPMENT ONLY demo credentials:');
    console.log('  Password (all users): Demo@123');
    console.log('\n  Admin:  admin@remarket.demo');
    console.log('  Seller: rahul@remarket.demo');
    console.log('  Buyer:  amit@remarket.demo');
    console.log('  User:   priya@remarket.demo');
    console.log('  User:   sneha@remarket.demo');
    console.log('========================================\n');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
