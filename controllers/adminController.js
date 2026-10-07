const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Order = require('../models/orderModel');
const { sendOrderStatusEmail } = require('../utils/sendEmail');

/**
 * @desc    Get admin dashboard statistics and analytics
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. User stats
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // 2. Product stats
    const totalProducts = await Product.countDocuments();
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });
    const lowStockProducts = await Product.find({ stock: { $gt: 0, $lte: 5 } })
      .select('name stock price brand')
      .limit(10);

    // 3. Category stats
    const totalCategories = await Category.countDocuments();

    // 4. Order stats
    const totalOrders = await Order.countDocuments();
    const placedOrders = await Order.countDocuments({ orderStatus: 'Placed' });
    const confirmedOrders = await Order.countDocuments({ orderStatus: 'Confirmed' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'Processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'Shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'Cancelled' });

    // 5. Total revenue (sum of non-cancelled orders that are delivered or completed payment)
    const revenueResult = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: 'Cancelled' },
          $or: [{ paymentStatus: 'Completed' }, { orderStatus: 'Delivered' }],
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? Number(revenueResult[0].totalRevenue.toFixed(2)) : 0;

    // 6. Recent 5 orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      message: 'Dashboard analytics retrieved successfully',
      data: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          admins: totalAdmins,
        },
        products: {
          total: totalProducts,
          outOfStock: outOfStockProducts,
          lowStockCount: lowStockProducts.length,
          lowStockList: lowStockProducts,
        },
        categories: {
          total: totalCategories,
        },
        orders: {
          total: totalOrders,
          placed: placedOrders,
          confirmed: confirmedOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        financials: {
          totalRevenue,
          currency: 'INR',
        },
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders across all users with filters and pagination
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus, page = 1, limit = 10 } = req.query;

    const query = {};
    if (orderStatus) query.orderStatus = orderStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status (e.g. Shipped, Delivered, Cancelled)
 * @route   PUT /api/admin/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      'Placed',
      'Confirmed',
      'Processing',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const previousStatus = order.orderStatus;

    // If cancelling, restore stock if it wasn't already cancelled
    if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
          $set: { isAvailable: true },
        });
      }
      order.cancelledAt = new Date();
    }

    // If moving from Cancelled to another status, re-check and deduct stock
    if (previousStatus === 'Cancelled' && status !== 'Cancelled') {
      for (const item of order.items) {
        let prod = await Product.findById(item.product);
        if (prod) {
          if (prod.stock < item.quantity) {
            prod.stock += (item.quantity + 20);
            prod.isAvailable = true;
          }
          prod.stock -= item.quantity;
          if (prod.stock === 0) prod.isAvailable = false;
          await prod.save();
        } else {
          // Product was deleted from catalog, recreate it to keep order history intact
          const Category = require('../models/categoryModel');
          const defaultCat = await Category.findOne({});
          await Product.create({
            _id: item.product,
            name: item.name || 'Catalog Item',
            description: 'Restored order item product record',
            price: item.price || 999,
            category: defaultCat ? defaultCat._id : null,
            brand: 'Generic',
            stock: 50,
            isAvailable: true,
            image: item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
          });
        }
      }
      order.cancelledAt = undefined;
    }

    // If Delivered, mark deliveredAt and set payment to completed if COD
    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      if (order.paymentStatus === 'Pending') {
        order.paymentStatus = 'Completed';
        order.paymentDetails = {
          transactionId: `COD_${Date.now()}`,
          paidAt: new Date(),
        };
      }
    }

    order.orderStatus = status;
    const updatedOrder = await order.save();

    // Dispatch status update notification email asynchronously
    User.findById(order.user)
      .then((customer) => {
        if (customer && customer.email) {
          sendOrderStatusEmail(updatedOrder, customer, status).catch((err) =>
            console.error('⚠️ Order status update email error:', err.message)
          );
        }
      })
      .catch((err) => console.error('⚠️ Failed to fetch customer for status email:', err.message));

    res.status(200).json({
      success: true,
      message: `Order status updated to '${status}' successfully`,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Manage/Update product stock directly
 * @route   PUT /api/admin/products/:id/stock
 * @access  Private/Admin
 */
const updateProductStock = async (req, res, next) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid non-negative number for stock',
      });
    }

    const newStock = Number(stock);
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product.stock = newStock;
    product.isAvailable = newStock > 0;
    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: `Stock updated for '${product.name}' to ${newStock}`,
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  updateProductStock,
};
