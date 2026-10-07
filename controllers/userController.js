const User = require('../models/userModel');
const Order = require('../models/orderModel');
const mongoose = require('mongoose');

/**
 * @desc    Get logged-in user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update logged-in user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update basic fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.address) {
      user.address = {
        ...user.address.toObject(),
        ...req.body.address,
      };
    }

    // Update password if provided
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long',
        });
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (with search, filters, order aggregates, and pagination)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Search by Name, Email, Phone, or MongoDB ObjectId
    if (req.query.search) {
      const search = req.query.search.trim();
      const orConditions = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];

      if (mongoose.Types.ObjectId.isValid(search)) {
        orConditions.push({ _id: new mongoose.Types.ObjectId(search) });
      }

      query.$or = orConditions;
    }

    // Filter by Role
    if (req.query.role && ['customer', 'admin'].includes(req.query.role.toLowerCase())) {
      query.role = req.query.role.toLowerCase();
    }

    // Filter by Status (active, blocked, inactive)
    if (req.query.status && ['active', 'blocked', 'inactive'].includes(req.query.status.toLowerCase())) {
      query.status = req.query.status.toLowerCase();
    }

    // Filter by Registration Date
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    } else if (req.query.period) {
      const now = new Date();
      if (req.query.period === 'today') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        query.createdAt = { $gte: startOfDay };
      } else if (req.query.period === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        query.createdAt = { $gte: startOfWeek };
      } else if (req.query.period === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        query.createdAt = { $gte: startOfMonth };
      } else if (req.query.period === 'year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        query.createdAt = { $gte: startOfYear };
      }
    }

    const total = await User.countDocuments(query);
    const rawUsers = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Dynamically compute Total Orders & Total Spent for current page users
    const userIds = rawUsers.map((u) => u._id);
    const orderAggregates = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [{ $ne: ['$orderStatus', 'Cancelled'] }, '$totalAmount', 0],
            },
          },
        },
      },
    ]);

    const orderStatsMap = {};
    orderAggregates.forEach((item) => {
      orderStatsMap[item._id.toString()] = {
        totalOrders: item.totalOrders || 0,
        totalSpent: item.totalSpent || 0,
      };
    });

    const usersWithStats = rawUsers.map((u) => {
      const stats = orderStatsMap[u._id.toString()] || { totalOrders: 0, totalSpent: 0 };
      return {
        ...u,
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
      };
    });

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      data: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user management statistical summary
 * @route   GET /api/users/stats
 * @access  Private/Admin
 */
const getUserStats = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      inactiveUsers,
      customers,
      admins,
      newUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: { $ne: 'blocked' } }),
      User.countDocuments({ status: 'blocked' }),
      User.countDocuments({ status: 'inactive' }),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: {
        totalUsers,
        activeUsers,
        blockedUsers,
        inactiveUsers,
        customers,
        admins,
        newUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user by ID (with order history and activity)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Dynamic orders for this user
    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === 'Cancelled').length;
    const totalSpent = orders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Dynamic Activity records from actual database events
    const activity = [];
    if (user.createdAt) {
      activity.push({
        action: 'User registered',
        description: `Account created with role: ${user.role}`,
        timestamp: user.createdAt,
      });
    }
    if (user.lastLogin) {
      activity.push({
        action: 'User logged in',
        description: 'Successful authenticated login session',
        timestamp: user.lastLogin,
      });
    }
    if (user.updatedAt && user.updatedAt > user.createdAt) {
      activity.push({
        action: 'Profile updated',
        description: 'Account profile details updated in system',
        timestamp: user.updatedAt,
      });
    }

    // Add recent order activities
    orders.slice(0, 5).forEach((ord) => {
      activity.push({
        action: ord.orderStatus === 'Cancelled' ? 'Order cancelled' : 'Order placed',
        description: `Order #${ord._id.toString().slice(-8).toUpperCase()} for ₹${ord.totalAmount?.toLocaleString('en-IN')}`,
        timestamp: ord.createdAt,
      });
    });

    activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        ...user,
        orderStats: {
          totalOrders,
          completedOrders,
          cancelledOrders,
          totalSpent,
        },
        recentOrders: orders.slice(0, 10),
        activity,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders for a specific user
 * @route   GET /api/users/:id/orders
 * @access  Private/Admin
 */
const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

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
 * @desc    Update user by ID (role, details, status)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) {
      // Check if email already taken by someone else
      const existing = await User.findOne({ email: req.body.email, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another user already exists with this email address',
        });
      }
      user.email = req.body.email;
    }
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.address) {
      user.address = {
        ...user.address.toObject(),
        ...req.body.address,
      };
    }
    if (req.body.role) {
      if (!['customer', 'admin'].includes(req.body.role)) {
        return res.status(400).json({
          success: false,
          message: 'Role must be customer or admin',
        });
      }
      user.role = req.body.role;
    }
    if (req.body.status) {
      if (!['active', 'blocked', 'inactive'].includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be active, blocked, or inactive',
        });
      }
      user.status = req.body.status;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user account status (Activate / Block / Inactive)
 * @route   PUT /api/users/:id/status
 * @access  Private/Admin
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !['active', 'blocked', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status required: active, blocked, or inactive',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent blocking self
    if (user._id.toString() === req.user._id.toString() && status === 'blocked') {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot block their own account',
      });
    }

    user.status = status;
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: status === 'blocked' ? 'User blocked successfully' : 'User status updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user by ID
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot delete their own account',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new user (Admin)
 * @route   POST /api/users
 * @access  Private/Admin
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, role, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      address: address || {},
      role: role && ['customer', 'admin'].includes(role) ? role : 'customer',
      status: status && ['active', 'blocked', 'inactive'].includes(status) ? status : 'active',
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's wishlist
 * @route   GET /api/users/wishlist
 * @access  Private
 */
const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price image brand rating stock isAvailable category',
      populate: { path: 'category', select: 'name' },
    });

    res.status(200).json({
      success: true,
      data: user?.wishlist || [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle item in user's wishlist
 * @route   POST /api/users/wishlist/:productId
 * @access  Private
 */
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.wishlist) user.wishlist = [];

    const index = user.wishlist.findIndex((id) => id.toString() === productId);
    let added = false;

    if (index > -1) {
      user.wishlist.splice(index, 1);
      added = false;
    } else {
      user.wishlist.push(productId);
      added = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      added,
      message: added ? 'Product added to wishlist' : 'Product removed from wishlist',
      data: user.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserStats,
  getUserById,
  getUserOrders,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getWishlist,
  toggleWishlist,
};
