import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Order creation state
    const [activeView, setActiveView] = useState("list"); // "list" or "create"
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [cartItems, setCartItems] = useState([{ product_id: "", quantity: 1, stockWarning: false }]);
    const [formError, setFormError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Detail modal state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    async function loadData() {
        setLoading(true);
        try {
            const [ordersData, productsData, customersData] = await Promise.all([
                api.orders.list(),
                api.products.list(),
                api.customers.list()
            ]);
            setOrders(ordersData);
            setProducts(productsData);
            setCustomers(customersData);
            setError(null);
        } catch (err) {
            console.error("Failed to load order data:", err);
            setError("Failed to load orders. Please make sure the API server is online.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const showNotification = (msg, isSuccess = true) => {
        if (isSuccess) {
            setSuccessMsg(msg);
            setTimeout(() => setSuccessMsg(null), 4000);
        } else {
            setError(msg);
            setTimeout(() => setError(null), 5000);
        }
    };

    // Calculate live totals for the new order cart
    const calculateCartSummary = () => {
        let itemCount = 0;
        let totalVal = 0;
        
        cartItems.forEach(item => {
            if (item.product_id) {
                const prod = products.find(p => p.id === parseInt(item.product_id));
                if (prod) {
                    itemCount += item.quantity;
                    totalVal += prod.price * item.quantity;
                }
            }
        });

        return { itemCount, totalVal };
    };

    // Handle cart item updates & stock checking
    const handleCartItemChange = (index, field, value) => {
        const newCartItems = [...cartItems];
        newCartItems[index][field] = value;

        // Check stock availability live for warnings
        if (field === "product_id" || field === "quantity") {
            const prodId = newCartItems[index].product_id;
            const qty = parseInt(newCartItems[index].quantity) || 0;
            
            if (prodId) {
                const prod = products.find(p => p.id === parseInt(prodId));
                if (prod) {
                    // Business Rule Warning: Check if requested exceeds active stock
                    newCartItems[index].stockWarning = prod.stock < qty;
                }
            } else {
                newCartItems[index].stockWarning = false;
            }
        }

        setCartItems(newCartItems);
    };

    const addCartItem = () => {
        setCartItems([...cartItems, { product_id: "", quantity: 1, stockWarning: false }]);
    };

    const removeCartItem = (index) => {
        if (cartItems.length === 1) return;
        const newCartItems = cartItems.filter((_, i) => i !== index);
        setCartItems(newCartItems);
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        setFormError(null);

        if (!selectedCustomerId) {
            return setFormError("Please select a customer.");
        }

        // Validate items
        const itemsPayload = [];
        let hasValidationIssues = false;

        for (let i = 0; i < cartItems.length; i++) {
            const item = cartItems[i];
            if (!item.product_id) {
                setFormError(`Item #${i + 1} has no product selected.`);
                hasValidationIssues = true;
                break;
            }

            const qty = parseInt(item.quantity);
            if (isNaN(qty) || qty <= 0) {
                setFormError(`Item #${i + 1} quantity must be greater than 0.`);
                hasValidationIssues = true;
                break;
            }

            // Double check local warning
            const prod = products.find(p => p.id === parseInt(item.product_id));
            if (prod && prod.stock < qty) {
                setFormError(`Insufficient stock for '${prod.name}'. Available: ${prod.stock}, Requested: ${qty}. Please adjust before ordering.`);
                hasValidationIssues = true;
                break;
            }

            itemsPayload.push({
                product_id: parseInt(item.product_id),
                quantity: qty
            });
        }

        if (hasValidationIssues) return;

        setIsSubmitting(true);
        try {
            const payload = {
                customer_id: parseInt(selectedCustomerId),
                items: itemsPayload
            };

            await api.orders.create(payload);
            showNotification("Order placed successfully! Inventory updated.");
            
            // Reset state
            setSelectedCustomerId("");
            setCartItems([{ product_id: "", quantity: 1, stockWarning: false }]);
            setActiveView("list");
            loadData();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDetailModal = (order) => {
        setSelectedOrder(order);
        setDetailModalOpen(true);
    };

    const { itemCount, totalVal } = calculateCartSummary();

    return (
        <div>
            <div className="header-container">
                <div>
                    <h1 className="header-title">Orders Registry</h1>
                    <p className="header-subtitle">Create new invoices, validate transaction stocks, and view order receipts.</p>
                </div>
                {activeView === "list" ? (
                    <button 
                        className="btn btn-primary" 
                        onClick={() => {
                            if (customers.length === 0) {
                                showNotification("You need to register at least one customer first!", false);
                            } else if (products.length === 0) {
                                showNotification("You need to register at least one product in inventory first!", false);
                            } else {
                                setActiveView("create");
                            }
                        }}
                    >
                        Create New Order
                    </button>
                ) : (
                    <button className="btn btn-secondary" onClick={() => setActiveView("list")}>
                        Back to Registry
                    </button>
                )}
            </div>

            {successMsg && (
                <div className="alert alert-success">
                    <span>✅</span> {successMsg}
                </div>
            )}

            {error && (
                <div className="alert alert-danger">
                    <span>⚠️</span> {error}
                </div>
            )}

            {activeView === "list" ? (
                /* Orders Log List */
                <div className="glass-card">
                    {loading ? (
                        <div className="empty-state" style={{ padding: '2rem' }}>
                            <p>Retrieving transaction journals...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📦</div>
                            <h3 className="empty-state-title">No orders processed yet</h3>
                            <p>Submit orders using the Creator panel to decrement inventory and log sales.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date & Time</th>
                                        <th>Customer</th>
                                        <th>Items Ordered</th>
                                        <th>Total Invoice</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id}>
                                            <td><strong>#{order.id}</strong></td>
                                            <td>{new Date(order.created_at).toLocaleString()}</td>
                                            <td>
                                                <div>{order.customer.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customer.email}</div>
                                            </td>
                                            <td>
                                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                            </td>
                                            <td><strong>${order.total_amount.toFixed(2)}</strong></td>
                                            <td>
                                                <span className="pill pill-success">
                                                    ● {order.status}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button 
                                                    className="btn btn-secondary" 
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                    onClick={() => handleOpenDetailModal(order)}
                                                >
                                                    Receipt Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                /* Beautiful Split Order Creator Page */
                <form onSubmit={handleCreateOrder}>
                    <div className="order-creator-grid">
                        
                        {/* Left Column: Item Selector */}
                        <div className="creator-panel">
                            <div className="glass-card" style={{ marginBottom: 0 }}>
                                <div className="card-title-bar">
                                    <h3>Order Line Items</h3>
                                    <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={addCartItem}>
                                        + Add Item Row
                                    </button>
                                </div>

                                {formError && (
                                    <div className="alert alert-danger" style={{ padding: '0.75rem', marginBottom: '1.25rem' }}>
                                        <span>⚠️</span> {formError}
                                    </div>
                                )}

                                {cartItems.map((item, index) => {
                                    const selectedProduct = products.find(p => p.id === parseInt(item.product_id));
                                    return (
                                        <div key={index} className="cart-item-row" style={{ borderColor: item.stockWarning ? 'var(--danger)' : 'var(--card-border)' }}>
                                            <div className="cart-item-select">
                                                <label className="form-label">Select Product</label>
                                                <select 
                                                    className="form-input"
                                                    value={item.product_id}
                                                    onChange={(e) => handleCartItemChange(index, "product_id", e.target.value)}
                                                >
                                                    <option value="">-- Choose Item --</option>
                                                    {products.map(prod => (
                                                        <option key={prod.id} value={prod.id}>
                                                            {prod.name} (SKU: {prod.sku}) - ${prod.price.toFixed(2)} [Stock: {prod.stock}]
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="cart-item-quantity">
                                                <label className="form-label">Qty</label>
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    className="form-input"
                                                    value={item.quantity}
                                                    onChange={(e) => handleCartItemChange(index, "quantity", parseInt(e.target.value) || "")}
                                                />
                                            </div>

                                            <div style={{ width: '100px', display: 'flex', flexDirection: 'column' }}>
                                                <label className="form-label" style={{ whiteSpace: 'nowrap' }}>Subtotal</label>
                                                <div style={{ height: '42px', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                                                    ${selectedProduct ? (selectedProduct.price * (parseInt(item.quantity) || 0)).toFixed(2) : "0.00"}
                                                </div>
                                            </div>

                                            <button 
                                                type="button" 
                                                className="btn btn-danger" 
                                                style={{ height: '42px', padding: '0.5rem 0.75rem' }} 
                                                onClick={() => removeCartItem(index)}
                                                disabled={cartItems.length === 1}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Column: Checkout & Customer Summary */}
                        <div className="creator-panel">
                            <div className="glass-card" style={{ marginBottom: 0 }}>
                                <div className="card-title-bar">
                                    <h3>Order Check-out</h3>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Client / Customer</label>
                                    <select 
                                        className="form-input"
                                        value={selectedCustomerId}
                                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                                    >
                                        <option value="">-- Select customer profile --</option>
                                        {customers.map(cust => (
                                            <option key={cust.id} value={cust.id}>
                                                {cust.name} ({cust.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ marginTop: '2rem' }}>
                                    <div className="summary-row">
                                        <span className="summary-label">Items Count:</span>
                                        <span className="summary-value">{itemCount} items</span>
                                    </div>
                                    <div className="summary-row">
                                        <span className="summary-label">Status:</span>
                                        <span className="pill pill-primary">PRE-VALIDATED</span>
                                    </div>
                                    <div className="summary-total">
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>Invoice Total</div>
                                        <div>${totalVal.toFixed(2)}</div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '2rem' }}>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary" 
                                        style={{ width: '100%', padding: '1rem' }}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Locking Stock & Creating..." : "Finalize Order"}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        style={{ width: '100%', padding: '0.8rem', marginTop: '0.75rem' }}
                                        onClick={() => setActiveView("list")}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            )}

            {/* Receipt detail popup modal */}
            {detailModalOpen && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '650px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title" style={{ fontFamily: 'var(--font-display)' }}>Receipt Invoice #{selectedOrder.id}</h2>
                            <button className="modal-close" onClick={() => setDetailModalOpen(false)}>×</button>
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
                            <div>
                                <strong>Date Processed:</strong><br />
                                {new Date(selectedOrder.created_at).toLocaleString()}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <strong>Status:</strong><br />
                                <span className="pill pill-success" style={{ marginTop: '0.25rem' }}>● {selectedOrder.status}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--card-border)' }}>
                            <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Customer Details</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.9rem', gap: '0.5rem' }}>
                                <div><strong>Name:</strong> {selectedOrder.customer.name}</div>
                                <div><strong>ID:</strong> #{selectedOrder.customer_id}</div>
                                <div><strong>Email:</strong> {selectedOrder.customer.email}</div>
                                <div><strong>Phone:</strong> {selectedOrder.customer.phone || 'N/A'}</div>
                            </div>
                        </div>

                        <h4 style={{ color: 'var(--text-main)', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>Itemized Receipt</h4>
                        <div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Product SKU</th>
                                        <th>Product Name</th>
                                        <th>Qty</th>
                                        <th>Unit Price</th>
                                        <th style={{ textAlign: 'right' }}>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items.map(item => (
                                        <tr key={item.id}>
                                            <td><strong>{item.product?.sku || 'N/A'}</strong></td>
                                            <td>{item.product?.name || 'Deleted Product'}</td>
                                            <td>{item.quantity}</td>
                                            <td>${item.unit_price.toFixed(2)}</td>
                                            <td style={{ textAlign: 'right' }}><strong>${(item.quantity * item.unit_price).toFixed(2)}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginTop: '2rem', 
                            borderTop: '2px solid var(--card-border)', 
                            paddingTop: '1.25rem' 
                        }}>
                            <div style={{ color: 'var(--text-muted)' }}>Final Billing Amount</div>
                            <div style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--success)' }}>
                                ${selectedOrder.total_amount.toFixed(2)}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setDetailModalOpen(false)}>
                                Close Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
