import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { hrService } from '../../services/hrService';

const AttendanceTracking = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    pending: 0,
    avgHours: 0
  });

  useEffect(() => {
    loadInitialData();
  }, [selectedDate]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTodayAttendance(),
        loadAttendanceLogs(),
        loadAttendanceStats()
      ]);
    } catch (error) {
      console.error('Error loading attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const loadTodayAttendance = async () => {
    try {
      const response = await hrService.getMyTodayAttendance();
      setTodayAttendance(response.data);
    } catch (error) {
      console.error('Error loading today attendance:', error);
    }
  };

  const loadAttendanceLogs = async () => {
    try {
      const response = await hrService.getAttendanceByDate(selectedDate);
      setAttendanceLogs(response.data || []);
    } catch (error) {
      console.error('Error loading attendance logs:', error);
    }
  };

  const loadAttendanceStats = async () => {
    try {
      const response = await hrService.getAttendanceToday();
      const logs = response.data || [];
      const present = logs.filter(log => log.status === 'present').length;
      const absent = logs.filter(log => log.status === 'absent').length;
      const pending = logs.filter(log => !log.isApproved).length;
      const avgHours = logs.reduce((sum, log) => sum + (log.totalHours || 0), 0) / (logs.length || 1);
      
      setAttendanceStats({ present, absent, pending, avgHours: Math.round(avgHours * 10) / 10 });
    } catch (error) {
      console.error('Error loading attendance stats:', error);
    }
  };

  const pendingApprovals = attendanceLogs.filter(log => !log.isApproved);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const location = 'Office'; // Could be detected via geolocation
      const notes = '';
      await hrService.checkIn({ location, notes });
      toast.success('Check-in successful!');
      await loadTodayAttendance();
      await loadAttendanceStats();
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error(error.message || 'Check-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const location = 'Office';
      const notes = '';
      await hrService.checkOut({ location, notes });
      toast.success('Check-out successful!');
      await loadTodayAttendance();
      await loadAttendanceStats();
    } catch (error) {
      console.error('Check-out error:', error);
      toast.error(error.message || 'Check-out failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAttendance = async (attendanceId) => {
    setLoading(true);
    try {
      await hrService.approveAttendance(attendanceId);
      toast.success('Attendance approved successfully!');
      await loadAttendanceLogs();
      await loadAttendanceStats();
    } catch (error) {
      console.error('Approval error:', error);
      toast.error(error.message || 'Approval failed. Please try again.');
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

        {loading && !todayAttendance ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading attendance data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {todayAttendance?.checkIn?.time ? 
                    new Date(todayAttendance.checkIn.time).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : '--:--'
                  }
                </div>
                <div className="text-sm text-gray-600">Check In</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {todayAttendance?.checkOut?.time ? 
                    new Date(todayAttendance.checkOut.time).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : '--:--'
                  }
                </div>
                <div className="text-sm text-gray-600">Check Out</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {todayAttendance?.totalHours || 0}h
                </div>
                <div className="text-sm text-gray-600">Total Hours</div>
              </div>
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              {!todayAttendance?.checkIn?.time ? (
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {loading ? 'Checking In...' : 'Check In'}
                </button>
              ) : !todayAttendance?.checkOut?.time ? (
                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {loading ? 'Checking Out...' : 'Check Out'}
                </button>
              ) : (
                <div className="text-green-600 font-medium">Day Complete!</div>
              )}
            </div>

            {todayAttendance?.checkIn?.location && (
              <div className="mt-4 text-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location: {todayAttendance.checkIn.location}
              </div>
            )}
          </>
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
              {loading && attendanceLogs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading attendance records...</p>
                  </td>
                </tr>
              ) : attendanceLogs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No attendance records found for this date.
                  </td>
                </tr>
              ) : (
                attendanceLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                              {((log.employee?.user?.firstName || '') + (log.employee?.user?.lastName || '')).split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {log.employee?.user?.firstName} {log.employee?.user?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.employee?.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.checkIn?.time ? new Date(log.checkIn.time).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : '--:--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.checkOut?.time ? new Date(log.checkOut.time).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : '--:--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.totalHours || 0}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getApprovalBadge(log.isApproved)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!log.isApproved && user?.role && ['admin', 'manager'].includes(user.role) && (
                        <button
                          onClick={() => handleApproveAttendance(log._id)}
                          disabled={loading}
                          className="text-green-600 hover:text-green-900 mr-3 disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      <button className="text-blue-600 hover:text-blue-900">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.present}</p>
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
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.absent}</p>
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
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.pending}</p>
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
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.avgHours}h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracking; 