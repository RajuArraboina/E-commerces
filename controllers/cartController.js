const mongoose = require('mongoose');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

/**
 * Helper to fetch populated cart and ensure prices reflect current product status
 */
const getPopulatedCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate(
    'items.product',
    'name price image stock isAvailable brand variants'
  );

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  // Filter out any items where the product was deleted
  const validItems = cart.items.filter((item) => item.product !== null);
  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }

  return cart;
};

/**
 * @desc    Get user's shopping cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    const cart = await getPopulatedCart(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      data: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        updatedAt: cart.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add product (with optional variant) to cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, variantId, sku, color, size, storage } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid productId',
      });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer',
      });
    }

    // Check if product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (!product.isAvailable || product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product is currently out of stock',
      });
    }

    // Determine variant if specified or if product has variants
    let selectedVariant = null;
    let itemPrice = product.price;
    let availableStock = product.stock;

    if (product.variants && product.variants.length > 0) {
      if (variantId) {
        selectedVariant = product.variants.id(variantId);
      } else if (sku) {
        selectedVariant = product.variants.find((v) => v.sku === sku);
      } else if (color || size || storage) {
        selectedVariant = product.variants.find(
          (v) =>
            (!color || v.color?.toLowerCase() === color.toLowerCase()) &&
            (!size || v.size?.toLowerCase() === size.toLowerCase()) &&
            (!storage || v.storage?.toLowerCase() === storage.toLowerCase())
        );
      }

      if (selectedVariant) {
        itemPrice = selectedVariant.price !== undefined ? selectedVariant.price : product.price;
        availableStock = selectedVariant.stock;

        if (availableStock < qty) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for variant '${selectedVariant.title || selectedVariant.sku}'. Requested: ${qty}, Available: ${availableStock}`,
          });
        }
      }
    }

    if (availableStock < qty) {
      return res.status(400).json({
        success: false,
        message: `Cannot add ${qty} items. Only ${availableStock} in stock.`,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Match cart item by productId AND variantId
    const existingIndex = cart.items.findIndex((item) => {
      const isSameProduct = item.product.toString() === productId;
      if (!isSameProduct) return false;

      if (selectedVariant) {
        return (
          item.variant?.variantId?.toString() === selectedVariant._id.toString() ||
          item.variant?.sku === selectedVariant.sku
        );
      } else {
        return !item.variant || !item.variant.variantId;
      }
    });

    if (existingIndex > -1) {
      const newQuantity = cart.items[existingIndex].quantity + qty;
      if (newQuantity > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more items. Only ${availableStock} available in stock. (Currently in cart: ${cart.items[existingIndex].quantity})`,
        });
      }
      cart.items[existingIndex].quantity = newQuantity;
      cart.items[existingIndex].price = itemPrice;
    } else {
      const variantPayload = selectedVariant
        ? {
            variantId: selectedVariant._id,
            sku: selectedVariant.sku || '',
            title: selectedVariant.title || '',
            color: selectedVariant.color || '',
            size: selectedVariant.size || '',
            storage: selectedVariant.storage || '',
          }
        : {};

      cart.items.push({
        product: product._id,
        variant: variantPayload,
        quantity: qty,
        price: itemPrice,
      });
    }

    await cart.save();

    const populatedCart = await getPopulatedCart(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Product added to cart successfully',
      data: {
        _id: populatedCart._id,
        items: populatedCart.items,
        totalItems: populatedCart.totalItems,
        subtotal: populatedCart.subtotal,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update quantity of product or specific variant in cart
 * @route   PUT /api/cart/:productId
 * @access  Private
 */
const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity, variantId, sku } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a quantity',
      });
    }

    const qty = parseInt(quantity, 10);
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found for this user',
      });
    }

    // Match cart item by either cart item _id, or product id (+ variant id if provided)
    const itemIndex = cart.items.findIndex((item) => {
      if (item._id.toString() === productId) return true;
      if (item.product.toString() === productId) {
        if (variantId) return item.variant?.variantId?.toString() === variantId;
        if (sku) return item.variant?.sku === sku;
        return true;
      }
      return false;
    });

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product item not found in cart',
      });
    }

    // If quantity is 0 or less, remove item
    if (qty <= 0) {
      cart.items.splice(itemIndex, 1);
      await cart.save();

      const populatedCart = await getPopulatedCart(req.user._id);
      return res.status(200).json({
        success: true,
        message: 'Product removed from cart as quantity was set to 0',
        data: {
          items: populatedCart.items,
          totalItems: populatedCart.totalItems,
          subtotal: populatedCart.subtotal,
        },
      });
    }

    const cartItem = cart.items[itemIndex];
    const product = await Product.findById(cartItem.product);

    if (!product) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return res.status(404).json({
        success: false,
        message: 'Product no longer exists. Removed from cart.',
      });
    }

    let maxStock = product.stock;
    if (cartItem.variant?.variantId && product.variants) {
      const v = product.variants.id(cartItem.variant.variantId);
      if (v) maxStock = v.stock;
    }

    if (qty > maxStock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${maxStock} available)`,
      });
    }

    cart.items[itemIndex].quantity = qty;
    await cart.save();

    const populatedCart = await getPopulatedCart(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Cart item quantity updated successfully',
      data: {
        items: populatedCart.items,
        totalItems: populatedCart.totalItems,
        subtotal: populatedCart.subtotal,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove product / variant from cart
 * @route   DELETE /api/cart/:productId
 * @access  Private
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { variantId, sku } = req.query;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => {
      if (item._id.toString() === productId) return false;
      if (item.product.toString() === productId) {
        if (variantId) return item.variant?.variantId?.toString() !== variantId;
        if (sku) return item.variant?.sku !== sku;
        return false;
      }
      return true;
    });

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
      });
    }

    await cart.save();

    const populatedCart = await getPopulatedCart(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Product removed from cart successfully',
      data: {
        items: populatedCart.items,
        totalItems: populatedCart.totalItems,
        subtotal: populatedCart.subtotal,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear entire shopping cart
 * @route   DELETE /api/cart/clear
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Shopping cart cleared successfully',
      data: {
        items: [],
        totalItems: 0,
        subtotal: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
};
