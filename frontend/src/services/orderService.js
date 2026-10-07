import api from './api';

export const orderService = {
  // Place an order (from current cart or direct items)
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get logged-in user order history
  getMyOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // Get single order details
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Cancel order (eligible in Placed/Confirmed state)
  cancelOrder: async (id) => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },

  // Simulate payment completion
  payOrder: async (id, paymentMethod) => {
    const response = await api.put(`/orders/${id}/pay`, { paymentMethod });
    return response.data;
  },
};

export default orderService;
