const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  // YouTube Content
  getYouTubeContent,
  createYouTubeContent,
  updateYouTubeContent,
  deleteYouTubeContent,
  
  // Shorts/Reels
  getShortsReels,
  createShortsReels,
  updateShortsReels,
  
  // Courses
  getCourses,
  createCourse,
  updateCourse,
  
  // Assets
  getAssets,
  createAsset,
  
  // Reviews
  getReviews,
  createReview,
  updateReviewStatus,
  
  // Performance
  getContentPerformance,
  createContentPerformance,
  
  // Comments
  getContentComments,
  createContentComment,
  
  // Dashboard
  getContentDashboard
} = require('../controllers/contentController');

const router = express.Router();

// Validation middleware
const youtubeContentValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('category').isIn(['tutorial', 'vlog', 'project', 'interview', 'review', 'educational', 'entertainment']).withMessage('Invalid category'),
  body('status').optional().isIn(['idea', 'script_ready', 'recording', 'editing', 'scheduled', 'published', 'archived']).withMessage('Invalid status'),
  body('publishDate').optional().isISO8601().withMessage('Invalid date format'),
  body('description').optional().isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters')
];

const shortsReelsValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('hookLine').trim().isLength({ min: 1, max: 300 }).withMessage('Hook line is required and must be less than 300 characters'),
  body('format').isIn(['reel', 'short', 'carousel', 'story', 'post']).withMessage('Invalid format'),
  body('platform').isIn(['instagram', 'youtube_shorts', 'linkedin', 'tiktok', 'twitter']).withMessage('Invalid platform'),
  body('topic').trim().isLength({ min: 1 }).withMessage('Topic is required'),
  body('assignedTo').isMongoId().withMessage('Invalid assigned user ID'),
  body('deadline').isISO8601().withMessage('Invalid deadline date format'),
  body('status').optional().isIn(['idea', 'draft', 'edited', 'scheduled', 'posted', 'archived']).withMessage('Invalid status')
];

const courseValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Course title is required and must be less than 200 characters'),
  body('topic').trim().isLength({ min: 1 }).withMessage('Topic is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('delivery').optional().isIn(['self_paced', 'live', 'hybrid']).withMessage('Invalid delivery type'),
  body('status').optional().isIn(['planning', 'scripting', 'recording', 'editing', 'live', 'archived']).withMessage('Invalid status'),
  body('description').optional().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters')
];

const assetValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Asset title is required and must be less than 200 characters'),
  body('category').isIn(['scripts', 'thumbnails', 'raw_footage', 'final_renders', 'slide_decks', 'pdfs', 'source_code', 'other']).withMessage('Invalid category'),
  body('fileType').isIn(['video', 'image', 'document', 'audio', 'archive', 'other']).withMessage('Invalid file type'),
  body('fileLink').trim().isLength({ min: 1 }).withMessage('File link is required'),
  body('owner').optional().isMongoId().withMessage('Invalid owner ID'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
];

const reviewValidation = [
  body('contentType').isIn(['youtube', 'shorts', 'course', 'lesson']).withMessage('Invalid content type'),
  body('contentId').isMongoId().withMessage('Invalid content ID'),
  body('reviewer').isMongoId().withMessage('Invalid reviewer ID'),
  body('status').optional().isIn(['pending', 'approved', 'rejected', 'needs_revision']).withMessage('Invalid status')
];

const performanceValidation = [
  body('contentType').isIn(['youtube', 'shorts', 'course']).withMessage('Invalid content type'),
  body('contentId').isMongoId().withMessage('Invalid content ID'),
  body('date').isISO8601().withMessage('Invalid date format'),
  body('platform').isIn(['youtube', 'instagram', 'linkedin', 'tiktok', 'twitter']).withMessage('Invalid platform'),
  body('metrics.views').optional().isNumeric().withMessage('Views must be a number'),
  body('metrics.watchTime').optional().isNumeric().withMessage('Watch time must be a number'),
  body('metrics.likes').optional().isNumeric().withMessage('Likes must be a number'),
  body('metrics.comments').optional().isNumeric().withMessage('Comments must be a number'),
  body('metrics.shares').optional().isNumeric().withMessage('Shares must be a number'),
  body('metrics.ctr').optional().isNumeric().withMessage('CTR must be a number'),
  body('metrics.rpm').optional().isNumeric().withMessage('RPM must be a number'),
  body('metrics.revenue').optional().isNumeric().withMessage('Revenue must be a number')
];

const commentValidation = [
  body('contentType').isIn(['youtube', 'shorts', 'course', 'lesson']).withMessage('Invalid content type'),
  body('contentId').isMongoId().withMessage('Invalid content ID'),
  body('comment').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment is required and cannot exceed 1000 characters'),
  body('parentComment').optional().isMongoId().withMessage('Invalid parent comment ID'),
  body('mentions').optional().isArray().withMessage('Mentions must be an array'),
  body('mentions.*').optional().isMongoId().withMessage('Invalid mention ID')
];

// ==================== DASHBOARD ROUTES ====================

// Get content dashboard
router.get('/dashboard', protect, getContentDashboard);

// ==================== YOUTUBE CONTENT ROUTES ====================

// Get all YouTube content
router.get('/youtube', protect, getYouTubeContent);

// Create YouTube content
router.post('/youtube',
  protect,
  youtubeContentValidation,
  createYouTubeContent
);

// Update YouTube content
router.put('/youtube/:id',
  protect,
  youtubeContentValidation,
  updateYouTubeContent
);

// Delete YouTube content
router.delete('/youtube/:id', protect, deleteYouTubeContent);

// ==================== SHORTS/REELS ROUTES ====================

// Get all shorts/reels
router.get('/shorts', protect, getShortsReels);

// Create shorts/reels
router.post('/shorts',
  protect,
  shortsReelsValidation,
  createShortsReels
);

// Update shorts/reels
router.put('/shorts/:id',
  protect,
  shortsReelsValidation,
  updateShortsReels
);

// ==================== COURSE ROUTES ====================

// Get all courses
router.get('/courses', protect, getCourses);

// Create course
router.post('/courses',
  protect,
  courseValidation,
  createCourse
);

// Update course
router.put('/courses/:id',
  protect,
  courseValidation,
  updateCourse
);

// ==================== ASSET MANAGEMENT ROUTES ====================

// Get all assets
router.get('/assets', protect, getAssets);

// Create asset
router.post('/assets',
  protect,
  assetValidation,
  createAsset
);

// ==================== REVIEW & APPROVAL ROUTES ====================

// Get reviews
router.get('/reviews', protect, getReviews);

// Create review
router.post('/reviews',
  protect,
  reviewValidation,
  createReview
);

// Update review status
router.put('/reviews/:id/status',
  protect,
  body('status').isIn(['pending', 'approved', 'rejected', 'needs_revision']).withMessage('Invalid status'),
  body('comment').optional().trim().isLength({ min: 1 }).withMessage('Comment cannot be empty'),
  updateReviewStatus
);

// ==================== CONTENT PERFORMANCE ROUTES ====================

// Get content performance
router.get('/performance', protect, getContentPerformance);

// Create content performance
router.post('/performance',
  protect,
  performanceValidation,
  createContentPerformance
);

// ==================== CONTENT COMMENTS ROUTES ====================

// Get content comments
router.get('/comments', protect, getContentComments);

// Create content comment
router.post('/comments',
  protect,
  commentValidation,
  createContentComment
);

module.exports = router; 