import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function Dashboard({ setActiveTab }) {
    const [stats, setStats] = useState({
        revenue: 0,
        ordersCount: 0,
        productsCount: 0,
        lowStockCount: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchDashboardData() {
            setLoading(true);
            try {
                const [products, customers, orders] = await Promise.all([
                    api.products.list(),
                    api.customers.list(),
                    api.orders.list()
                ]);

                // Compute Stats
                const revenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
                const lowStock = products.filter(p => p.stock <= 5);

                setStats({
                    revenue,
                    ordersCount: orders.length,
                    productsCount: products.length,
                    lowStockCount: lowStock.length
                });

                // Get recent 5 orders
                setRecentOrders(orders.slice(0, 5));

                // Get low stock items
                setLowStockItems(lowStock.slice(0, 5));
                setError(null);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError("Failed to load dashboard data. Please make sure the backend API is running.");
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">⏳</div>
                <h3 className="empty-state-title">Loading Analytics...</h3>
                <p>Retrieving real-time inventory and order directories.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="header-container">
                <div>
                    <h1 className="header-title">Enterprise Dashboard</h1>
                    <p className="header-subtitle">Real-time overview of inventory levels, customer database, and orders.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setActiveTab('orders')}>
                    Create New Order
                </button>
            </div>

            {error && (
                <div className="alert alert-danger">
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* Metrics cards */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Total Revenue</span>
                        <div className="metric-icon-bg">💰</div>
                    </div>
                    <div className="metric-value">${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className="metric-footer">Accumulated order sales</div>
                </div>

                <div className="metric-card success">
                    <div className="metric-header">
                        <span className="metric-title">Orders Placed</span>
                        <div className="metric-icon-bg">📦</div>
                    </div>
                    <div className="metric-value">{stats.ordersCount}</div>
                    <div className="metric-footer">Total processed transactions</div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Active Products</span>
                        <div className="metric-icon-bg">🏷️</div>
                    </div>
                    <div className="metric-value">{stats.productsCount}</div>
                    <div className="metric-footer">Unique SKUs in catalog</div>
                </div>

                <div className={`metric-card ${stats.lowStockCount > 0 ? 'danger' : 'success'}`}>
                    <div className="metric-header">
                        <span className="metric-title">Low Stock Alerts</span>
                        <div className="metric-icon-bg">🚨</div>
                    </div>
                    <div className="metric-value">{stats.lowStockCount}</div>
                    <div className="metric-footer">{stats.lowStockCount > 0 ? "Reorder recommended" : "All levels healthy"}</div>
                </div>
            </div>

            <div className="order-creator-grid">
                {/* Recent Orders Card */}
                <div className="glass-card" style={{ marginBottom: 0 }}>
                    <div className="card-title-bar">
                        <h3>Recent Transactions</h3>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setActiveTab('orders')}>
                            View All
                        </button>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div className="empty-state" style={{ padding: '2rem' }}>
                            <p>No orders processed yet.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order.id}>
                                            <td><strong>#{order.id}</strong></td>
                                            <td>{order.customer.name}</td>
                                            <td>
                                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                            </td>
                                            <td>${order.total_amount.toFixed(2)}</td>
                                            <td>
                                                <span className="pill pill-success">
                                                    ● {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Low Stock Warning List Card */}
                <div className="glass-card" style={{ marginBottom: 0 }}>
                    <div className="card-title-bar">
                        <h3>Restock Radar</h3>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setActiveTab('products')}>
                            Manage Catalog
                        </button>
                    </div>
                    {lowStockItems.length === 0 ? (
                        <div className="empty-state" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '2rem' }}>🛡️</span>
                            <p style={{ color: 'var(--success)' }}>All products have healthy stock levels.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {lowStockItems.map(item => (
                                <div key={item.id} style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    padding: '1rem', 
                                    backgroundColor: 'rgba(239, 68, 68, 0.05)', 
                                    border: '1px solid rgba(239, 68, 68, 0.15)',
                                    borderRadius: 'var(--border-radius-md)'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SKU: {item.sku}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={`pill ${item.stock === 0 ? 'pill-danger' : 'pill-warning'}`}>
                                            {item.stock} left
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
