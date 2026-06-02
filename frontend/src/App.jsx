import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

function AuthenticatedApp() {
    const { user, loading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: '#0b0f19',
                color: '#ffffff',
                fontFamily: 'system-ui, sans-serif'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 2s linear infinite' }}>🔄</div>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.95rem' }}>Initializing Secure Session...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard setActiveTab={setActiveTab} />;
            case 'products':
                return <Products />;
            case 'customers':
                return <Customers />;
            case 'orders':
                return <Orders />;
            default:
                return <Dashboard setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="app-container">
            {/* Sidebar Navigation */}
            <aside className="sidebar">
                <div className="logo-container">
                    <div className="logo-icon">📦</div>
                    <div className="logo-text">Inventory OS</div>
                </div>

                {/* Logged in User Profile Info */}
                <div style={{
                    padding: '0.8rem 1rem',
                    margin: '0.5rem 0 1.5rem 0',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.85rem'
                }}>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Session</div>
                    <div style={{ color: '#ffffff', fontWeight: '600', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        👤 {user.username}
                    </div>
                </div>

                <nav className="nav-links">
                    <button 
                        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                        style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit' }}
                    >
                        <span>📊</span> Dashboard
                    </button>

                    <button 
                        className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                        style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit' }}
                    >
                        <span>🏷️</span> Products Catalog
                    </button>

                    <button 
                        className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('customers')}
                        style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit' }}
                    >
                        <span>👥</span> Customers Index
                    </button>

                    <button 
                        className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                        style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit' }}
                    >
                        <span>📦</span> Orders Log
                    </button>
                </nav>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Logout Button */}
                    <button 
                        onClick={logout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.8rem 1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '10px',
                            color: '#f87171',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            textAlign: 'left',
                            transition: 'background-color 0.2s',
                            width: '100%'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.18)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                        <span>🚪</span> Log Out Session
                    </button>

                    <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1rem', fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                        Enterprise Core v1.0.0
                    </div>
                </div>
            </aside>

            {/* Main Application Window */}
            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AuthenticatedApp />
        </AuthProvider>
    );
}

