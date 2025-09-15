import { format } from 'date-fns';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, Line, LineChart } from 'recharts';


const API_BASE_URL = 'https://xeno-fde-production.up.railway.app/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorText = 'An error occurred while fetching data.';
        try {
            errorText = await response.text();
        } catch (e) {
            // Ignore if response has no body
        }
        throw new Error(errorText);
    }
    return response.json();
};

const getHeaders = (token) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
});

// Main dashboard data (metrics, charts, top customers)
export const fetchDashboardData = async (token) => {
    const headers = getHeaders(token);
    const today = format(new Date()+1, 'yyyy-MM-dd');
    const pastDate = format(new Date().setDate(new Date().getDate() - 30), 'yyyy-MM-dd');

    const [metrics, ordersByDate, topCustomers] = await Promise.all([
        fetch(`${API_BASE_URL}/metrics`, { headers }).then(handleResponse),
        fetch(`${API_BASE_URL}/orders-by-date?start_date=${pastDate}&end_date=${today}`, { headers }).then(handleResponse),
        fetch(`${API_BASE_URL}/top-customers`, { headers }).then(handleResponse),
    ]);

    return { metrics, ordersByDate, topCustomers: topCustomers.topCustomers || [] };
};

// New: Fetch all products
export const fetchProducts = async (token) => {
    const headers = getHeaders(token);
    const response = await fetch(`${API_BASE_URL}/products`, { headers });
    return handleResponse(response);
};

// New: Fetch all customers
export const fetchCustomers = async (token) => {
    const headers = getHeaders(token);
    const response = await fetch(`${API_BASE_URL}/customers`, { headers });
    return handleResponse(response);
};

// New: Fetch all orders
export const fetchOrders = async (token) => {
    const headers = getHeaders(token);
    const response = await fetch(`${API_BASE_URL}/orders`, { headers });
    return handleResponse(response);
};

// Authentication service (login/register)
export const loginUser = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse(response); // ✅ parse JSON
    console.log("🔑 Login response:", data);

    return data.token; // ✅ return only token
};


export const registerUser = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
};