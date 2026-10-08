const mongoose = require('mongoose');

const cartItemVariantSchema = new mongoose.Schema(
  {
    variantId: { type: mongoose.Schema.Types.ObjectId },
    sku: { type: String, default: '' },
    title: { type: String, default: '' },
    color: { type: String, default: '' },
    size: { type: String, default: '' },
    storage: { type: String, default: '' },
  },
  { _id: false }
);

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Cart item must reference a product'],
    },
    variant: {
      type: cartItemVariantSchema,
      default: () => ({}),
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cart must belong to a user'],
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property to calculate subtotal dynamically
cartSchema.virtual('subtotal').get(function () {
  if (!this.items || this.items.length === 0) return 0;
  return Number(
    this.items
      .reduce((acc, item) => acc + item.quantity * item.price, 0)
      .toFixed(2)
  );
});

// Virtual property to calculate total items count
cartSchema.virtual('totalItems').get(function () {
  if (!this.items || this.items.length === 0) return 0;
  return this.items.reduce((acc, item) => acc + item.quantity, 0);
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
