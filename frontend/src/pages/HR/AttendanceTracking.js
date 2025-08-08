import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle,
  XCircle,
  MapPin,
  Search,
  Download,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import toast from 'react-hot-toast';

const AttendanceTracking = () => {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Mock data - will be replaced with API calls
  const todayAttendance = {
    checkIn: '09:00 AM',
    checkOut: null,
    totalHours: 0,
    status: 'present',
    location: 'Office'
  };

  const attendanceLogs = [
    {
      id: 1,
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      date: '2024-12-03',
      checkIn: '09:00 AM',
      checkOut: '06:00 PM',
      totalHours: 9,
      status: 'present',
      location: 'Office',
      isApproved: true
    },
    {
      id: 2,
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      date: '2024-12-03',
      checkIn: '08:45 AM',
      checkOut: '05:30 PM',
      totalHours: 8.75,
      status: 'present',
      location: 'Office',
      isApproved: true
    },
    {
      id: 3,
      employeeId: 'EMP003',
      employeeName: 'Mike Johnson',
      date: '2024-12-03',
      checkIn: null,
      checkOut: null,
      totalHours: 0,
      status: 'absent',
      location: null,
      isApproved: false
    },
    {
      id: 4,
      employeeId: 'EMP004',
      employeeName: 'Sarah Wilson',
      date: '2024-12-03',
      checkIn: '10:15 AM',
      checkOut: null,
      totalHours: 0,
      status: 'present',
      location: 'Office',
      isApproved: false
    }
  ];

  const pendingApprovals = attendanceLogs.filter(log => !log.isApproved);

  // Mock functions - will be replaced with actual API calls
  const handleCheckIn = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Check-in successful!');
      // Update attendance data here
    } catch (error) {
      toast.error('Check-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Check-out successful!');
      // Update attendance data here
    } catch (error) {
      toast.error('Check-out failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAttendance = async (attendanceId) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Attendance approved successfully!');
      // Update attendance data here
    } catch (error) {
      toast.error('Approval failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      present: { color: 'bg-green-100 text-green-800', label: 'Present' },
      absent: { color: 'bg-red-100 text-red-800', label: 'Absent' },
      late: { color: 'bg-yellow-100 text-yellow-800', label: 'Late' },
      half_day: { color: 'bg-orange-100 text-orange-800', label: 'Half Day' }
    };

    const config = statusConfig[status] || statusConfig.absent;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getApprovalBadge = (isApproved) => {
    if (isApproved) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Approved
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
        Pending
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Tracking</h1>
        <p className="text-gray-600 mt-2">Track daily attendance and manage check-ins/check-outs</p>
      </div>

      {/* Today's Attendance Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Today's Attendance</h2>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {todayAttendance.checkIn || '--:--'}
            </div>
            <div className="text-sm text-gray-600">Check In</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {todayAttendance.checkOut || '--:--'}
            </div>
            <div className="text-sm text-gray-600">Check Out</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {todayAttendance.totalHours}h
            </div>
            <div className="text-sm text-gray-600">Total Hours</div>
          </div>
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          {!todayAttendance.checkIn ? (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="btn-primary flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {loading ? 'Checking In...' : 'Check In'}
            </button>
          ) : !todayAttendance.checkOut ? (
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="btn-secondary flex items-center"
            >
              <XCircle className="w-4 h-4 mr-2" />
              {loading ? 'Checking Out...' : 'Check Out'}
            </button>
          ) : (
            <div className="text-green-600 font-medium">Day Complete!</div>
          )}
        </div>

        {todayAttendance.location && (
          <div className="mt-4 text-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 inline mr-1" />
            Location: {todayAttendance.location}
          </div>
        )}
      </div>

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
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="half_day">Half Day</option>
          </select>

          <button className="btn-secondary flex items-center justify-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-medium text-yellow-800">
              Pending Approvals ({pendingApprovals.length})
            </h3>
          </div>
          <p className="text-yellow-700 mt-1">
            You have {pendingApprovals.length} attendance records waiting for approval.
          </p>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-700">
                            {log.employeeName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {log.employeeName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.employeeId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.checkIn || '--:--'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.checkOut || '--:--'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.totalHours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(log.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getApprovalBadge(log.isApproved)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!log.isApproved && (
                      <button
                        onClick={() => handleApproveAttendance(log.id)}
                        disabled={loading}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Approve
                      </button>
                    )}
                    <button className="text-blue-600 hover:text-blue-900">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present Today</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent Today</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Hours</p>
              <p className="text-2xl font-bold text-gray-900">8.9h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracking; 