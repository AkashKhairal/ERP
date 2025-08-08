const { 
  YouTubeContent, 
  ShortsReels, 
  Course, 
  Asset, 
  Review, 
  ContentPerformance, 
  ContentComment 
} = require('../models/Content');
const { validationResult } = require('express-validator');

// ==================== YOUTUBE CONTENT CONTROLLERS ====================

// @desc    Get all YouTube content
// @route   GET /api/content/youtube
// @access  Private
const getYouTubeContent = async (req, res) => {
  try {
    const { 
      status, 
      category, 
      assignedTo, 
      sortBy = 'createdAt', 
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (assignedTo) {
      filter.$or = [
        { 'assignedTo.writer': assignedTo },
        { 'assignedTo.editor': assignedTo },
        { 'assignedTo.reviewer': assignedTo }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const content = await YouTubeContent.find(filter)
      .populate('assignedTo.writer assignedTo.editor assignedTo.reviewer', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await YouTubeContent.countDocuments(filter);

    res.json({
      success: true,
      data: {
        content,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get YouTube content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching YouTube content',
      error: error.message
    });
  }
};

// @desc    Create YouTube content
// @route   POST /api/content/youtube
// @access  Private
const createYouTubeContent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const contentData = {
      ...req.body,
      createdBy: req.user.id
    };

    const content = await YouTubeContent.create(contentData);
    
    const populatedContent = await YouTubeContent.findById(content._id)
      .populate('assignedTo.writer assignedTo.editor assignedTo.reviewer', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      data: populatedContent
    });
  } catch (error) {
    console.error('Create YouTube content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating YouTube content',
      error: error.message
    });
  }
};

// @desc    Update YouTube content
// @route   PUT /api/content/youtube/:id
// @access  Private
const updateYouTubeContent = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const content = await YouTubeContent.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo.writer assignedTo.editor assignedTo.reviewer', 'firstName lastName email')
     .populate('createdBy', 'firstName lastName');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'YouTube content not found'
      });
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Update YouTube content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating YouTube content',
      error: error.message
    });
  }
};

// @desc    Delete YouTube content
// @route   DELETE /api/content/youtube/:id
// @access  Private
const deleteYouTubeContent = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await YouTubeContent.findByIdAndDelete(id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'YouTube content not found'
      });
    }

    res.json({
      success: true,
      message: 'YouTube content deleted successfully'
    });
  } catch (error) {
    console.error('Delete YouTube content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting YouTube content',
      error: error.message
    });
  }
};

// ==================== SHORTS/REELS CONTROLLERS ====================

// @desc    Get all shorts/reels
// @route   GET /api/content/shorts
// @access  Private
const getShortsReels = async (req, res) => {
  try {
    const { 
      status, 
      platform, 
      assignedTo, 
      sortBy = 'deadline', 
      order = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (platform) filter.platform = platform;
    if (assignedTo) filter.assignedTo = assignedTo;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const shorts = await ShortsReels.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ShortsReels.countDocuments(filter);

    res.json({
      success: true,
      data: {
        shorts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get shorts/reels error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shorts/reels',
      error: error.message
    });
  }
};

// @desc    Create shorts/reels
// @route   POST /api/content/shorts
// @access  Private
const createShortsReels = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const shortsData = {
      ...req.body,
      createdBy: req.user.id
    };

    const shorts = await ShortsReels.create(shortsData);
    
    const populatedShorts = await ShortsReels.findById(shorts._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      data: populatedShorts
    });
  } catch (error) {
    console.error('Create shorts/reels error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating shorts/reels',
      error: error.message
    });
  }
};

// @desc    Update shorts/reels
// @route   PUT /api/content/shorts/:id
// @access  Private
const updateShortsReels = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const shorts = await ShortsReels.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'firstName lastName email')
     .populate('createdBy', 'firstName lastName');

    if (!shorts) {
      return res.status(404).json({
        success: false,
        message: 'Shorts/reels not found'
      });
    }

    res.json({
      success: true,
      data: shorts
    });
  } catch (error) {
    console.error('Update shorts/reels error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating shorts/reels',
      error: error.message
    });
  }
};

// ==================== COURSE CONTROLLERS ====================

// @desc    Get all courses
// @route   GET /api/content/courses
// @access  Private
const getCourses = async (req, res) => {
  try {
    const { 
      status, 
      delivery, 
      createdBy, 
      sortBy = 'createdAt', 
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (delivery) filter.delivery = delivery;
    if (createdBy) filter.createdBy = createdBy;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const courses = await Course.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .populate('modules.lessons.assignedTo.writer modules.lessons.assignedTo.editor modules.lessons.assignedTo.instructor', 'firstName lastName email')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// @desc    Create course
// @route   POST /api/content/courses
// @access  Private
const createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const courseData = {
      ...req.body,
      createdBy: req.user.id
    };

    const course = await Course.create(courseData);
    
    const populatedCourse = await Course.findById(course._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('modules.lessons.assignedTo.writer modules.lessons.assignedTo.editor modules.lessons.assignedTo.instructor', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: populatedCourse
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/content/courses/:id
// @access  Private
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const course = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email')
     .populate('updatedBy', 'firstName lastName email')
     .populate('modules.lessons.assignedTo.writer modules.lessons.assignedTo.editor modules.lessons.assignedTo.instructor', 'firstName lastName email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

// ==================== ASSET MANAGEMENT CONTROLLERS ====================

// @desc    Get all assets
// @route   GET /api/content/assets
// @access  Private
const getAssets = async (req, res) => {
  try {
    const { 
      category, 
      fileType, 
      owner, 
      tags, 
      isPublic,
      sortBy = 'createdAt', 
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (fileType) filter.fileType = fileType;
    if (owner) filter.owner = owner;
    if (tags) filter.tags = { $in: tags.split(',') };
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const assets = await Asset.find(filter)
      .populate('owner', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Asset.countDocuments(filter);

    res.json({
      success: true,
      data: {
        assets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assets',
      error: error.message
    });
  }
};

// @desc    Create asset
// @route   POST /api/content/assets
// @access  Private
const createAsset = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const assetData = {
      ...req.body,
      owner: req.body.owner || req.user.id,
      createdBy: req.user.id
    };

    const asset = await Asset.create(assetData);
    
    const populatedAsset = await Asset.findById(asset._id)
      .populate('owner', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      data: populatedAsset
    });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating asset',
      error: error.message
    });
  }
};

// ==================== REVIEW & APPROVAL CONTROLLERS ====================

// @desc    Get reviews for content
// @route   GET /api/content/reviews
// @access  Private
const getReviews = async (req, res) => {
  try {
    const { 
      contentType, 
      contentId, 
      reviewer, 
      status,
      sortBy = 'createdAt', 
      order = 'desc'
    } = req.query;

    const filter = {};
    if (contentType) filter.contentType = contentType;
    if (contentId) filter.contentId = contentId;
    if (reviewer) filter.reviewer = reviewer;
    if (status) filter.status = status;

    const reviews = await Review.find(filter)
      .populate('reviewer', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('comments.user', 'firstName lastName email')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 });

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// @desc    Create review
// @route   POST /api/content/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const reviewData = {
      ...req.body,
      createdBy: req.user.id
    };

    const review = await Review.create(reviewData);
    
    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('comments.user', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: populatedReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

// @desc    Update review status
// @route   PUT /api/content/reviews/:id/status
// @access  Private
const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.status = status;
    review.reviewDate = new Date();
    
    if (comment) {
      review.comments.push({
        comment,
        user: req.user.id
      });
    }

    await review.save();
    
    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('comments.user', 'firstName lastName email');

    res.json({
      success: true,
      data: populatedReview
    });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review status',
      error: error.message
    });
  }
};

// ==================== CONTENT PERFORMANCE CONTROLLERS ====================

// @desc    Get content performance
// @route   GET /api/content/performance
// @access  Private
const getContentPerformance = async (req, res) => {
  try {
    const { 
      contentType, 
      contentId, 
      platform, 
      startDate, 
      endDate,
      sortBy = 'date', 
      order = 'desc'
    } = req.query;

    const filter = {};
    if (contentType) filter.contentType = contentType;
    if (contentId) filter.contentId = contentId;
    if (platform) filter.platform = platform;
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const performance = await ContentPerformance.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 });

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Get content performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content performance',
      error: error.message
    });
  }
};

// @desc    Create content performance
// @route   POST /api/content/performance
// @access  Private
const createContentPerformance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const performanceData = {
      ...req.body,
      createdBy: req.user.id
    };

    const performance = await ContentPerformance.create(performanceData);
    
    const populatedPerformance = await ContentPerformance.findById(performance._id)
      .populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: populatedPerformance
    });
  } catch (error) {
    console.error('Create content performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating content performance',
      error: error.message
    });
  }
};

// ==================== CONTENT COMMENTS CONTROLLERS ====================

// @desc    Get content comments
// @route   GET /api/content/comments
// @access  Private
const getContentComments = async (req, res) => {
  try {
    const { 
      contentType, 
      contentId, 
      parentComment,
      sortBy = 'createdAt', 
      order = 'desc'
    } = req.query;

    const filter = {};
    if (contentType) filter.contentType = contentType;
    if (contentId) filter.contentId = contentId;
    if (parentComment) filter.parentComment = parentComment;

    const comments = await ContentComment.find(filter)
      .populate('user', 'firstName lastName email avatar')
      .populate('parentComment')
      .populate('mentions', 'firstName lastName email')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 });

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Get content comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content comments',
      error: error.message
    });
  }
};

// @desc    Create content comment
// @route   POST /api/content/comments
// @access  Private
const createContentComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const commentData = {
      ...req.body,
      user: req.user.id
    };

    const comment = await ContentComment.create(commentData);
    
    const populatedComment = await ContentComment.findById(comment._id)
      .populate('user', 'firstName lastName email avatar')
      .populate('parentComment')
      .populate('mentions', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: populatedComment
    });
  } catch (error) {
    console.error('Create content comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating content comment',
      error: error.message
    });
  }
};

// ==================== DASHBOARD CONTROLLERS ====================

// @desc    Get content dashboard
// @route   GET /api/content/dashboard
// @access  Private
const getContentDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    // Get content counts by status
    const youtubeStats = await YouTubeContent.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const shortsStats = await ShortsReels.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const courseStats = await Course.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get overdue content
    const overdueYouTube = await YouTubeContent.countDocuments({
      publishDate: { $lt: new Date() },
      status: { $nin: ['published', 'archived'] }
    });

    const overdueShorts = await ShortsReels.countDocuments({
      deadline: { $lt: new Date() },
      status: { $nin: ['posted', 'archived'] }
    });

    // Get pending reviews
    const pendingReviews = await Review.countDocuments({
      status: 'pending'
    });

    const dashboardData = {
      youtube: {
        stats: youtubeStats,
        overdue: overdueYouTube
      },
      shorts: {
        stats: shortsStats,
        overdue: overdueShorts
      },
      courses: {
        stats: courseStats
      },
      reviews: {
        pending: pendingReviews
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get content dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content dashboard',
      error: error.message
    });
  }
};

module.exports = {
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
}; 