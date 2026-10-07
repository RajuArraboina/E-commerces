const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

dotenv.config();

async function seedWatches() {
  try {
    console.log('[SeedWatches] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[SeedWatches] Connected.');

    // 1. Delete all dummy test products created by test-apis.js
    const deleteTestProds = await Product.deleteMany({
      name: { $regex: /Pro Noise Cancelling Headphones/i },
    });
    console.log(`[SeedWatches] Cleaned up ${deleteTestProds.deletedCount} dummy test products.`);

    // Also clean up dummy test categories
    const deleteTestCats = await Category.deleteMany({
      name: { $regex: /^Gadgets_/i },
    });
    console.log(`[SeedWatches] Cleaned up ${deleteTestCats.deletedCount} dummy test categories.`);

    // 2. Ensure Category exists: 'Audio & Wearables' or 'Smartwatches'
    let cat = await Category.findOne({ name: 'Audio & Wearables' });
    if (!cat) {
      cat = await Category.create({
        name: 'Audio & Wearables',
        description: 'Premium smartwatches, wireless earbuds, and audio lifestyle gear',
        image: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600',
        isActive: true,
      });
      console.log('[SeedWatches] Created Audio & Wearables category.');
    }

    // 3. Remove any previous boAt or watch if needed to replace with fresh rich data
    await Product.deleteMany({
      name: {
        $in: [
          'Apple Watch Series 9 GPS + Cellular',
          'Samsung Galaxy Watch 6 Classic (Rotating Bezel)',
          'boAt Wave Call 2 Bluetooth Calling Smartwatch',
          'boAt Wave Call Smartwatch with Bluetooth Calling',
          'Noise ColorFit Pro 5 Max AMOLED Smartwatch',
          'Garmin Forerunner 265 GPS Running Smartwatch',
          'Fossil Gen 6 Smartwatch Stainless Steel & Leather',
        ],
      },
    });

    // 4. Insert 6 top-brand smartwatches with distinct colors, companies, images & specs
    const watchCatalog = [
      {
        name: 'Apple Watch Series 9 GPS + Cellular',
        brand: 'Apple',
        category: cat._id,
        price: 41900,
        stock: 45,
        rating: 4.9,
        numReviews: 128,
        image: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600',
        description:
          'S9 SiP chip with Double Tap gesture control, Always-On 2000-nit Retina display, precision blood oxygen & ECG tracking, and 50m water resistance.',
        specifications: [
          { name: 'Display', value: '1.9" Always-On Retina OLED (2000 nits)' },
          { name: 'Processor', value: 'Apple S9 SiP (64-bit dual-core)' },
          { name: 'Battery', value: 'Up to 18 hrs (36 hrs Low Power Mode)' },
          { name: 'Sensors', value: 'ECG, Blood Oxygen (SpO2), Temperature, Heart Rate' },
          { name: 'Water Rating', value: 'WR50 (50 meters swim-proof)' },
        ],
        variants: [
          {
            sku: 'AW9-MIDNIGHT-45',
            title: 'Midnight Black / 45mm',
            color: 'Midnight Black',
            size: '45mm',
            price: 41900,
            stock: 15,
            image: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600',
          },
          {
            sku: 'AW9-STARLIGHT-45',
            title: 'Starlight Cream / 45mm',
            color: 'Starlight Cream',
            size: '45mm',
            price: 41900,
            stock: 12,
            image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600',
          },
          {
            sku: 'AW9-SILVER-45',
            title: 'Silver Aluminum / 45mm',
            color: 'Silver Aluminum',
            size: '45mm',
            price: 42900,
            stock: 10,
            image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600',
          },
          {
            sku: 'AW9-RED-45',
            title: 'Product RED / 45mm',
            color: 'Product RED',
            size: '45mm',
            price: 41900,
            stock: 8,
            image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600',
          },
        ],
      },
      {
        name: 'Samsung Galaxy Watch 6 Classic (Rotating Bezel)',
        brand: 'Samsung',
        category: cat._id,
        price: 36999,
        stock: 42,
        rating: 4.8,
        numReviews: 94,
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
        description:
          'Iconic slim physical rotating bezel, sapphire crystal Super AMOLED display, personalized sleep coaching, and Samsung BioActive sensor analysis.',
        specifications: [
          { name: 'Display', value: '1.5" Super AMOLED Sapphire Crystal (480x480)' },
          { name: 'OS', value: 'Wear OS Powered by Samsung (One UI 5 Watch)' },
          { name: 'Battery', value: '425mAh (Up to 40 hours with Fast Charging)' },
          { name: 'Durability', value: '5ATM + IP68 + MIL-STD-810H Certified' },
          { name: 'Sensors', value: 'BioActive Sensor (HR + ECG + BIA Body Composition)' },
        ],
        variants: [
          {
            sku: 'GW6C-BLK-47',
            title: 'Classic Black / 47mm',
            color: 'Classic Black',
            size: '47mm',
            price: 36999,
            stock: 18,
            image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600',
          },
          {
            sku: 'GW6C-SLV-47',
            title: 'Silver Chrome / 47mm',
            color: 'Silver Chrome',
            size: '47mm',
            price: 36999,
            stock: 14,
            image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600',
          },
          {
            sku: 'GW6C-BLU-47',
            title: 'Sapphire Blue / 47mm',
            color: 'Sapphire Blue',
            size: '47mm',
            price: 37999,
            stock: 10,
            image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
          },
        ],
      },
      {
        name: 'boAt Wave Call 2 Bluetooth Calling Smartwatch',
        brand: 'boAt',
        category: cat._id,
        price: 1999,
        stock: 80,
        rating: 4.6,
        numReviews: 215,
        image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600',
        description:
          '1.83-inch HD Display, advanced Bluetooth calling with dial pad, 700+ active sports modes, live cricket scores, and IP67 dust & sweat resistance.',
        specifications: [
          { name: 'Display', value: '1.83" HD Curved 2.5D Glass (550 nits)' },
          { name: 'Calling', value: 'Bluetooth 5.2 with ENC Clear Voice Mic' },
          { name: 'Battery', value: 'Up to 5 days standard, 2 days with BT calling' },
          { name: 'Sports Modes', value: '700+ Active Sports Tracking Modes' },
          { name: 'Water Resistance', value: 'IP67 Certified Splash & Sweat Proof' },
        ],
        variants: [
          {
            sku: 'BOAT-WC2-BLK',
            title: 'Active Black',
            color: 'Active Black',
            price: 1999,
            stock: 35,
            image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600',
          },
          {
            sku: 'BOAT-WC2-PNK',
            title: 'Cherry Blossom Pink',
            color: 'Cherry Blossom Pink',
            price: 1999,
            stock: 25,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
          },
          {
            sku: 'BOAT-WC2-BLU',
            title: 'Deep Navy Blue',
            color: 'Deep Navy Blue',
            price: 2199,
            stock: 20,
            image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600',
          },
        ],
      },
      {
        name: 'Noise ColorFit Pro 5 Max AMOLED Smartwatch',
        brand: 'Noise',
        category: cat._id,
        price: 4999,
        stock: 72,
        rating: 4.7,
        numReviews: 142,
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600',
        description:
          '1.96-inch AMOLED display with Always-On screen, TruSync Bluetooth calling, post-workout VO2 max recovery metrics, and premium metallic casing.',
        specifications: [
          { name: 'Display', value: '1.96" Ultra AMOLED (410x502 px, 600 nits)' },
          { name: 'Battery', value: 'Up to 7 days battery, Fast Charge in 45 mins' },
          { name: 'Health Tracking', value: 'Noise Health Suite (HR, SpO2, Stress, Sleep)' },
          { name: 'Voice Support', value: 'AI Voice Assistant (Siri & Google)' },
          { name: 'Water Resistance', value: 'IP68 Water & Dust Resistant' },
        ],
        variants: [
          {
            sku: 'NOISE-CP5-BLK',
            title: 'Jet Black',
            color: 'Jet Black',
            price: 4999,
            stock: 25,
            image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600',
          },
          {
            sku: 'NOISE-CP5-GRN',
            title: 'Forest Green',
            color: 'Forest Green',
            price: 4999,
            stock: 18,
            image: 'https://images.unsplash.com/photo-1517502474097-f9b30659dadb?w=600',
          },
          {
            sku: 'NOISE-CP5-RSG',
            title: 'Rose Gold',
            color: 'Rose Gold',
            price: 5299,
            stock: 15,
            image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
          },
          {
            sku: 'NOISE-CP5-SLV',
            title: 'Titanium Silver',
            color: 'Titanium Silver',
            price: 5299,
            stock: 14,
            image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600',
          },
        ],
      },
      {
        name: 'Garmin Forerunner 265 GPS Running Smartwatch',
        brand: 'Garmin',
        category: cat._id,
        price: 48490,
        stock: 24,
        rating: 4.9,
        numReviews: 76,
        image: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=600',
        description:
          'Brilliant AMOLED touchscreen with button controls, training readiness score, multi-band GPS with SatIQ, and up to 13 days of battery life.',
        specifications: [
          { name: 'Display', value: '1.3" AMOLED Touchscreen (416x416 pixels)' },
          { name: 'GPS', value: 'Multi-Band GNSS with SatIQ Technology' },
          { name: 'Battery', value: 'Up to 13 days smartwatch mode, 20 hrs GPS mode' },
          { name: 'Water Rating', value: '5 ATM (50m Swim Proof)' },
          { name: 'Performance', value: 'VO2 Max, HRV Status, Training Load, Morning Report' },
        ],
        variants: [
          {
            sku: 'GAR-FR265-BLK',
            title: 'Slate Black',
            color: 'Slate Black',
            price: 48490,
            stock: 10,
            image: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=600',
          },
          {
            sku: 'GAR-FR265-WHT',
            title: 'Whitestone',
            color: 'Whitestone',
            price: 48490,
            stock: 8,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
          },
          {
            sku: 'GAR-FR265-AQU',
            title: 'Aqua Cyan',
            color: 'Aqua Cyan',
            price: 49490,
            stock: 6,
            image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600',
          },
        ],
      },
      {
        name: 'Fossil Gen 6 Smartwatch Stainless Steel & Leather',
        brand: 'Fossil',
        category: cat._id,
        price: 24995,
        stock: 35,
        rating: 4.7,
        numReviews: 68,
        image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600',
        description:
          'Powered by Qualcomm Snapdragon Wear 4100+, rapid magnetic charging (80% in 30 minutes), premium stainless steel body, and Wear OS by Google.',
        specifications: [
          { name: 'Display', value: '1.28" Color AMOLED (416x416 px, 326 ppi)' },
          { name: 'Processor', value: 'Qualcomm Snapdragon Wear 4100+ Platform' },
          { name: 'Fast Charging', value: '80% in 30 minutes via magnetic puck' },
          { name: 'Water Rating', value: '3 ATM (Splash & Shower Proof)' },
          { name: 'Connectivity', value: 'Bluetooth 5.0 LE, GPS, NFC SE, Wi-Fi' },
        ],
        variants: [
          {
            sku: 'FOS-G6-SMK',
            title: 'Smoke Stainless Steel',
            color: 'Smoke Stainless Steel',
            price: 24995,
            stock: 12,
            image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600',
          },
          {
            sku: 'FOS-G6-BRN',
            title: 'Brown Leather Strap',
            color: 'Brown Leather',
            price: 23995,
            stock: 15,
            image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600',
          },
          {
            sku: 'FOS-G6-RSG',
            title: 'Rose Gold Mesh',
            color: 'Rose Gold',
            price: 25995,
            stock: 8,
            image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
          },
        ],
      },
    ];

    const inserted = await Product.insertMany(watchCatalog);
    console.log(`[SeedWatches] Successfully inserted ${inserted.length} diverse smartwatches!`);
    inserted.forEach((p) => {
      console.log(`  - ${p.brand} | ${p.name} (Variants: ${p.variants.length})`);
    });

    process.exit(0);
  } catch (err) {
    console.error('[SeedWatches] Error:', err);
    process.exit(1);
  }
}

seedWatches();
