const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./src/models/User');
const Notification = require('./src/models/Notification');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase-erp';

console.log('🧪 Testing API Endpoint for Notifications\n');

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

// Test endpoint to get notifications without authentication
app.get('/test-notifications/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log(`🔍 Testing notifications for: ${email}`);
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        email: email
      });
    }
    
    console.log(`👤 Found user: ${user.firstName} ${user.lastName} (${user._id})`);
    
    // Get notifications for this user
    const notifications = await Notification.find({
      recipient: user._id,
      isActive: true
    }).populate('sender', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${notifications.length} notifications for ${email}`);
    
    // Format response
    const response = {
      success: true,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      },
      data: {
        notifications: notifications.map(notif => ({
          id: notif._id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          category: notif.category,
          priority: notif.priority,
          isRead: notif.isRead,
          createdAt: notif.createdAt,
          sender: notif.sender ? {
            name: `${notif.sender.firstName} ${notif.sender.lastName}`,
            email: notif.sender.email
          } : null
        })),
        total: notifications.length,
        unread: notifications.filter(n => !n.isRead).length
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Test API server is running'
  });
});

async function startTestServer() {
  await connectDB();
  
  const PORT = 3001; // Different port to avoid conflicts
  app.listen(PORT, () => {
    console.log(`🚀 Test API server running on http://localhost:${PORT}`);
    console.log(`\n📋 Test URLs:`);
    console.log(`   Health Check: http://localhost:${PORT}/health`);
    console.log(`   Test Notifications: http://localhost:${PORT}/test-notifications/akashkhairal@gmail.com`);
    console.log(`\n💡 Instructions:`);
    console.log(`   1. Open your browser`);
    console.log(`   2. Go to: http://localhost:${PORT}/test-notifications/akashkhairal@gmail.com`);
    console.log(`   3. Check if notifications are returned`);
    console.log(`   4. Press Ctrl+C to stop this test server`);
  });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down test server...');
  await mongoose.disconnect();
  console.log('📴 Database disconnected');
  process.exit(0);
});

startTestServer().catch(console.error);
