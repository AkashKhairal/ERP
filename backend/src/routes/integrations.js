const express = require('express');
const { protect, checkPermission } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// YouTube integration
router.get('/youtube/channels', checkPermission('integrations', 'read'), (req, res) => {
  res.json({ message: 'Get YouTube channels - to be implemented' });
});

router.get('/youtube/videos', checkPermission('integrations', 'read'), (req, res) => {
  res.json({ message: 'Get YouTube videos - to be implemented' });
});

// Slack integration
router.get('/slack/channels', checkPermission('integrations', 'read'), (req, res) => {
  res.json({ message: 'Get Slack channels - to be implemented' });
});

router.post('/slack/send-message', checkPermission('integrations', 'create'), (req, res) => {
  res.json({ message: 'Send Slack message - to be implemented' });
});

// Stripe integration
router.get('/stripe/transactions', checkPermission('integrations', 'read'), (req, res) => {
  res.json({ message: 'Get Stripe transactions - to be implemented' });
});

router.get('/stripe/subscriptions', checkPermission('integrations', 'read'), (req, res) => {
  res.json({ message: 'Get Stripe subscriptions - to be implemented' });
});

// Notion integration
router.get('/notion/pages', checkPermission('integrations', 'read'), (req, res) => {
  res.json({ message: 'Get Notion pages - to be implemented' });
});

router.post('/notion/create-page', checkPermission('integrations', 'create'), (req, res) => {
  res.json({ message: 'Create Notion page - to be implemented' });
});

module.exports = router; 