import React, { useState, useEffect } from 'react';
import { 
  LineChart,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ResponsiveContainer, 
  Legend, 
  Line 
} from 'recharts';
import MetricCard from './MetricCard';
import { fetchDashboardData, fetchProducts, fetchCustomers, fetchOrders } from '../services/api';

const Dashboard = ({ token, onLogout }) => {
    const [view, setView] = useState('metrics');
    const [data, setData] = useState({ metrics: null, ordersByDate: [], topCustomers: [], allCustomers: [], allOrders: [], allProducts: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const getDashboardData = async (authToken) => {
        try {
            setLoading(true);
            const dashboardData = await fetchDashboardData(authToken);
            setData(prev => ({ ...prev, metrics: dashboardData.metrics, ordersByDate: dashboardData.ordersByDate, topCustomers: dashboardData.topCustomers }));
            console.log(dashboardData.ordersByDate);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Your session has expired. Please log in again.');
            localStorage.removeItem('token');
            onLogout(); // Force logout on error
        } finally {
            setLoading(false);
        }
    };
    
    const getCustomers = async (authToken) => {
        try {
            setLoading(true);
            const customers = await fetchCustomers(authToken);
            setData(prev => ({ ...prev, allCustomers: customers }));
            setView('customers');
        } catch (err) {
            console.error('Failed to fetch customers:', err);
            setError('Your session has expired. Please log in again.');
            localStorage.removeItem('token');
            onLogout(); // Force logout on error
        } finally {
            setLoading(false);
        }
    };

    const getOrders = async (authToken) => {
        try {
            setLoading(true);
            const orders = await fetchOrders(authToken);
            setData(prev => ({ ...prev, allOrders: orders }));
            setView('orders');
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError('Your session has expired. Please log in again.');
            localStorage.removeItem('token');
            onLogout(); // Force logout on error
        } finally {
            setLoading(false);
        }
    };

    const getProducts = async (authToken) => {
        try {
            setLoading(true);
            const products = await fetchProducts(authToken);
            setData(prev => ({ ...prev, allProducts: products }));
            setView('products');
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError('Your session has expired. Please log in again.');
            localStorage.removeItem('token');
            onLogout(); // Force logout on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            getDashboardData(token);
        } else {
            setError('No token found. Please log in.');
            setLoading(false);
        }
    }, [token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Loading Dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500 text-lg">
                    {error}
                    <button
                        onClick={onLogout}
                        className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-300">
                <h1 className="text-4xl font-extrabold text-gray-900">
                    {view === 'metrics' ? 'Insights Dashboard' : 
                     view === 'customers' ? 'All Customers' :
                     view === 'orders' ? 'All Orders' :
                     'All Products'}
                </h1>
                <div className="space-x-2">
                    {view !== 'metrics' && (
                        <button
                            onClick={() => { setView('metrics'); getDashboardData(token); }}
                            className="py-2 px-4 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition duration-150"
                        >
                            Back to Metrics
                        </button>
                    )}
                    <button
                        onClick={onLogout}
                        className="py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-150"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Metrics View */}
            {view === 'metrics' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div onClick={() => getCustomers(token)} className="cursor-pointer">
                            <MetricCard title="Total Customers" value={data.metrics?.total_customers} />
                        </div>
                        <div onClick={() => getOrders(token)} className="cursor-pointer">
                            <MetricCard title="Total Orders" value={data.metrics?.total_orders} />
                        </div>
                        <MetricCard
                            title="Total Revenue"
                            value={`₹${Number(data.metrics?.total_revenue || 0).toFixed(2)}`}
                        />
                    </div>
                    
                    <button
                        onClick={() => getProducts(token)}
                        className="py-3 px-6 mb-10 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                    >
                        View All Products
                    </button>

                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-10">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900">Orders & Revenue by Date</h2>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.ordersByDate}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="order_date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          {/* First line for orders */}
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="order_count"
                            stroke="#4f46e5"
                            name="Orders"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                          {/* Second line for revenue */}
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="total_revenue"
                            stroke="#22c55e"
                            name="Revenue"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>



                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">Top 5 Customers by Spend</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spend</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {Array.isArray(data?.topCustomers) && data.topCustomers.length > 0 ? (
                                        data.topCustomers.map((customer, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {customer.first_name} {customer.last_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    ${Number(customer.total_spend || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">No customer data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
            
            {/* All Customers View */}
            {view === 'customers' && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">All Customers</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.allCustomers.map(customer => (
                                    <tr key={customer.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.first_name} {customer.last_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(customer.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* All Orders View */}
            {view === 'orders' && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">All Orders</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Financial Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.allOrders.map(order => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.total_price} {order.currency}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.financial_status}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* All Products View */}
            {view === 'products' && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">All Products</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.allProducts.map(product => (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.vendor}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;
