const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      trim: true,
    },
    storage: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      min: [0, 'Variant price must be non-negative'],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Variant stock cannot be negative'],
      default: 0,
    },
    image: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: true }
);

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price must be a positive number'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category'],
    },
    brand: {
      type: String,
      required: [true, 'Please provide a product brand'],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Please specify stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // Dynamic technical specifications / attributes (e.g. Battery, RAM, Screen Size, Material)
    specifications: [specificationSchema],
    // Dynamic Product Variants (e.g. color, size, storage combinations with individual stock & price)
    variants: [variantSchema],
    // Key-value dynamic attribute map for fast lookups
    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Auto-sync stock and availability from variants
productSchema.pre('save', function () {
  if (this.variants && this.variants.length > 0) {
    let totalVariantStock = 0;
    this.variants.forEach((v) => {
      if (v.price === undefined || v.price === null) {
        v.price = this.price;
      }
      v.isAvailable = v.stock > 0;
      totalVariantStock += v.stock || 0;
    });
    this.stock = totalVariantStock;
  }

  this.isAvailable = this.stock > 0;
});

// Indexes for text search and dynamic filtering
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ 'variants.color': 1, 'variants.size': 1, 'variants.storage': 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
