import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Users, 
  Plus, 
  Search, 
  Download, 
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PayrollManagement = () => {
  const { user } = useAuth();
  const [payrollData, setPayrollData] = useState([
    {
      id: 1,
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      month: 12,
      year: 2024,
      basicSalary: 75000,
      allowances: 15000,
      deductions: 5000,
      bonuses: 10000,
      overtime: 5000,
      grossSalary: 105000,
      netSalary: 100000,
      status: 'approved',
      paymentDate: '2024-12-05',
      paymentMethod: 'bank_transfer'
    },
    {
      id: 2,
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      month: 12,
      year: 2024,
      basicSalary: 45000,
      allowances: 8000,
      deductions: 3000,
      bonuses: 5000,
      overtime: 2000,
      grossSalary: 60000,
      netSalary: 57000,
      status: 'pending',
      paymentDate: null,
      paymentMethod: null
    },
    {
      id: 3,
      employeeId: 'EMP003',
      employeeName: 'Mike Johnson',
      month: 12,
      year: 2024,
      basicSalary: 65000,
      allowances: 12000,
      deductions: 4000,
      bonuses: 8000,
      overtime: 3000,
      grossSalary: 88000,
      netSalary: 84000,
      status: 'paid',
      paymentDate: '2024-12-05',
      paymentMethod: 'bank_transfer'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Mock data - will be replaced with API calls
  const payrollStats = {
    totalEmployees: 24,
    totalPayroll: 1850000,
    averageSalary: 77083,
    highestSalary: 120000,
    lowestSalary: 45000,
    pendingApprovals: 3
  };

  const pendingPayrolls = payrollData.filter(payroll => payroll.status === 'pending');

  // Mock functions - will be replaced with actual API calls
  const handleGeneratePayroll = async (month, year) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Payroll generated successfully!');
      // Update payroll data here
    } catch (error) {
      toast.error('Payroll generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayroll = async (payrollId) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Payroll approved successfully!');
      // Update payroll data here
    } catch (error) {
      toast.error('Approval failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (payrollId) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Payment marked as completed!');
      // Update payroll data here
    } catch (error) {
      toast.error('Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      paid: { color: 'bg-blue-100 text-blue-800', label: 'Paid' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
            <p className="text-gray-600 mt-2">Generate payroll, track payments, and manage salary disbursements</p>
          </div>
          <button
            onClick={() => setShowGenerateForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate Payroll
          </button>
        </div>
      </div>

      {/* Payroll Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{payrollStats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Payroll</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(payrollStats.totalPayroll)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Salary</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(payrollStats.averageSalary)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Highest Salary</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(payrollStats.highestSalary)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{payrollStats.pendingApprovals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals Alert */}
      {pendingPayrolls.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-medium text-yellow-800">
              Pending Approvals ({pendingPayrolls.length})
            </h3>
          </div>
          <p className="text-yellow-700 mt-1">
            You have {pendingPayrolls.length} payroll records waiting for approval.
          </p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button className="btn-secondary flex items-center justify-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Payroll Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Basic Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allowances
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrollData.map((payroll) => (
                <tr key={payroll.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-700">
                            {payroll.employeeName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {payroll.employeeName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payroll.employeeId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(payroll.year, payroll.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(payroll.basicSalary)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(payroll.allowances)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(payroll.deductions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(payroll.netSalary)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payroll.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedPayroll(payroll)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {payroll.status === 'pending' && (
                        <button
                          onClick={() => handleApprovePayroll(payroll.id)}
                          disabled={loading}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {payroll.status === 'approved' && (
                        <button
                          onClick={() => handleMarkAsPaid(payroll.id)}
                          disabled={loading}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Payroll Form Modal */}
      {showGenerateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Payroll</h3>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                handleGeneratePayroll(12, 2024);
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Month</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="12">December</option>
                    <option value="11">November</option>
                    <option value="10">October</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="overtime" className="h-4 w-4 text-blue-600" defaultChecked />
                  <label htmlFor="overtime" className="ml-2 text-sm text-gray-700">Include Overtime</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="bonuses" className="h-4 w-4 text-blue-600" defaultChecked />
                  <label htmlFor="bonuses" className="ml-2 text-sm text-gray-700">Include Bonuses</label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowGenerateForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Generating...' : 'Generate Payroll'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Details Modal */}
      {selectedPayroll && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payroll Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Employee:</span>
                  <p className="text-sm text-gray-900">{selectedPayroll.employeeName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Period:</span>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedPayroll.year, selectedPayroll.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Basic Salary:</span>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedPayroll.basicSalary)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Allowances:</span>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedPayroll.allowances)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Deductions:</span>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedPayroll.deductions)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Bonuses:</span>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedPayroll.bonuses)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Overtime:</span>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedPayroll.overtime)}</p>
                </div>
                <div className="border-t pt-3">
                  <span className="text-sm font-bold text-gray-700">Net Salary:</span>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedPayroll.netSalary)}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedPayroll(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollManagement; 