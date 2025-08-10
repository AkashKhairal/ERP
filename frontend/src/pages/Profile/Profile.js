import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Save, 
  Edit,
  Bell,
  Building,
  EyeOff,
  Eye,
  Camera,
  Upload,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    bio: '',
    location: '',
    timezone: 'UTC',
    avatar: '',
    lastLogin: null,
    hireDate: null,
    isActive: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    projectUpdates: true,
    teamMessages: true,
    systemAlerts: false,
    marketingEmails: false
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
    passwordExpiry: 90
  });

  const [errors, setErrors] = useState({});

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Building }
  ];

  // Initialize profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        role: user.role || '',
        bio: user.bio || '',
        location: user.location || '',
        timezone: user.timezone || 'UTC',
        avatar: user.avatar || '',
        lastLogin: user.lastLogin || null,
        hireDate: user.hireDate || null,
        isActive: user.isActive || true
      });

      if (user.preferences?.notifications) {
        setNotifications({
          emailNotifications: user.preferences.notifications.email ?? true,
          pushNotifications: user.preferences.notifications.push ?? true,
          projectUpdates: user.preferences.notifications.projectUpdates ?? true,
          teamMessages: user.preferences.notifications.teamMessages ?? true,
          systemAlerts: user.preferences.notifications.systemAlerts ?? false,
          marketingEmails: user.preferences.notifications.marketingEmails ?? false
        });
      }

      if (user.preferences?.sessionTimeout) {
        setSecurity(prev => ({
          ...prev,
          sessionTimeout: user.preferences.sessionTimeout
        }));
      }
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (profileData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(profileData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (profileData.bio && profileData.bio.length > 500) {
      newErrors.bio = 'Bio cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field, value) => {
    setNotifications(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecurityChange = (field, value) => {
    setSecurity(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setProfileData(prev => ({ ...prev, avatar: '' }));
  };

  const saveProfile = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setIsLoading(true);
    try {
      const updateData = { ...profileData };
      
      // Add preferences
      updateData.preferences = {
        notifications,
        sessionTimeout: security.sessionTimeout
      };

      const result = await updateProfile(updateData);
      if (result.success) {
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitPasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (result.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Password changed successfully!');
      }
    } catch (error) {
      toast.error('Failed to change password');
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            isEditing 
              ? 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 hover:border-red-400' 
              : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 hover:border-blue-400'
          }`}
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          <span>{isEditing ? 'Cancel' : 'Edit'}</span>
        </button>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center space-x-6">
        <div className="relative group">
          {avatarPreview || profileData.avatar ? (
            <img 
              src={avatarPreview || profileData.avatar} 
              alt="Profile" 
              className="w-20 h-20 rounded-full border-2 border-gray-200 object-cover transition-all duration-200 group-hover:border-blue-300"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center transition-all duration-200 group-hover:from-blue-700 group-hover:to-purple-700">
              <span className="text-2xl font-bold text-white">
                {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
              </span>
            </div>
          )}
          
          {isEditing && (
            <div className="absolute -bottom-2 -right-2">
              <label className="cursor-pointer bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {isEditing && (avatarPreview || profileData.avatar) && (
          <button
            onClick={removeAvatar}
            className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
          >
            <X className="w-4 h-4" />
            <span>Remove</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) => handleProfileChange('firstName', e.target.value)}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            } ${!isEditing ? 'bg-gray-50' : ''}`}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.firstName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={profileData.lastName}
            onChange={(e) => handleProfileChange('lastName', e.target.value)}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            } ${!isEditing ? 'bg-gray-50' : ''}`}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.lastName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={profileData.email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => handleProfileChange('phone', e.target.value)}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            } ${!isEditing ? 'bg-gray-50' : ''}`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
          <select
            value={profileData.department}
            onChange={(e) => handleProfileChange('department', e.target.value)}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !isEditing ? 'bg-gray-50' : ''
            } border-gray-300`}
          >
            <option value="">Select Department</option>
            <option value="engineering">Engineering</option>
            <option value="content">Content</option>
            <option value="marketing">Marketing</option>
            <option value="finance">Finance</option>
            <option value="hr">HR</option>
            <option value="operations">Operations</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <input
            type="text"
            value={profileData.role}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
        <textarea
          value={profileData.bio}
          onChange={(e) => handleProfileChange('bio', e.target.value)}
          disabled={!isEditing}
          rows="4"
          maxLength="500"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            errors.bio ? 'border-red-500' : 'border-gray-300'
          } ${!isEditing ? 'bg-gray-50' : ''}`}
          placeholder="Tell us about yourself..."
        />
        <div className="flex justify-between items-center mt-1">
          {errors.bio && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.bio}
            </p>
          )}
          <span className="text-xs text-gray-500 ml-auto">
            {profileData.bio?.length || 0}/500
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={profileData.location}
            onChange={(e) => handleProfileChange('location', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="City, Country"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={profileData.timezone}
            onChange={(e) => handleProfileChange('timezone', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="UTC">UTC</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Asia/Shanghai">Shanghai (CST)</option>
          </select>
        </div>
      </div>

      {/* Google Account Information */}
      {user?.avatar && (
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google Account Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
              <input
                type="text"
                value={profileData.lastLogin ? new Date(profileData.lastLogin).toLocaleString() : 'Never'}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${profileData.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-700">
                  {profileData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
              <input
                type="text"
                value={profileData.hireDate ? new Date(profileData.hireDate).toLocaleDateString() : 'N/A'}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="flex items-center justify-end space-x-3 pt-6 border-t">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveProfile}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      )}
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>

      {/* Change Password */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Change Password</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm new password"
            />
          </div>

          <button
            onClick={submitPasswordChange}
            disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 flex items-center space-x-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Shield className="w-4 h-4" />
            )}
            <span>{isLoading ? 'Changing Password...' : 'Change Password'}</span>
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-md font-medium text-gray-900">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
          </div>
          <button
            onClick={() => handleSecurityChange('twoFactorAuth', !security.twoFactorAuth)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
              security.twoFactorAuth 
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md transform hover:scale-105' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-sm'
            }`}
          >
            {security.twoFactorAuth ? 'Enabled' : 'Enable'}
          </button>
        </div>
      </div>

      {/* Login Alerts */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-md font-medium text-gray-900">Login Alerts</h4>
            <p className="text-sm text-gray-600">Get notified of new login attempts</p>
          </div>
          <button
            onClick={() => handleSecurityChange('loginAlerts', !security.loginAlerts)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
              security.loginAlerts 
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md transform hover:scale-105' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-sm'
            }`}
          >
            {security.loginAlerts ? 'Enabled' : 'Enable'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end pt-6 border-t">
        <button
          onClick={saveProfile}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isLoading ? 'Saving...' : 'Save Security Settings'}</span>
        </button>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>

      <div className="space-y-4">
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200 hover:shadow-sm">
            <div>
              <h4 className="text-md font-medium text-gray-900">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h4>
              <p className="text-sm text-gray-600">
                Receive notifications for {key.toLowerCase().replace(/([A-Z])/g, ' $1')}
              </p>
            </div>
            <button
              onClick={() => handleNotificationChange(key, !value)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                value 
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md transform hover:scale-105' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-sm'
              }`}
            >
              {value ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end pt-6 border-t">
        <button
          onClick={saveProfile}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isLoading ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Account Preferences</h3>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-all duration-200">
        <h4 className="text-md font-medium text-gray-900 mb-4">Session Timeout</h4>
        <div className="flex items-center space-x-4">
          <select
            value={security.sessionTimeout}
            onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
            <option value={480}>8 hours</option>
          </select>
          <span className="text-sm text-gray-600">of inactivity</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">This setting controls how long your session remains active when you're not using the application.</p>
      </div>

      <div className="flex items-center justify-end pt-6 border-t">
        <button
          onClick={saveProfile}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isLoading ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Profile Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {profileData.avatar ? (
                <img 
                  src={profileData.avatar} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full border-2 border-gray-200 object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {profileData.firstName?.charAt(0) || 'U'}{profileData.lastName?.charAt(0) || ''}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {profileData.firstName && profileData.lastName 
                  ? `${profileData.firstName} ${profileData.lastName}` 
                  : 'Loading...'
                }
              </h2>
              <p className="text-gray-600">{profileData.email || 'Loading...'}</p>
              <p className="text-sm text-gray-500">
                {profileData.role && profileData.department 
                  ? `${profileData.role} • ${profileData.department}` 
                  : 'Loading...'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50 px-3 rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 px-3 rounded-t-lg'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'preferences' && renderPreferencesTab()}
        </div>
      </div>
    </div>
  );
};

export default Profile; 

            <option value="engineering">Engineering</option>

            <option value="content">Content</option>

            <option value="marketing">Marketing</option>

            <option value="finance">Finance</option>

            <option value="hr">HR</option>

            <option value="operations">Operations</option>

          </select>

        </div>



        <div>

          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>

          <input

            type="text"

            value={profileData.role}

            disabled

            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"

          />

        </div>

      </div>



      <div>

        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>

        <textarea

          value={profileData.bio}

          onChange={(e) => handleProfileChange('bio', e.target.value)}

          disabled={!isEditing}

          rows="4"

          maxLength="500"

          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${

            errors.bio ? 'border-red-500' : 'border-gray-300'

          } ${!isEditing ? 'bg-gray-50' : ''}`}

          placeholder="Tell us about yourself..."

        />

        <div className="flex justify-between items-center mt-1">

          {errors.bio && (

            <p className="text-sm text-red-600 flex items-center">

              <AlertCircle className="w-4 h-4 mr-1" />

              {errors.bio}

            </p>

          )}

          <span className="text-xs text-gray-500 ml-auto">

            {profileData.bio?.length || 0}/500

          </span>

        </div>

      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>

          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>

          <input

            type="text"

            value={profileData.location}

            onChange={(e) => handleProfileChange('location', e.target.value)}

            disabled={!isEditing}

            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"

            placeholder="City, Country"

          />

        </div>



        <div>

          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>

          <select

            value={profileData.timezone}

            onChange={(e) => handleProfileChange('timezone', e.target.value)}

            disabled={!isEditing}

            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"

          >

            <option value="UTC">UTC</option>

            <option value="America/Los_Angeles">Pacific Time (PT)</option>

            <option value="America/New_York">Eastern Time (ET)</option>

            <option value="America/Chicago">Central Time (CT)</option>

            <option value="America/Denver">Mountain Time (MT)</option>

            <option value="Europe/London">London (GMT)</option>

            <option value="Europe/Paris">Paris (CET)</option>

            <option value="Asia/Tokyo">Tokyo (JST)</option>

            <option value="Asia/Shanghai">Shanghai (CST)</option>

          </select>

        </div>

      </div>



      {/* Google Account Information */}

      {user?.avatar && (

        <div className="border-t pt-6">

          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">

            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">

              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>

              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>

              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>

              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>

            </svg>

            Google Account Information

          </h4>

          

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>

              <input

                type="text"

                value={profileData.lastLogin ? new Date(profileData.lastLogin).toLocaleString() : 'Never'}

                disabled

                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"

              />

            </div>

            

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>

              <div className="flex items-center space-x-2">

                <div className={`w-3 h-3 rounded-full ${profileData.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>

                <span className="text-sm text-gray-700">

                  {profileData.isActive ? 'Active' : 'Inactive'}

                </span>

              </div>

            </div>

            

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>

              <input

                type="text"

                value={profileData.hireDate ? new Date(profileData.hireDate).toLocaleDateString() : 'N/A'}

                disabled

                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"

              />

            </div>

          </div>

        </div>

      )}



      {isEditing && (

        <div className="flex items-center justify-end space-x-3 pt-6 border-t">

          <button

            onClick={() => setIsEditing(false)}

            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"

          >

            Cancel

          </button>

          <button

            onClick={saveProfile}

            disabled={isLoading}

            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"

          >

            {isLoading ? (

              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

            ) : (

              <Save className="w-4 h-4" />

            )}

            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>

          </button>

        </div>

      )}

    </div>

  );



  const renderSecurityTab = () => (

    <div className="space-y-6">

      <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>



      {/* Change Password */}

      <div className="bg-white border border-gray-200 rounded-lg p-6">

        <h4 className="text-md font-medium text-gray-900 mb-4">Change Password</h4>

        <div className="space-y-4">

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>

            <div className="relative">

              <input

                type={showPassword ? 'text' : 'password'}

                value={passwordData.currentPassword}

                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}

                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                placeholder="Enter current password"

              />

              <button

                type="button"

                onClick={() => setShowPassword(!showPassword)}

                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"

              >

                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}

              </button>

            </div>

          </div>



          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>

            <input

              type="password"

              value={passwordData.newPassword}

              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}

              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

              placeholder="Enter new password"

            />

          </div>



          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>

            <input

              type="password"

              value={passwordData.confirmPassword}

              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}

              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

              placeholder="Confirm new password"

            />

          </div>



          <button

            onClick={changePassword}

            disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}

            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"

          >

            {isLoading ? 'Changing Password...' : 'Change Password'}

          </button>

        </div>

      </div>



      {/* Two-Factor Authentication */}

      <div className="bg-white border border-gray-200 rounded-lg p-6">

        <div className="flex items-center justify-between">

          <div>

            <h4 className="text-md font-medium text-gray-900">Two-Factor Authentication</h4>

            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>

          </div>

          <button

            onClick={() => handleSecurityChange('twoFactorAuth', !security.twoFactorAuth)}

            className={`px-4 py-2 rounded-lg transition-colors ${

              security.twoFactorAuth 

                ? 'bg-green-600 text-white hover:bg-green-700' 

                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

            }`}

          >

            {security.twoFactorAuth ? 'Enabled' : 'Enable'}

          </button>

        </div>

      </div>



      {/* Login Alerts */}

      <div className="bg-white border border-gray-200 rounded-lg p-6">

        <div className="flex items-center justify-between">

          <div>

            <h4 className="text-md font-medium text-gray-900">Login Alerts</h4>

            <p className="text-sm text-gray-600">Get notified of new login attempts</p>

          </div>

          <button

            onClick={() => handleSecurityChange('loginAlerts', !security.loginAlerts)}

            className={`px-4 py-2 rounded-lg transition-colors ${

              security.loginAlerts 

                ? 'bg-green-600 text-white hover:bg-green-700' 

                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

            }`}

          >

            {security.loginAlerts ? 'Enabled' : 'Enable'}

          </button>

        </div>

      </div>

    </div>

  );



  const renderNotificationsTab = () => (

    <div className="space-y-6">

      <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>



      <div className="space-y-4">

        {Object.entries(notifications).map(([key, value]) => (

          <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">

            <div>

              <h4 className="text-md font-medium text-gray-900">

                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}

              </h4>

              <p className="text-sm text-gray-600">

                Receive notifications for {key.toLowerCase().replace(/([A-Z])/g, ' $1')}

              </p>

            </div>

            <button

              onClick={() => handleNotificationChange(key, !value)}

              className={`px-4 py-2 rounded-lg transition-colors ${

                value 

                  ? 'bg-green-600 text-white hover:bg-green-700' 

                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

              }`}

            >

              {value ? 'Enabled' : 'Disabled'}

            </button>

          </div>

        ))}

      </div>

    </div>

  );



  const renderPreferencesTab = () => (

    <div className="space-y-6">

      <h3 className="text-lg font-medium text-gray-900">Account Preferences</h3>



      <div className="bg-white border border-gray-200 rounded-lg p-6">

        <h4 className="text-md font-medium text-gray-900 mb-4">Session Timeout</h4>

        <div className="flex items-center space-x-4">

          <select

            value={security.sessionTimeout}

            onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}

            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

          >

            <option value={15}>15 minutes</option>

            <option value={30}>30 minutes</option>

            <option value={60}>1 hour</option>

            <option value={120}>2 hours</option>

            <option value={480}>8 hours</option>

          </select>

          <span className="text-sm text-gray-600">of inactivity</span>

        </div>

      </div>

    </div>

  );



  if (!user) {

    return (

      <div className="flex items-center justify-center h-64">

        <div className="text-center">

          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-gray-600">Loading profile...</p>

        </div>

      </div>

    );

  }



  return (

    <div className="p-6 max-w-4xl mx-auto">

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>

        <p className="text-gray-600">Manage your account settings and preferences</p>

      </div>



      <div className="bg-white rounded-lg shadow">

        {/* Profile Header */}

        <div className="border-b border-gray-200 p-6">

          <div className="flex items-center space-x-4">

            <div className="relative">

              {profileData.avatar ? (

                <img 

                  src={profileData.avatar} 

                  alt="Profile" 

                  className="w-16 h-16 rounded-full border-2 border-gray-200 object-cover"

                />

              ) : (

                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">

                  <span className="text-xl font-bold text-white">

                    {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}

                  </span>

                </div>

              )}

            </div>

            <div>

              <h2 className="text-xl font-semibold text-gray-900">

                {profileData.firstName} {profileData.lastName}

              </h2>

              <p className="text-gray-600">{profileData.email}</p>

              <p className="text-sm text-gray-500">

                {profileData.role} • {profileData.department}

              </p>

            </div>

          </div>

        </div>



        {/* Tabs */}

        <div className="border-b border-gray-200">

          <nav className="flex space-x-8 px-6">

            {tabs.map((tab) => (

              <button

                key={tab.id}

                onClick={() => setActiveTab(tab.id)}

                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${

                  activeTab === tab.id

                    ? 'border-blue-500 text-blue-600'

                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'

                }`}

              >

                <div className="flex items-center space-x-2">

                  <tab.icon className="w-4 h-4" />

                  <span>{tab.label}</span>

                </div>

              </button>

            ))}

          </nav>

        </div>



        {/* Tab Content */}

        <div className="p-6">

          {activeTab === 'profile' && renderProfileTab()}

          {activeTab === 'security' && renderSecurityTab()}

          {activeTab === 'notifications' && renderNotificationsTab()}

          {activeTab === 'preferences' && renderPreferencesTab()}

        </div>

      </div>

    </div>

  );

};



export default Profile; 
