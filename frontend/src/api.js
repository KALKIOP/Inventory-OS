// API Client for Inventory & Order Management System
let API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
// Safely normalize URL so it always ends with "/api" even if configured without it in Vercel
if (API_BASE_URL && !API_BASE_URL.endsWith("/api") && !API_BASE_URL.endsWith("/api/")) {
    API_BASE_URL = API_BASE_URL.endsWith("/") ? `${API_BASE_URL}api` : `${API_BASE_URL}/api`;
}

async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set headers
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    if (config.body && typeof config.body === "object") {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        
        // Handle no content responses (e.g. DELETE or 204)
        if (response.status === 204) {
            return null;
        }

        const data = await response.json();

        if (!response.ok) {
            // Extract the FastAPI detail error message
            const errorMessage = data && data.detail ? data.detail : `Request failed with status ${response.status}`;
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error(`API Error in request to ${endpoint}:`, error);
        throw error;
    }
}

export const api = {
    products: {
        list: () => request("/products/"),
        get: (id) => request(`/products/${id}`),
        create: (data) => request("/products/", { method: "POST", body: data }),
        update: (id, data) => request(`/products/${id}`, { method: "PUT", body: data }),
        delete: (id) => request(`/products/${id}`, { method: "DELETE" }),
    },
    customers: {
        list: () => request("/customers/"),
        get: (id) => request(`/customers/${id}`),
        create: (data) => request("/customers/", { method: "POST", body: data }),
        update: (id, data) => request(`/customers/${id}`, { method: "PUT", body: data }),
        delete: (id) => request(`/customers/${id}`, { method: "DELETE" }),
    },
    orders: {
        list: () => request("/orders/"),
        get: (id) => request(`/orders/${id}`),
        create: (data) => request("/orders/", { method: "POST", body: data }),
    }
};
