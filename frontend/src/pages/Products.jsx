import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({ id: null, name: "", sku: "", price: "", stock: "" });
    const [formError, setFormError] = useState(null);

    async function loadProducts() {
        setLoading(true);
        try {
            const data = await api.products.list();
            setProducts(data);
            setError(null);
        } catch (err) {
            console.error("Failed to load products:", err);
            setError("Failed to load products. Please check if the API server is online.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProducts();
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

    const handleOpenCreateModal = () => {
        setIsEditing(false);
        setCurrentProduct({ id: null, name: "", sku: "", price: "", stock: "0" });
        setFormError(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (product) => {
        setIsEditing(true);
        setCurrentProduct({
            id: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price.toString(),
            stock: product.stock.toString()
        });
        setFormError(null);
        setModalOpen(true);
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            return;
        }

        try {
            await api.products.delete(id);
            showNotification("Product deleted successfully.");
            loadProducts();
        } catch (err) {
            showNotification(err.message, false);
        }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        setFormError(null);

        // Client-side validations
        if (!currentProduct.name.trim()) return setFormError("Product name is required.");
        if (!currentProduct.sku.trim()) return setFormError("Product SKU is required.");
        
        const priceNum = parseFloat(currentProduct.price);
        if (isNaN(priceNum) || priceNum <= 0) return setFormError("Price must be a number greater than 0.");
        
        const stockNum = parseInt(currentProduct.stock);
        if (isNaN(stockNum) || stockNum < 0) return setFormError("Stock cannot be negative.");

        const payload = {
            name: currentProduct.name.trim(),
            sku: currentProduct.sku.trim().toUpperCase(),
            price: priceNum,
            stock: stockNum
        };

        try {
            if (isEditing) {
                await api.products.update(currentProduct.id, payload);
                showNotification("Product catalog updated successfully.");
            } else {
                await api.products.create(payload);
                showNotification("Product registered in inventory.");
            }
            setModalOpen(false);
            loadProducts();
        } catch (err) {
            setFormError(err.message);
        }
    };

    // Filtered products list
    const filteredProducts = products.filter(product => {
        const query = search.toLowerCase();
        return product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query);
    });

    const getStockPill = (stock) => {
        if (stock === 0) return <span className="pill pill-danger">● Out of Stock</span>;
        if (stock <= 5) return <span className="pill pill-warning">● Low Stock ({stock})</span>;
        return <span className="pill pill-success">● In Stock ({stock})</span>;
    };

    return (
        <div>
            <div className="header-container">
                <div>
                    <h1 className="header-title">Product Catalog</h1>
                    <p className="header-subtitle">Manage items, stock counts, pricing, and specific product SKUs.</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                    Add Product
                </button>
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

            <div className="glass-card">
                {/* Search Bar */}
                <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
                    <input 
                        type="text" 
                        className="form-input" 
                        placeholder="🔍 Search products by name or SKU..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="empty-state" style={{ padding: '2rem' }}>
                        <p>Loading catalog items...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏷️</div>
                        <h3 className="empty-state-title">No products found</h3>
                        <p>{search ? "No matching records." : "Get started by adding your first product to the inventory."}</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Stock Level</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <tr key={product.id}>
                                        <td><strong>{product.sku}</strong></td>
                                        <td>{product.name}</td>
                                        <td>${product.price.toFixed(2)}</td>
                                        <td>{getStockPill(product.stock)}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button 
                                                className="btn btn-secondary" 
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem' }}
                                                onClick={() => handleOpenEditModal(product)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="btn btn-danger" 
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                onClick={() => handleDeleteProduct(product.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2 className="modal-title">{isEditing ? "Edit Product Information" : "Register New Product"}</h2>
                            <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
                        </div>
                        
                        <form onSubmit={handleSaveProduct}>
                            {formError && (
                                <div className="alert alert-danger" style={{ padding: '0.75rem', marginBottom: '1.25rem' }}>
                                    <span>⚠️</span> {formError}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Product Name</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="e.g. Mechanical Keyboard G90"
                                    value={currentProduct.name}
                                    onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Stock Keeping Unit (SKU)</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="e.g. KB-G90-BLK"
                                    style={{ textTransform: 'uppercase' }}
                                    value={currentProduct.sku}
                                    onChange={(e) => setCurrentProduct({...currentProduct, sku: e.target.value})}
                                    disabled={isEditing} // Block editing SKU for security/consistency in databases
                                />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'block' }}>
                                    * Unique alphanumeric identifier for inventory tracking. Cannot be modified after creation.
                                </span>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Price ($)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        className="form-input" 
                                        placeholder="0.00"
                                        value={currentProduct.price}
                                        onChange={(e) => setCurrentProduct({...currentProduct, price: e.target.value})}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Stock Quantity</label>
                                    <input 
                                        type="number" 
                                        className="form-input" 
                                        placeholder="0"
                                        value={currentProduct.stock}
                                        onChange={(e) => setCurrentProduct({...currentProduct, stock: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {isEditing ? "Save Changes" : "Create Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
