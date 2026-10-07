const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const { sendOrderConfirmationEmail } = require('../utils/sendEmail');

/**
 * @desc    Create a new order from current cart (or provided items)
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const {
      shippingAddress,
      paymentMethod,
      items: directItems,
      couponCode,
      discountAmount,
    } = req.body;

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide a complete shipping address (street, city, state, postalCode)',
      });
    }

    // Validate payment method
    const validPaymentMethods = ['Cash on Delivery', 'UPI', 'Card'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Please specify a valid paymentMethod: ${validPaymentMethods.join(', ')}`,
      });
    }

    let orderItems = [];

    // Check if items were provided directly in body or pull from user's cart
    if (directItems && Array.isArray(directItems) && directItems.length > 0) {
      for (const item of directItems) {
        const product = await Product.findById(item.product || item.productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product ${item.product || item.productId} not found`,
          });
        }

        let variantInfo = {};
        let price = product.price;

        if (item.variantId && product.variants) {
          const v = product.variants.id(item.variantId);
          if (v) {
            variantInfo = {
              variantId: v._id,
              sku: v.sku,
              title: v.title,
              color: v.color,
              size: v.size,
              storage: v.storage,
            };
            if (v.price !== undefined) price = v.price;
          }
        }

        orderItems.push({
          product: product._id,
          variant: variantInfo,
          name: product.name,
          price,
          quantity: item.quantity || 1,
          image: product.image,
        });
      }
    } else {
      // Pull from customer cart
      const cart = await Cart.findOne({ user: req.user._id }).populate(
        'items.product'
      );

      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Your cart is empty. Add products to cart before placing an order.',
        });
      }

      orderItems = cart.items.map((item) => ({
        product: item.product._id,
        variant: item.variant || {},
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        image: item.product.image,
      }));
    }

    // 1. Check stock availability for all items (checking variants when present)
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product '${item.name}' is no longer available`,
        });
      }

      if (item.variant?.variantId && product.variants) {
        const v = product.variants.id(item.variant.variantId);
        if (!v) {
          return res.status(404).json({
            success: false,
            message: `Selected variant for '${product.name}' is no longer available`,
          });
        }
        if (v.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for '${product.name}' (${v.title || v.sku || 'variant'}). Requested: ${item.quantity}, Available: ${v.stock}`,
          });
        }
      } else {
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for '${product.name}'. Requested: ${item.quantity}, Available: ${product.stock}`,
          });
        }
      }
    }

    // 2. Calculate total amount and apply coupon discount if valid
    const rawSubtotal = Number(
      orderItems
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
        .toFixed(2)
    );
    const validDiscount = Number(discountAmount) > 0 ? Math.min(Number(discountAmount), rawSubtotal) : 0;
    const totalAmount = Number(Math.max(0, rawSubtotal - validDiscount).toFixed(2));

    // 3. Deduct stock for each product and variant
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (item.variant?.variantId && product.variants) {
        const v = product.variants.id(item.variant.variantId);
        if (v) {
          v.stock -= item.quantity;
          if (v.stock <= 0) {
            v.stock = 0;
            v.isAvailable = false;
          }
        }
      }

      product.stock -= item.quantity;
      if (product.stock <= 0) {
        product.stock = 0;
        product.isAvailable = false;
      }
      await product.save();
    }

    // 4. Handle Simulated Payment
    let paymentStatus = 'Pending';
    let paymentDetails = {};

    if (paymentMethod === 'Card' || paymentMethod === 'UPI') {
      paymentStatus = 'Completed';
      paymentDetails = {
        transactionId: `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        paidAt: new Date(),
      };
    }

    // 5. Create Order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'India',
        phone: shippingAddress.phone || req.user.phone || '',
      },
      paymentMethod,
      paymentStatus,
      orderStatus: 'Placed',
      totalAmount,
      couponCode: couponCode || '',
      discountAmount: validDiscount,
      paymentDetails,
    });

    // 6. Clear user cart if order was placed
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } }
    );

    // 7. Dispatch Order Confirmation Email asynchronously
    sendOrderConfirmationEmail(order, req.user).catch((err) =>
      console.error('⚠️ Order confirmation email dispatch error:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in user's orders
 * @route   GET /api/orders
 * @access  Private
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email phone'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Ensure order belongs to logged-in user OR user is admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an order (restores stock for products and variants)
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check authorization
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }

    // Check if order can be cancelled
    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled',
      });
    }

    if (['Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order that has already reached status '${order.orderStatus}'`,
      });
    }

    // Restore stock for all products and variants in the order
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        if (item.variant?.variantId && product.variants) {
          const v = product.variants.id(item.variant.variantId);
          if (v) {
            v.stock += item.quantity;
            v.isAvailable = true;
          }
        }
        product.stock += item.quantity;
        product.isAvailable = true;
        await product.save();
      }
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and product/variant stock restored',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Simulate payment for pending order
 * @route   PUT /api/orders/:id/pay
 * @access  Private
 */
const simulatePayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this order',
      });
    }

    if (order.paymentStatus === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Order payment has already been completed',
      });
    }

    order.paymentStatus = 'Completed';
    order.paymentDetails = {
      transactionId: `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      paidAt: new Date(),
    };

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment simulated and processed successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  simulatePayment,
};
