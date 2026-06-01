import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';

export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard');

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

                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                    Enterprise Core v1.0.0
                </div>
            </aside>

            {/* Main Application Window */}
            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    );
}
