import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import Pagination from '../../components/Pagination';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { ExternalLink, Check } from 'lucide-react';

const STATUS_OPTIONS = [
  'Placed',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Dynamic fetch all orders from MongoDB: GET /api/admin/orders
      const res = await adminService.getOrders({
        orderStatus: statusFilter,
        paymentStatus: paymentFilter,
        page,
        limit: 10,
      });

      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
        setTotal(res.total || res.data.length);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders from MongoDB');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, paymentFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Update Order Status via backend API: PUT /api/admin/orders/:id/status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await adminService.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        setSuccessId(orderId);
        setToastMsg(`Order status updated to '${newStatus}'!`);
        setTimeout(() => {
          setSuccessId(null);
          setToastMsg('');
        }, 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status in backend');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-page">
      {toastMsg && (
        <div className="status-toast">
          <Check size={18} />
          <span>{toastMsg}</span>
        </div>
      )}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Order Management</h1>
          <p className="admin-subtitle">
            View all {total} customer orders, review payment states, and update fulfillment lifecycles
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchOrders} />}

      {/* Filter Bar */}
      <div className="admin-filter-bar card">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="form-control category-select"
        >
          <option value="">All Order Statuses</option>
          {STATUS_OPTIONS.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value);
            setPage(1);
          }}
          className="form-control category-select"
        >
          <option value="">All Payment Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <Loading message="Loading orders from MongoDB..." />
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Products</th>
                    <th>Total Amount</th>
                    <th>Payment Method</th>
                    <th>Payment Status</th>
                    <th>Order Status</th>
                    <th>Order Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center" style={{ padding: '30px' }}>
                        No orders found in MongoDB matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord._id}>
                        {/* 1. Order ID */}
                        <td>
                          <code>#{ord._id.slice(-8).toUpperCase()}</code>
                        </td>

                        {/* 2. Customer */}
                        <td>
                          <div className="customer-cell">
                            <strong>{ord.user?.name || 'Customer'}</strong>
                            <small className="text-muted block">{ord.user?.email}</small>
                          </div>
                        </td>

                        {/* 3. Products */}
                        <td>
                          <div style={{ maxWidth: '220px' }}>
                            {ord.items && ord.items.length > 0 ? (
                              <>
                                <strong style={{ fontSize: '0.9rem' }}>
                                  {ord.items[0].name}
                                </strong>
                                {ord.items.length > 1 && (
                                  <small className="text-muted block">
                                    + {ord.items.length - 1} more product(s)
                                  </small>
                                )}
                              </>
                            ) : (
                              <span className="text-muted">No items</span>
                            )}
                          </div>
                        </td>

                        {/* 4. Total Amount */}
                        <td>
                          <strong>₹{Number(ord.totalAmount).toLocaleString('en-IN')}</strong>
                        </td>

                        {/* 5. Payment Method */}
                        <td>
                          <span className="badge badge-info">{ord.paymentMethod || 'COD'}</span>
                        </td>

                        {/* 6. Payment Status */}
                        <td>
                          <span
                            className={`badge ${ord.paymentStatus === 'Completed' ? 'badge-success' : ord.paymentStatus === 'Failed' ? 'badge-danger' : 'badge-warning'}`}
                          >
                            {ord.paymentStatus}
                          </span>
                        </td>

                        {/* 7. Order Status */}
                        <td>
                          <div className="status-select-wrap">
                            <select
                              value={ord.orderStatus}
                              disabled={updatingId === ord._id}
                              onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                              className="form-control status-select"
                            >
                              {STATUS_OPTIONS.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                            {successId === ord._id && (
                              <Check size={16} className="text-success inline-check" />
                            )}
                          </div>
                        </td>

                        {/* 8. Order Date */}
                        <td>
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Action: Link to /admin/orders/:id */}
                        <td>
                          <Link
                            to={`/admin/orders/${ord._id}`}
                            className="btn btn-outline btn-xs"
                            title="View Full Order Details"
                          >
                            <ExternalLink size={14} />
                            <span>Details</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
