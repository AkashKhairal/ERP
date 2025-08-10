const mongoose = require('mongoose');

// YouTube Content Schema
const youtubeContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  category: {
    type: String,
    enum: ['tutorial', 'vlog', 'project', 'interview', 'review', 'educational', 'entertainment'],
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  scriptLink: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['idea', 'script_ready', 'recording', 'editing', 'scheduled', 'published', 'archived'],
    default: 'idea'
  },
  publishDate: {
    type: Date
  },
  assignedTo: {
    writer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  assets: {
    script: { type: String, trim: true },
    thumbnail: { type: String, trim: true },
    finalVideo: { type: String, trim: true },
    captionFile: { type: String, trim: true },
    rawFootage: { type: String, trim: true }
  },
  performance: {
    views: { type: Number, default: 0 },
    watchTime: { type: Number, default: 0 }, // in minutes
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 }, // Click Through Rate
    rpm: { type: Number, default: 0 }, // Revenue Per Mille
    revenue: { type: Number, default: 0 }
  },
  seoKeywords: [{
    type: String,
    trim: true
  }],
  seoDescription: {
    type: String,
    trim: true,
    maxlength: [300, 'SEO description cannot exceed 300 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Shorts/Reels Schema
const shortsReelsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  hookLine: {
    type: String,
    required: true,
    trim: true,
    maxlength: [300, 'Hook line cannot exceed 300 characters']
  },
  format: {
    type: String,
    enum: ['reel', 'short', 'carousel', 'story', 'post'],
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    enum: ['instagram', 'youtube_shorts', 'linkedin', 'tiktok', 'twitter'],
    required: true
  },
  hashtags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['idea', 'draft', 'edited', 'scheduled', 'posted', 'archived'],
    default: 'idea'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  publishDate: {
    type: Date
  },
  assets: {
    video: { type: String, trim: true },
    thumbnail: { type: String, trim: true },
    caption: { type: String, trim: true }
  },
  performance: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    reach: { type: Number, default: 0 }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Course Schema
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Course title cannot exceed 200 characters']
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  delivery: {
    type: String,
    enum: ['self_paced', 'live', 'hybrid'],
    default: 'self_paced'
  },
  status: {
    type: String,
    enum: ['planning', 'scripting', 'recording', 'editing', 'live', 'archived'],
    default: 'planning'
  },
  duration: {
    type: Number, // Total duration in minutes
    default: 0
  },
  modules: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    order: {
      type: Number,
      required: true
    },
    lessons: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      videoFile: {
        type: String,
        trim: true
      },
      duration: {
        type: Number, // in minutes
        default: 0
      },
      notes: {
        type: String,
        trim: true
      },
      quiz: {
        questions: [{
          question: { type: String, required: true },
          options: [{ type: String }],
          correctAnswer: { type: Number, required: true }
        }]
      },
      order: {
        type: Number,
        required: true
      },
      status: {
        type: String,
        enum: ['draft', 'recording', 'editing', 'completed'],
        default: 'draft'
      },
      assignedTo: {
        writer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        editor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    }]
  }],
  resources: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['pdf', 'slides', 'source_code', 'document', 'other'],
      required: true
    },
    fileLink: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  enrollmentCount: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Asset Management Schema
const assetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Asset title cannot exceed 200 characters']
  },
  category: {
    type: String,
    enum: ['scripts', 'thumbnails', 'raw_footage', 'final_renders', 'slide_decks', 'pdfs', 'source_code', 'other'],
    required: true
  },
  fileType: {
    type: String,
    enum: ['video', 'image', 'document', 'audio', 'archive', 'other'],
    required: true
  },
  fileLink: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number // in bytes
  },
  tags: [{
    type: String,
    trim: true
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permission: { type: String, enum: ['view', 'edit', 'admin'], default: 'view' }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Review & Approval Schema
const reviewSchema = new mongoose.Schema({
  contentType: {
    type: String,
    enum: ['youtube', 'shorts', 'course', 'lesson'],
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'needs_revision'],
    default: 'pending'
  },
  comments: [{
    comment: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  reviewDate: {
    type: Date
  },
  revisionNotes: {
    type: String,
    trim: true
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Content Performance Schema
const contentPerformanceSchema = new mongoose.Schema({
  contentType: {
    type: String,
    enum: ['youtube', 'shorts', 'course'],
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  metrics: {
    views: { type: Number, default: 0 },
    watchTime: { type: Number, default: 0 }, // in minutes
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    rpm: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    retentionRate: { type: Number, default: 0 }
  },
  platform: {
    type: String,
    enum: ['youtube', 'instagram', 'linkedin', 'tiktok', 'twitter'],
    required: true
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Content Comment Schema
const contentCommentSchema = new mongoose.Schema({
  contentType: {
    type: String,
    enum: ['youtube', 'shorts', 'course', 'lesson'],
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentComment'
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

// Indexes for performance optimization
youtubeContentSchema.index({ status: 1, category: 1 });
youtubeContentSchema.index({ publishDate: 1 });
youtubeContentSchema.index({ 'assignedTo.writer': 1 });
youtubeContentSchema.index({ 'assignedTo.editor': 1 });
youtubeContentSchema.index({ 'assignedTo.reviewer': 1 });

shortsReelsSchema.index({ status: 1, platform: 1 });
shortsReelsSchema.index({ assignedTo: 1 });
shortsReelsSchema.index({ deadline: 1 });
shortsReelsSchema.index({ publishDate: 1 });

courseSchema.index({ status: 1, delivery: 1 });
courseSchema.index({ createdBy: 1 });
courseSchema.index({ 'modules.lessons.assignedTo.writer': 1 });
courseSchema.index({ 'modules.lessons.assignedTo.editor': 1 });

assetSchema.index({ category: 1, fileType: 1 });
assetSchema.index({ owner: 1 });
assetSchema.index({ tags: 1 });
assetSchema.index({ isPublic: 1 });

reviewSchema.index({ contentType: 1, contentId: 1 });
reviewSchema.index({ reviewer: 1, status: 1 });
reviewSchema.index({ status: 1 });

contentPerformanceSchema.index({ contentType: 1, contentId: 1 });
contentPerformanceSchema.index({ date: 1 });
contentPerformanceSchema.index({ platform: 1 });

contentCommentSchema.index({ contentType: 1, contentId: 1 });
contentCommentSchema.index({ user: 1 });
contentCommentSchema.index({ parentComment: 1 });

// Virtual properties
youtubeContentSchema.virtual('engagementRate').get(function() {
  if (this.performance.views === 0) return 0;
  return ((this.performance.likes + this.performance.comments + this.performance.shares) / this.performance.views) * 100;
});

youtubeContentSchema.virtual('isOverdue').get(function() {
  if (this.publishDate && this.status !== 'published') {
    return new Date() > this.publishDate;
  }
  return false;
});

shortsReelsSchema.virtual('isOverdue').get(function() {
  if (this.deadline && this.status !== 'posted') {
    return new Date() > this.deadline;
  }
  return false;
});

courseSchema.virtual('totalLessons').get(function() {
  return this.modules.reduce((total, module) => {
    return total + module.lessons.length;
  }, 0);
});

courseSchema.virtual('completedLessons').get(function() {
  return this.modules.reduce((total, module) => {
    return total + module.lessons.filter(lesson => lesson.status === 'completed').length;
  }, 0);
});

courseSchema.virtual('completionPercentage').get(function() {
  if (this.totalLessons === 0) return 0;
  return (this.completedLessons / this.totalLessons) * 100;
});

// Static methods
youtubeContentSchema.statics.getContentByStatus = function(status) {
  return this.find({ status }).populate('assignedTo.writer assignedTo.editor assignedTo.reviewer', 'firstName lastName email');
};

youtubeContentSchema.statics.getOverdueContent = function() {
  return this.find({
    publishDate: { $lt: new Date() },
    status: { $nin: ['published', 'archived'] }
  }).populate('assignedTo.writer assignedTo.editor assignedTo.reviewer', 'firstName lastName email');
};

shortsReelsSchema.statics.getOverdueShorts = function() {
  return this.find({
    deadline: { $lt: new Date() },
    status: { $nin: ['posted', 'archived'] }
  }).populate('assignedTo', 'firstName lastName email');
};

courseSchema.statics.getCoursesByStatus = function(status) {
  return this.find({ status }).populate('createdBy', 'firstName lastName email');
};

assetSchema.statics.getAssetsByCategory = function(category) {
  return this.find({ category }).populate('owner', 'firstName lastName email');
};

// Pre-save middleware
youtubeContentSchema.pre('save', function(next) {
  // Auto-calculate engagement rate
  if (this.performance.views > 0) {
    this.performance.engagementRate = ((this.performance.likes + this.performance.comments + this.performance.shares) / this.performance.views) * 100;
  }
  
  next();
});

courseSchema.pre('save', function(next) {
  // Calculate total duration
  this.duration = this.modules.reduce((total, module) => {
    return total + module.lessons.reduce((moduleTotal, lesson) => {
      return moduleTotal + lesson.duration;
    }, 0);
  }, 0);
  
  next();
});

// Create models
const YouTubeContent = mongoose.model('YouTubeContent', youtubeContentSchema);
const ShortsReels = mongoose.model('ShortsReels', shortsReelsSchema);
const Course = mongoose.model('Course', courseSchema);
const Asset = mongoose.model('Asset', assetSchema);
const Review = mongoose.model('Review', reviewSchema);
const ContentPerformance = mongoose.model('ContentPerformance', contentPerformanceSchema);
const ContentComment = mongoose.model('ContentComment', contentCommentSchema);

module.exports = {
  YouTubeContent,
  ShortsReels,
  Course,
  Asset,
  Review,
  ContentPerformance,
  ContentComment
}; 