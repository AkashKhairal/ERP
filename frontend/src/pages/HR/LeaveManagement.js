import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      leaveType: 'annual',
      startDate: '2024-12-15',
      endDate: '2024-12-17',
      totalDays: 3,
      reason: 'Family vacation',
      status: 'pending',
      submittedAt: '2024-12-01T10:30:00Z',
      approvedBy: null,
      approvedAt: null
    },
    {
      id: 2,
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      leaveType: 'sick',
      startDate: '2024-12-10',
      endDate: '2024-12-10',
      totalDays: 1,
      reason: 'Not feeling well',
      status: 'approved',
      submittedAt: '2024-12-09T08:15:00Z',
      approvedBy: 'Manager Name',
      approvedAt: '2024-12-09T14:30:00Z'
    },
    {
      id: 3,
      employeeId: 'EMP003',
      employeeName: 'Mike Johnson',
      leaveType: 'casual',
      startDate: '2024-12-20',
      endDate: '2024-12-20',
      totalDays: 1,
      reason: 'Personal appointment',
      status: 'rejected',
      submittedAt: '2024-12-05T16:45:00Z',
      approvedBy: 'Manager Name',
      approvedAt: '2024-12-06T09:20:00Z',
      rejectionReason: 'High workload period'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Mock data - will be replaced with API calls
  const leaveBalance = {
    annual: { total: 21, used: 5, remaining: 16 },
    casual: { total: 7, used: 2, remaining: 5 },
    sick: { total: 10, used: 1, remaining: 9 },
    unpaid: { total: 0, used: 0, remaining: 0 }
  };

  const pendingRequests = leaveRequests.filter(request => request.status === 'pending');

  // Mock functions - will be replaced with actual API calls
  const handleApproveLeave = async (leaveId) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Leave request approved successfully!');
      // Update leave requests here
    } catch (error) {
      toast.error('Approval failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectLeave = async (leaveId) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Leave request rejected successfully!');
      // Update leave requests here
    } catch (error) {
      toast.error('Rejection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getLeaveTypeBadge = (type) => {
    const typeConfig = {
      annual: { color: 'bg-blue-100 text-blue-800', label: 'Annual' },
      casual: { color: 'bg-green-100 text-green-800', label: 'Casual' },
      sick: { color: 'bg-red-100 text-red-800', label: 'Sick' },
      unpaid: { color: 'bg-gray-100 text-gray-800', label: 'Unpaid' }
    };

    const config = typeConfig[type] || typeConfig.annual;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-600 mt-2">Manage leave requests, track balances, and handle approvals</p>
          </div>
          <button
            onClick={() => setShowRequestForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Request Leave
          </button>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Object.entries(leaveBalance).map(([type, balance]) => (
          <div key={type} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 capitalize">{type} Leave</p>
                <p className="text-2xl font-bold text-gray-900">{balance.remaining}</p>
                <p className="text-xs text-gray-500">of {balance.total} days</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Used</span>
                <span>{balance.used}/{balance.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(balance.used / balance.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Approvals Alert */}
      {pendingRequests.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-medium text-yellow-800">
              Pending Approvals ({pendingRequests.length})
            </h3>
          </div>
          <p className="text-yellow-700 mt-1">
            You have {pendingRequests.length} leave requests waiting for approval.
          </p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="annual">Annual</option>
            <option value="casual">Casual</option>
            <option value="sick">Sick</option>
            <option value="unpaid">Unpaid</option>
          </select>

          <button className="btn-secondary flex items-center justify-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaveRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-700">
                            {request.employeeName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {request.employeeName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.employeeId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getLeaveTypeBadge(request.leaveType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{new Date(request.startDate).toLocaleDateString()}</div>
                      <div className="text-gray-500">to</div>
                      <div>{new Date(request.endDate).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.totalDays} day{request.totalDays > 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(request.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedLeave(request)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveLeave(request.id)}
                            disabled={loading}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectLeave(request.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Request Leave</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Select Leave Type</option>
                    <option value="annual">Annual Leave</option>
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input type="date" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input type="date" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <textarea 
                    rows="3" 
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Please provide a reason for your leave request"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Leave Details Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Request Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Employee:</span>
                  <p className="text-sm text-gray-900">{selectedLeave.employeeName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Leave Type:</span>
                  <p className="text-sm text-gray-900">{selectedLeave.leaveType}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Dates:</span>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Reason:</span>
                  <p className="text-sm text-gray-900">{selectedLeave.reason}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <p className="text-sm text-gray-900">{selectedLeave.status}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedLeave(null)}
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

export default LeaveManagement; 