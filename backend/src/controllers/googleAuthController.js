const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AuditLog = require('../models/AuditLog');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Google Sign-In
// @route   POST /api/auth/google
// @access  Public
const googleSignIn = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required'
      });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { 
      email, 
      name, 
      picture, 
      sub: googleId,
      given_name: firstName,
      family_name: lastName,
      locale,
      email_verified,
      hd: hostedDomain
    } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with Google data
      // Use Google's given_name and family_name if available, otherwise split the name
      const userFirstName = firstName || name.split(' ')[0];
      const userLastName = lastName || name.split(' ').slice(1).join(' ') || '';

      user = new User({
        firstName: userFirstName,
        lastName: userLastName,
        email,
        password: `google_${googleId}`, // Placeholder password for Google users
        avatar: picture,
        department: 'operations', // Default department
        position: 'Team Member',
        isActive: true,
        lastLogin: new Date(),
        // Store additional Google info
        preferences: {
          theme: 'auto',
          notifications: {
            email: true,
            push: true,
            slack: false
          },
          timezone: 'UTC'
        },
        // Assign default Employee role
        roles: [] // Will be populated with default role
      });

      await user.save();

      // Log the action
      await AuditLog.logEvent({
        user: user._id,
        action: 'user_created',
        resource: 'user',
        resourceId: user._id,
        details: {
          module: 'auth',
          action: 'google_signup',
          newValue: { 
            firstName: userFirstName, 
            lastName: userLastName, 
            email, 
            source: 'google',
            avatar: picture,
            locale,
            emailVerified: email_verified,
            hostedDomain
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      console.log(`New user created via Google Sign-In: ${email}`);
    } else {
      // Update existing user's Google info
      let updated = false;
      
      // Update avatar if not present or if Google has a better one
      if (picture && (!user.avatar || user.avatar !== picture)) {
        user.avatar = picture;
        updated = true;
      }
      
      // Update name if Google provides better data
      if (firstName && user.firstName !== firstName) {
        user.firstName = firstName;
        updated = true;
      }
      
      if (lastName && user.lastName !== lastName) {
        user.lastName = lastName;
        updated = true;
      }
      
      // Update last login
      user.lastLogin = new Date();
      updated = true;
      
      if (updated) {
        await user.save();
      }

      // Log the action
      await AuditLog.logEvent({
        user: user._id,
        action: 'login',
        resource: 'user',
        resourceId: user._id,
        details: {
          module: 'auth',
          action: 'google_login',
          newValue: {
            avatar: picture,
            firstName,
            lastName,
            locale,
            emailVerified: email_verified
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      console.log(`User logged in via Google: ${email}`);
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id);

    // Return user data and token
    res.json({
      success: true,
      message: 'Google Sign-In successful',
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          department: user.department,
          position: user.position,
          roles: user.roles,
          lastLogin: user.lastLogin,
          preferences: user.preferences,
          isActive: user.isActive,
          hireDate: user.hireDate
        },
        token: jwtToken,
        googleInfo: {
          locale,
          emailVerified: email_verified,
          hostedDomain,
          picture
        }
      }
    });

  } catch (error) {
    console.error('Google Sign-In error:', error);
    
    if (error.message.includes('Token used too late')) {
      return res.status(400).json({
        success: false,
        message: 'Google token has expired. Please try signing in again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Google Sign-In failed',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get Google OAuth URL
// @route   GET /api/auth/google/url
// @access  Public
const getGoogleAuthUrl = async (req, res) => {
  try {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback')}&` +
      `response_type=code&` +
      `scope=openid email profile&` +
      `access_type=offline&` +
      `prompt=consent`;

    res.json({
      success: true,
      data: { authUrl }
    });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Google auth URL'
    });
  }
};

module.exports = {
  googleSignIn,
  getGoogleAuthUrl
}; 