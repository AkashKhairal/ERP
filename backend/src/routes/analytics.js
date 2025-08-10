const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  getDashboardOverview,
  getYouTubeAnalytics,
  getTeamProductivity,
  getProjectProgress,
  getCourseSales,
  createCustomReport,
  getCustomReports,
  generateCustomReport,
  getKPIs,
  createKPI
} = require('../controllers/analyticsController');

const router = express.Router();

// Validation middleware
const customReportValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Report name is required and must be less than 100 characters'),
  body('type').isIn(['dashboard', 'youtube', 'productivity', 'project', 'course', 'finance', 'custom']).withMessage('Invalid report type'),
  body('metrics').isArray().withMessage('Metrics must be an array'),
  body('visualization.type').optional().isIn(['bar', 'line', 'pie', 'table', 'heatmap']).withMessage('Invalid visualization type')
];

const kpiValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('KPI name is required and must be less than 100 characters'),
  body('category').isIn(['financial', 'operational', 'customer', 'learning']).withMessage('Invalid KPI category'),
  body('target').isNumeric().withMessage('Target must be a number'),
  body('unit').trim().isLength({ min: 1 }).withMessage('Unit is required'),
  body('period').isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid period')
];

// ==================== DASHBOARD ROUTES ====================

// Get analytics dashboard overview
router.get('/dashboard', protect, getDashboardOverview);

// ==================== YOUTUBE ANALYTICS ROUTES ====================

// Get YouTube analytics
router.get('/youtube', protect, getYouTubeAnalytics);

// ==================== TEAM PRODUCTIVITY ROUTES ====================

// Get team productivity reports
router.get('/productivity', protect, getTeamProductivity);

// ==================== PROJECT PROGRESS ROUTES ====================

// Get project progress reports
router.get('/projects', protect, getProjectProgress);

// ==================== COURSE SALES ROUTES ====================

// Get course sales analytics
router.get('/courses', protect, getCourseSales);

// ==================== CUSTOM REPORTS ROUTES ====================

// Get custom reports
router.get('/reports', protect, getCustomReports);

// Create custom report
router.post('/reports',
  protect,
  customReportValidation,
  createCustomReport
);

// Generate custom report data
router.post('/reports/:id/generate',
  protect,
  generateCustomReport
);

// ==================== KPI ROUTES ====================

// Get KPIs
router.get('/kpis', protect, getKPIs);

// Create KPI
router.post('/kpis',
  protect,
  kpiValidation,
  createKPI
);

module.exports = router; 