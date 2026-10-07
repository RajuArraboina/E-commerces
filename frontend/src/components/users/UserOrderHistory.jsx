import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ExternalLink } from 'lucide-react';

const UserOrderHistory = ({ orders = [] }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="order-history-empty card">
        <Package size={36} className="text-muted" />
        <h4>No Orders Placed Yet</h4>
        <p className="text-muted">This user has not placed any orders in the store.</p>
      </div>
    );
  }

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'badge-success';
      case 'Cancelled':
        return 'badge-danger';
      case 'Shipped':
      case 'Out for Delivery':
        return 'badge-info';
      case 'Processing':
      case 'Confirmed':
        return 'badge-primary';
      case 'Placed':
      default:
        return 'badge-warning';
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'text-success';
      case 'Failed':
        return 'text-danger';
      case 'Pending':
      default:
        return 'text-warning';
    }
  };

  return (
    <div className="card user-order-history-card">
      <div className="order-history-header">
        <h3 className="section-card-title" style={{ marginBottom: 0 }}>
          Order History ({orders.length})
        </h3>
        <span className="text-muted text-sm">Real-time synchronized orders</span>
      </div>

      <div className="table-responsive">
        <table className="admin-table user-orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Order Date</th>
              <th>Products</th>
              <th>Total Amount</th>
              <th>Payment Status</th>
              <th>Order Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const itemsCount = order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || order.items?.length || 0;
              const productNames = order.items?.map((it) => it.name).join(', ') || 'Item';

              return (
                <tr key={order._id}>
                  {/* Order ID */}
                  <td>
                    <code>#{order._id.slice(-8).toUpperCase()}</code>
                  </td>

                  {/* Order Date */}
                  <td className="text-muted text-nowrap">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>

                  {/* Products */}
                  <td className="order-products-cell">
                    <span className="products-summary-title" title={productNames}>
                      {productNames.length > 40 ? productNames.substring(0, 40) + '...' : productNames}
                    </span>
                    <span className="text-muted text-xs block">
                      {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                    </span>
                  </td>

                  {/* Total Amount */}
                  <td className="font-bold text-nowrap">
                    ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                  </td>

                  {/* Payment Status */}
                  <td>
                    <span className={`font-semibold ${getPaymentStatusBadge(order.paymentStatus)}`}>
                      {order.paymentStatus || 'Pending'}
                    </span>
                  </td>

                  {/* Order Status */}
                  <td>
                    <span className={`badge ${getOrderStatusBadge(order.orderStatus)}`}>
                      {order.orderStatus || 'Placed'}
                    </span>
                  </td>

                  {/* Action Link */}
                  <td className="text-right">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="btn btn-outline btn-xs btn-open-order"
                      title="Open complete order fulfillment details"
                    >
                      <span>View Order</span>
                      <ExternalLink size={13} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserOrderHistory;
