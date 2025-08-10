const Employee = require('../models/Employee');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (Admin, Manager, HR)
const getAllEmployees = async (req, res) => {
  try {
    const { department, status, workType } = req.query;
    const query = {};

    if (department) query['user.department'] = department;
    if (status) query.status = status;
    if (workType) query.workType = workType;

    const employees = await Employee.find(query)
      .populate('user', 'firstName lastName email role department')
      .populate('reportingManager', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employees',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'firstName lastName email role department')
      .populate('reportingManager', 'firstName lastName email role department');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Get employee by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employee',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin, HR)
const createEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      userId,
      phone,
      reportingManager,
      dateOfJoining,
      panNumber,
      aadharNumber,
      linkedin,
      skills,
      workType,
      salary,
      address,
      emergencyContact,
      bankDetails
    } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if employee already exists for this user
    const existingEmployee = await Employee.findOne({ user: userId });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile already exists for this user'
      });
    }

    // Check if PAN number already exists
    if (panNumber) {
      const existingPAN = await Employee.findOne({ panNumber });
      if (existingPAN) {
        return res.status(400).json({
          success: false,
          message: 'PAN number already exists'
        });
      }
    }

    // Check if Aadhar number already exists
    if (aadharNumber) {
      const existingAadhar = await Employee.findOne({ aadharNumber });
      if (existingAadhar) {
        return res.status(400).json({
          success: false,
          message: 'Aadhar number already exists'
        });
      }
    }

    const employeeData = {
      user: userId,
      phone,
      reportingManager,
      dateOfJoining,
      panNumber,
      aadharNumber,
      linkedin,
      skills: skills || [],
      workType: workType || 'full_time',
      salary: {
        base: salary?.base || 0,
        currency: salary?.currency || 'INR'
      },
      address,
      emergencyContact,
      bankDetails
    };

    const employee = new Employee(employeeData);
    await employee.save();

    const populatedEmployee = await Employee.findById(employee._id)
      .populate('user', 'firstName lastName email role department')
      .populate('reportingManager', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: populatedEmployee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating employee',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin, HR, Employee - own profile)
const updateEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check permissions (admin, HR, or own profile)
    const canUpdate = req.user.role === 'admin' || 
                     req.user.role === 'manager' || 
                     employee.user.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this employee'
      });
    }

    const {
      phone,
      reportingManager,
      linkedin,
      skills,
      address,
      emergencyContact,
      bankDetails,
      salary
    } = req.body;

    // Update fields
    if (phone) employee.phone = phone;
    if (reportingManager) employee.reportingManager = reportingManager;
    if (linkedin) employee.linkedin = linkedin;
    if (skills) employee.skills = skills;
    if (address) employee.address = address;
    if (emergencyContact) employee.emergencyContact = emergencyContact;
    if (bankDetails) employee.bankDetails = bankDetails;
    if (salary) {
      employee.salary = {
        ...employee.salary,
        ...salary
      };
    }

    await employee.save();

    const updatedEmployee = await Employee.findById(employee._id)
      .populate('user', 'firstName lastName email role department')
      .populate('reportingManager', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating employee',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Upload employee document
// @route   POST /api/employees/:id/documents
// @access  Private (Admin, HR, Employee - own documents)
const uploadDocument = async (req, res) => {
  try {
    const { documentType, filename, path } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check permissions
    const canUpload = req.user.role === 'admin' || 
                     req.user.role === 'manager' || 
                     employee.user.toString() === req.user._id.toString();

    if (!canUpload) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload documents for this employee'
      });
    }

    employee.documents.push({
      type: documentType,
      filename,
      path,
      uploadedAt: new Date()
    });

    await employee.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: employee.documents[employee.documents.length - 1]
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading document',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update onboarding status
// @route   PUT /api/employees/:id/onboarding
// @access  Private (Admin, HR)
const updateOnboardingStatus = async (req, res) => {
  try {
    const { step, isCompleted } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (isCompleted) {
      // Add to completed steps
      employee.onboardingStatus.completedSteps.push({
        step,
        completedAt: new Date(),
        completedBy: req.user._id
      });

      // Remove from pending steps
      employee.onboardingStatus.pendingSteps = employee.onboardingStatus.pendingSteps.filter(
        s => s !== step
      );

      // Check if all steps are completed
      if (employee.onboardingStatus.pendingSteps.length === 0) {
        employee.onboardingStatus.isCompleted = true;
      }
    } else {
      // Add to pending steps
      if (!employee.onboardingStatus.pendingSteps.includes(step)) {
        employee.onboardingStatus.pendingSteps.push(step);
      }

      // Remove from completed steps
      employee.onboardingStatus.completedSteps = employee.onboardingStatus.completedSteps.filter(
        s => s.step !== step
      );

      employee.onboardingStatus.isCompleted = false;
    }

    await employee.save();

    res.json({
      success: true,
      message: 'Onboarding status updated successfully',
      data: employee.onboardingStatus
    });
  } catch (error) {
    console.error('Update onboarding status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating onboarding status',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Initiate offboarding
// @route   POST /api/employees/:id/offboarding
// @access  Private (Admin, HR)
const initiateOffboarding = async (req, res) => {
  try {
    const { exitDate, pendingSteps } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    employee.offboardingStatus.isInitiated = true;
    employee.offboardingStatus.initiatedAt = new Date();
    employee.offboardingStatus.exitDate = exitDate;
    employee.offboardingStatus.pendingSteps = pendingSteps || [];
    employee.status = 'exited';

    await employee.save();

    res.json({
      success: true,
      message: 'Offboarding initiated successfully',
      data: employee.offboardingStatus
    });
  } catch (error) {
    console.error('Initiate offboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while initiating offboarding',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get employees by department
// @route   GET /api/employees/department/:department
// @access  Private
const getEmployeesByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const employees = await Employee.getByDepartment(department);

    res.json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('Get employees by department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employees by department',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get employees by status
// @route   GET /api/employees/status/:status
// @access  Private
const getEmployeesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const employees = await Employee.getByStatus(status);

    res.json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('Get employees by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employees by status',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get my employee profile
// @route   GET /api/employees/my-profile
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id })
      .populate('user', 'firstName lastName email role department')
      .populate('reportingManager', 'firstName lastName email role department');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  uploadDocument,
  updateOnboardingStatus,
  initiateOffboarding,
  getEmployeesByDepartment,
  getEmployeesByStatus,
  getMyProfile
}; 