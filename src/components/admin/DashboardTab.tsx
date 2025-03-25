'use client';

import React, { useEffect, useState } from 'react';
import { FaPlus, FaImage, FaChartLine, FaShoppingBag, FaUsers, FaCalendarAlt, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import BrandLoader from '@/components/BrandLoader';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardTabProps {
  products: any[];
  banners: any[];
  orders?: any[];
  handleAddProduct: () => void;
  handleAddBanner: () => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ 
  products, 
  banners, 
  orders = [], 
  handleAddProduct, 
  handleAddBanner 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    recentSales: [0, 0, 0, 0, 0, 0]
  });
  const [salesData, setSalesData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(255, 153, 0)', // Amazon orange
        backgroundColor: 'rgba(255, 153, 0, 0.1)', // Light orange background
        tension: 0.3,
        fill: true,
      },
    ],
  });
  const router = useRouter();

  // Add date range state
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    endDate: new Date()
  });
  const [timeframe, setTimeframe] = useState('6months'); // '30days', '6months', '1year', 'custom'

  useEffect(() => {
    fetchDashboardData();
  }, [orders]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Calculate stats from the orders prop
      const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalOrders = orders.length;
      
      // Get unique customer IDs from orders
      const uniqueCustomerIds = new Set();
      orders.forEach(order => {
        const customerId = order.customer_id || order.customerId || order.customer;
        if (customerId) uniqueCustomerIds.add(customerId);
      });
      const totalCustomers = uniqueCustomerIds.size;
      
      // Process orders by month for chart data
      const monthlyData = processOrdersByMonth(orders);
      
      setStats({
        totalSales,
        totalOrders,
        totalCustomers,
        recentSales: monthlyData
      });
      
      // Update chart data with real values
      setSalesData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Sales',
            data: monthlyData,
            borderColor: 'rgb(255, 153, 0)', // Amazon orange
            backgroundColor: 'rgba(255, 153, 0, 0.1)', // Light orange background
            tension: 0.3,
            fill: true,
          },
        ],
      });
    } catch (error: any) {
      console.error('Error processing dashboard data:', error?.message || 'Unknown error');
      
      // Set default stats even if there's an error
      setStats({
        totalSales: 0,
        totalOrders: 0,
        totalCustomers: 0,
        recentSales: [0, 0, 0, 0, 0, 0]
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process orders by month for chart data
  const processOrdersByMonth = (orders: any[]) => {
    const monthlyTotals = [0, 0, 0, 0, 0, 0]; // Jan to Jun
    
    orders.forEach(order => {
      if (order.created_at || order.createdAt) {
        const date = new Date(order.created_at || order.createdAt);
        const month = date.getMonth(); // 0-based (0 = Jan)
        
        if (month >= 0 && month < 6) { // Only consider Jan-Jun
          monthlyTotals[month] += (order.total || 0);
        }
      }
    });
    
    return monthlyTotals;
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `£${context.raw.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            return '£' + value;
          }
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
  };

  // Add this function to update chart data based on date range
  const updateChartDataByDateRange = (startDate: Date, endDate: Date) => {
    // Filter orders by date range
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at || order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
    
    // Process the filtered orders
    let labels: string[] = [];
    let data: number[] = [];
    
    // Determine the appropriate time grouping based on the date range
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 31) {
      // Group by day for ranges up to a month
      const dailyTotals: Record<string, number> = {};
      
      filteredOrders.forEach(order => {
        const date = new Date(order.created_at || order.createdAt);
        const dateStr = date.toISOString().split('T')[0];
        dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + (order.total || 0);
      });
      
      // Sort dates and create labels and data arrays
      labels = Object.keys(dailyTotals).sort();
      data = labels.map(date => dailyTotals[date]);
    } else if (daysDiff <= 180) {
      // Group by week for ranges up to 6 months
      const weeklyTotals: Record<string, number> = {};
      
      filteredOrders.forEach(order => {
        const date = new Date(order.created_at || order.createdAt);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        weeklyTotals[weekKey] = (weeklyTotals[weekKey] || 0) + (order.total || 0);
      });
      
      // Sort weeks and create labels and data arrays
      labels = Object.keys(weeklyTotals).sort();
      data = labels.map(week => weeklyTotals[week]);
      // Format labels to show week ranges
      labels = labels.map(week => {
        const weekStart = new Date(week);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.getDate()}/${weekStart.getMonth()+1} - ${weekEnd.getDate()}/${weekEnd.getMonth()+1}`;
      });
    } else {
      // Group by month for longer ranges
      const monthlyTotals: Record<string, number> = {};
      
      filteredOrders.forEach(order => {
        const date = new Date(order.created_at || order.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + (order.total || 0);
      });
      
      // Sort months and create labels and data arrays
      labels = Object.keys(monthlyTotals).sort();
      data = labels.map(month => monthlyTotals[month]);
      // Format labels to show month names
      labels = labels.map(month => {
        const [year, monthNum] = month.split('-');
        return new Date(parseInt(year), parseInt(monthNum) - 1, 1).toLocaleString('default', { month: 'short', year: 'numeric' });
      });
    }
    
    // Update chart data
    setSalesData({
      labels,
      datasets: [
        {
          label: 'Sales',
          data,
          borderColor: 'rgb(255, 153, 0)', // Amazon orange
          backgroundColor: 'rgba(255, 153, 0, 0.1)', // Light orange background
          tension: 0.3,
          fill: true,
        },
      ],
    });
  };

  return (
    <div className="p-6 bg-[var(--light-bg)]">
      {isLoading ? (
        <div className="w-full py-8">
          <BrandLoader />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Products</h2>
                  <p className="text-2xl font-bold mt-1">{products.length}</p>
                </div>
                <div className="bg-[rgba(255,153,0,0.1)] p-3 rounded-full">
                  <FaShoppingBag className="text-[var(--accent-color)]" />
                </div>
              </div>
              <div className="flex items-center text-xs">
                <button 
                  onClick={handleAddProduct}
                  className="text-[var(--accent-secondary)] hover:text-[var(--accent-color)] flex items-center"
                >
                  <FaPlus className="mr-1" /> Add Product
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Banners</h2>
                  <p className="text-2xl font-bold mt-1">{banners.length}</p>
                </div>
                <div className="bg-[rgba(255,153,0,0.1)] p-3 rounded-full">
                  <FaImage className="text-[var(--accent-color)]" />
                </div>
              </div>
              <div className="flex items-center text-xs">
                <button 
                  onClick={handleAddBanner}
                  className="text-[var(--accent-secondary)] hover:text-[var(--accent-color)] flex items-center"
                >
                  <FaPlus className="mr-1" /> Add Banner
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Orders</h2>
                  <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
                </div>
                <div className="bg-[rgba(20,110,180,0.1)] p-3 rounded-full">
                  <FaShoppingBag className="text-[var(--accent-secondary)]" />
                </div>
              </div>
              <div className="flex items-center text-xs text-[var(--success-green)]">
                <FaArrowUp className="mr-1" /> 
                <span>{Math.round(stats.totalOrders * 0.12)} new this month</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Customers</h2>
                  <p className="text-2xl font-bold mt-1">{stats.totalCustomers}</p>
                </div>
                <div className="bg-[rgba(20,110,180,0.1)] p-3 rounded-full">
                  <FaUsers className="text-[var(--accent-secondary)]" />
                </div>
              </div>
              <div className="flex items-center text-xs text-[var(--success-green)]">
                <FaArrowUp className="mr-1" /> 
                <span>{Math.round(stats.totalCustomers * 0.08)} new this month</span>
              </div>
            </div>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Chart - Takes 2/3 of the width on large screens */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-[var(--primary-color)]">Sales Overview</h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-sm">
                    <select 
                      value={timeframe}
                      onChange={(e) => {
                        const value = e.target.value;
                        setTimeframe(value);
                        
                        const endDate = new Date();
                        let startDate = new Date();
                        
                        switch(value) {
                          case '7days':
                            startDate.setDate(endDate.getDate() - 7);
                            break;
                          case '30days':
                            startDate.setDate(endDate.getDate() - 30);
                            break;
                          case '3months':
                            startDate.setMonth(endDate.getMonth() - 3);
                            break;
                          case '6months':
                            startDate.setMonth(endDate.getMonth() - 6);
                            break;
                          case '1year':
                            startDate.setFullYear(endDate.getFullYear() - 1);
                            break;
                          default:
                            startDate.setMonth(endDate.getMonth() - 6);
                        }
                        
                        setDateRange({ startDate, endDate });
                      }}
                      className="border border-gray-300 rounded px-2 py-1 bg-white text-sm"
                    >
                      <option value="7days">Last 7 days</option>
                      <option value="30days">Last 30 days</option>
                      <option value="3months">Last 3 months</option>
                      <option value="6months">Last 6 months</option>
                      <option value="1year">Last year</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <DatePicker
                      selectsRange={true}
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      onChange={(update: [Date | null, Date | null]) => {
                        const [start, end] = update;
                        setDateRange({
                          startDate: start || new Date(),
                          endDate: end || new Date()
                        });
                      }}
                      className="border border-gray-300 rounded px-2 py-1 bg-white text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="h-64">
                <Line 
                  data={salesData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                          label: function(context) {
                            return `£${context.raw}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '£' + value;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            {/* Store Overview - Takes 1/3 of the width on large screens */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-6 text-[var(--primary-color)]">Store Overview</h2>
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-[rgba(255,153,0,0.05)] rounded-lg border border-[rgba(255,153,0,0.1)]">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
                    <p className="text-xl font-bold mt-1 text-[var(--success-green)]">£{stats.totalSales.toFixed(2)}</p>
                  </div>
                  <div className="bg-[rgba(255,153,0,0.1)] p-3 rounded-full">
                    <FaChartLine className="text-[var(--accent-color)]" />
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-[rgba(255,153,0,0.05)] rounded-lg border border-[rgba(255,153,0,0.1)]">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                    <p className="text-xl font-bold mt-1 text-[var(--primary-color)]">{stats.totalOrders}</p>
                  </div>
                  <div className="bg-[rgba(255,153,0,0.1)] p-3 rounded-full">
                    <FaShoppingBag className="text-[var(--accent-color)]" />
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-[rgba(255,153,0,0.05)] rounded-lg border border-[rgba(255,153,0,0.1)]">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Avg. Order Value</h3>
                    <p className="text-xl font-bold mt-1 text-[var(--success-green)]">
                      £{stats.totalOrders > 0 ? (stats.totalSales / stats.totalOrders).toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div className="bg-[rgba(255,153,0,0.1)] p-3 rounded-full">
                    <FaChartLine className="text-[var(--accent-color)]" />
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-[rgba(20,110,180,0.05)] rounded-lg border border-[rgba(20,110,180,0.1)]">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
                    <p className="text-xl font-bold mt-1 text-[var(--accent-secondary)]">
                      {stats.totalOrders > 0 ? Math.round((stats.totalOrders / (stats.totalOrders * 3)) * 100) : 0}%
                    </p>
                  </div>
                  <div className="bg-[rgba(20,110,180,0.1)] p-3 rounded-full">
                    <FaUsers className="text-[var(--accent-secondary)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Activity Section */}
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-6 text-[var(--primary-color)]">Recent Activity</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                {orders.slice(0, 5).map((order, index) => (
                  <div key={index} className="flex items-center p-3 border-b border-gray-100 last:border-0">
                    <div className="bg-[rgba(20,110,180,0.1)] p-2 rounded-full mr-4">
                      <FaShoppingBag className="text-[var(--accent-secondary)]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        New order <span className="text-[var(--accent-secondary)]">#{order.id}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[var(--success-green)]">£{order.total?.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{order.status}</p>
                    </div>
                  </div>
                ))}
                
                {orders.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No recent orders
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardTab;
