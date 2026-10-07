const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

/**
 * @desc    Get all products with dynamic search, filter, sort & pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      isAvailable,
      color,
      size,
      storage,
      minRating,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // 1. Keyword Search across name, description, brand, variant titles & specifications
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { 'variants.title': { $regex: search, $options: 'i' } },
        { 'variants.sku': { $regex: search, $options: 'i' } },
        { 'specifications.value': { $regex: search, $options: 'i' } },
      ];
    }

    // 2. Category Filter (supports either ObjectId or Category Name)
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const foundCategory = await Category.findOne({
          name: { $regex: new RegExp(`^${category.trim()}$`, 'i') },
        });
        if (foundCategory) {
          query.category = foundCategory._id;
        } else {
          return res.status(200).json({
            success: true,
            count: 0,
            total: 0,
            totalPages: 0,
            currentPage: Number(page),
            data: [],
          });
        }
      }
    }

    // 3. Brand Filter
    if (brand) {
      query.brand = { $regex: new RegExp(`^${brand.trim()}$`, 'i') };
    }

    // 4. Price Range Filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // 5. Stock / Availability Filter
    if (inStock === 'true' || inStock === true) {
      query.stock = { $gt: 0 };
      query.isAvailable = true;
    } else if (inStock === 'false' || inStock === false) {
      query.stock = 0;
    }

    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true' || isAvailable === true;
    }

    // 6. Dynamic Variant & Attribute Filters (color, size, storage, specs)
    if (color) {
      query.$or = query.$or || [];
      query.$or.push(
        { 'variants.color': { $regex: new RegExp(`^${color.trim()}$`, 'i') } },
        { 'specifications.value': { $regex: new RegExp(`^${color.trim()}$`, 'i') } }
      );
    }

    if (size) {
      query.$or = query.$or || [];
      query.$or.push(
        { 'variants.size': { $regex: new RegExp(`^${size.trim()}$`, 'i') } },
        { 'specifications.value': { $regex: new RegExp(`^${size.trim()}$`, 'i') } }
      );
    }

    if (storage) {
      query.$or = query.$or || [];
      query.$or.push(
        { 'variants.storage': { $regex: new RegExp(`^${storage.trim()}$`, 'i') } },
        { 'specifications.value': { $regex: new RegExp(`^${storage.trim()}$`, 'i') } }
      );
    }

    if (minRating !== undefined && !isNaN(Number(minRating))) {
      query.rating = { $gte: Number(minRating) };
    }

    // 7. Sorting
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort) {
      switch (sort.toLowerCase()) {
        case 'price':
        case 'price_asc':
        case 'price:asc':
          sortOption = { price: 1 };
          break;
        case '-price':
        case 'price_desc':
        case 'price:desc':
          sortOption = { price: -1 };
          break;
        case 'rating':
        case '-rating':
          sortOption = { rating: -1 };
          break;
        case 'name':
        case 'name_asc':
          sortOption = { name: 1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        default:
          if (sort.startsWith('-')) {
            sortOption = { [sort.substring(1)]: -1 };
          } else {
            sortOption = { [sort]: 1 };
          }
      }
    }

    // 8. Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name image')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'category',
      'name description image'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product details retrieved successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new product with dynamic specifications & variants
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      stock,
      image,
      rating,
      isAvailable,
      specifications,
      variants,
      attributes,
    } = req.body;

    if (!name || !description || price === undefined || !category || !brand) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, price, category, and brand',
      });
    }

    // Validate category exists
    let categoryId = category;
    if (!mongoose.Types.ObjectId.isValid(category)) {
      const foundCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${category.trim()}$`, 'i') },
      });
      if (!foundCategory) {
        return res.status(400).json({
          success: false,
          message: `Category '${category}' does not exist. Please create category first or provide valid ID.`,
        });
      }
      categoryId = foundCategory._id;
    } else {
      const catExists = await Category.findById(category);
      if (!catExists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found with the provided ID',
        });
      }
    }

    const parsedStock = stock !== undefined ? Number(stock) : 0;

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: categoryId,
      brand: brand.trim(),
      stock: parsedStock,
      image: image || undefined,
      rating: rating !== undefined ? Number(rating) : 0,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : parsedStock > 0,
      specifications: Array.isArray(specifications) ? specifications : [],
      variants: Array.isArray(variants) ? variants : [],
      attributes: attributes || {},
    });

    const populatedProduct = await Product.findById(product._id).populate(
      'category',
      'name image'
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product by ID
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check category if changing
    if (req.body.category) {
      if (mongoose.Types.ObjectId.isValid(req.body.category)) {
        const cat = await Category.findById(req.body.category);
        if (!cat) {
          return res.status(404).json({
            success: false,
            message: 'Specified category not found',
          });
        }
        product.category = req.body.category;
      } else {
        const cat = await Category.findOne({
          name: { $regex: new RegExp(`^${req.body.category.trim()}$`, 'i') },
        });
        if (!cat) {
          return res.status(400).json({
            success: false,
            message: `Category '${req.body.category}' does not exist`,
          });
        }
        product.category = cat._id;
      }
    }

    if (req.body.name) product.name = req.body.name.trim();
    if (req.body.description) product.description = req.body.description.trim();
    if (req.body.price !== undefined) product.price = Number(req.body.price);
    if (req.body.brand) product.brand = req.body.brand.trim();
    if (req.body.image) product.image = req.body.image;
    if (req.body.rating !== undefined) product.rating = Number(req.body.rating);

    if (req.body.specifications !== undefined && Array.isArray(req.body.specifications)) {
      product.specifications = req.body.specifications;
    }

    if (req.body.variants !== undefined && Array.isArray(req.body.variants)) {
      product.variants = req.body.variants;
    }

    if (req.body.attributes !== undefined) {
      product.attributes = req.body.attributes;
    }

    if (req.body.stock !== undefined) {
      product.stock = Number(req.body.stock);
    }

    if (req.body.isAvailable !== undefined) {
      product.isAvailable = Boolean(req.body.isAvailable);
    }

    const updatedProduct = await product.save();
    const populated = await Product.findById(updatedProduct._id).populate(
      'category',
      'name image'
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product by ID
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a product customer review
 * @route   POST /api/products/:id/reviews
 * @access  Private (Customer/Admin)
 */
const addProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both rating and review comment',
      });
    }

    if (!product.reviews) product.reviews = [];

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      alreadyReviewed.rating = Number(rating);
      alreadyReviewed.comment = comment;
    } else {
      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };
      product.reviews.push(review);
    }

    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review saved successfully',
      data: product.reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
};
