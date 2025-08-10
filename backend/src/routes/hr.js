const express = require('express')
const { protect } = require('../middleware/auth')
const { getHRStats } = require('../controllers/hrController')

const router = express.Router()

router.use(protect)

// GET /api/hr/stats
router.get('/stats', getHRStats)

module.exports = router


