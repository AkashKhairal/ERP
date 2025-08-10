const Employee = require('../models/Employee')
const Leave = require('../models/Leave')
const Payroll = require('../models/Payroll')

// GET /api/hr/stats
// Basic HR dashboard stats
const getHRStats = async (req, res) => {
  try {
    const [totalEmployees, activeEmployees, pendingLeaves] = await Promise.all([
      Employee.countDocuments({}),
      Employee.countDocuments({ status: 'active' }),
      Leave.countDocuments({ status: 'pending' }),
    ])

    // Current month payroll totals
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    const payrollAgg = await Payroll.aggregate([
      { $match: { month, year, status: { $in: ['approved', 'paid'] } } },
      {
        $group: {
          _id: null,
          totalSalary: { $sum: '$netSalary' },
          averageSalary: { $avg: '$netSalary' },
        },
      },
    ])

    const totals = payrollAgg[0] || { totalSalary: 0, averageSalary: 0 }

    // Department breakdown using employee -> user department
    const departmentAgg = await Employee.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData',
        },
      },
      { $unwind: '$userData' },
      {
        $group: {
          _id: '$userData.department',
          count: { $sum: 1 },
        },
      },
    ])

    const departmentBreakdown = {}
    departmentAgg.forEach((d) => {
      if (d._id) departmentBreakdown[d._id] = d.count
    })

    // Leave type breakdown (optional)
    const leaveTypeAgg = await Leave.aggregate([
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
        },
      },
    ])
    const leaveTypeBreakdown = {}
    leaveTypeAgg.forEach((l) => {
      if (l._id) leaveTypeBreakdown[l._id] = l.count
    })

    return res.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        pendingLeaves,
        totalSalary: totals.totalSalary || 0,
        averageSalary: totals.averageSalary || 0,
        departmentBreakdown,
        leaveTypeBreakdown,
      },
    })
  } catch (err) {
    console.error('HR stats error:', err)
    return res.status(500).json({ success: false, message: 'Failed to load HR stats' })
  }
}

module.exports = { getHRStats }


