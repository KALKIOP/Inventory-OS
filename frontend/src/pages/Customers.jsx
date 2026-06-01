import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState({ id: null, name: "", email: "", phone: "" });
    const [formError, setFormError] = useState(null);

    async function loadCustomers() {
        setLoading(true);
        try {
            const data = await api.customers.list();
            setCustomers(data);
            setError(null);
        } catch (err) {
            console.error("Failed to load customers:", err);
            setError("Failed to load customers. Please check if the API server is online.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCustomers();
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
        setCurrentCustomer({ id: null, name: "", email: "", phone: "" });
        setFormError(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (customer) => {
        setIsEditing(true);
        setCurrentCustomer({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone || ""
        });
        setFormError(null);
        setModalOpen(true);
    };

    const handleDeleteCustomer = async (id) => {
        if (!window.confirm("Are you sure you want to remove this customer profile? This will delete all associated order history!")) {
            return;
        }

        try {
            await api.customers.delete(id);
            showNotification("Customer profile deleted successfully.");
            loadCustomers();
        } catch (err) {
            showNotification(err.message, false);
        }
    };

    const handleSaveCustomer = async (e) => {
        e.preventDefault();
        setFormError(null);

        // Client-side validations
        if (!currentCustomer.name.trim()) return setFormError("Customer name is required.");
        if (!currentCustomer.email.trim()) return setFormError("Customer email is required.");
        
        // Simple regex check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(currentCustomer.email.trim())) {
            return setFormError("Please enter a valid email address.");
        }

        const payload = {
            name: currentCustomer.name.trim(),
            email: currentCustomer.email.trim().toLowerCase(),
            phone: currentCustomer.phone.trim() || null
        };

        try {
            if (isEditing) {
                await api.customers.update(currentCustomer.id, payload);
                showNotification("Customer profile updated successfully.");
            } else {
                await api.customers.create(payload);
                showNotification("Customer registered successfully.");
            }
            setModalOpen(false);
            loadCustomers();
        } catch (err) {
            setFormError(err.message);
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const query = search.toLowerCase();
        return customer.name.toLowerCase().includes(query) || customer.email.toLowerCase().includes(query);
    });

    return (
        <div>
            <div className="header-container">
                <div>
                    <h1 className="header-title">Customer Directory</h1>
                    <p className="header-subtitle">Register and manage customer profiles, emails, and contact records.</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                    Add Customer
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
                        placeholder="🔍 Search customers by name or email..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="empty-state" style={{ padding: '2rem' }}>
                        <p>Loading customer accounts...</p>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <h3 className="empty-state-title">No customers found</h3>
                        <p>{search ? "No matching profiles." : "Add your first customer to enable order creation."}</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Customer ID</th>
                                    <th>Name</th>
                                    <th>Email Address</th>
                                    <th>Phone</th>
                                    <th>Registered Date</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map(customer => (
                                    <tr key={customer.id}>
                                        <td><strong>#{customer.id}</strong></td>
                                        <td>{customer.name}</td>
                                        <td>{customer.email}</td>
                                        <td>{customer.phone || <span style={{ color: 'var(--text-dim)' }}>Not provided</span>}</td>
                                        <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button 
                                                className="btn btn-secondary" 
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem' }}
                                                onClick={() => handleOpenEditModal(customer)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="btn btn-danger" 
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                onClick={() => handleDeleteCustomer(customer.id)}
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
                            <h2 className="modal-title">{isEditing ? "Edit Profile" : "Register Customer"}</h2>
                            <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
                        </div>
                        
                        <form onSubmit={handleSaveCustomer}>
                            {formError && (
                                <div className="alert alert-danger" style={{ padding: '0.75rem', marginBottom: '1.25rem' }}>
                                    <span>⚠️</span> {formError}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="e.g. Kalki Jay"
                                    value={currentCustomer.name}
                                    onChange={(e) => setCurrentCustomer({...currentCustomer, name: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input 
                                    type="email" 
                                    className="form-input" 
                                    placeholder="e.g. kalki.jay@example.com"
                                    value={currentCustomer.email}
                                    onChange={(e) => setCurrentCustomer({...currentCustomer, email: e.target.value})}
                                    disabled={isEditing} // Email is usually unique and unmodifiable for user mapping stability
                                />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'block' }}>
                                    * Must be unique. Cannot be changed after profile is saved.
                                </span>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number (Optional)</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="e.g. +1 234-567-8900"
                                    value={currentCustomer.phone}
                                    onChange={(e) => setCurrentCustomer({...currentCustomer, phone: e.target.value})}
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {isEditing ? "Save Changes" : "Register Profile"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
