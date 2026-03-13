const User = require('../models/User');
const { db } = require('../config/firebase');

// Get user settings
const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user settings from Firebase
    const settingsSnapshot = await db.ref(`userSettings/${userId}`).once('value');
    const settings = settingsSnapshot.val() || {};

    // Default settings structure
    const userSettings = {
      notifications: {
        emailNotifications: settings.notifications?.emailNotifications ?? true,
        pushNotifications: settings.notifications?.pushNotifications ?? false,
        discussionNotifications: settings.notifications?.discussionNotifications ?? true,
        commentNotifications: settings.notifications?.commentNotifications ?? true,
        assignmentNotifications: settings.notifications?.assignmentNotifications ?? true,
        attendanceNotifications: settings.notifications?.attendanceNotifications ?? true,
        gradeNotifications: settings.notifications?.gradeNotifications ?? true
      },
      privacy: {
        showEmail: settings.privacy?.showEmail ?? false,
        showPhone: settings.privacy?.showPhone ?? false,
        allowMessagesFrom: settings.privacy?.allowMessagesFrom ?? 'everyone'
      },
      profile: {
        name: user.name,
        email: user.email,
        role: user.role,
        bio: settings.profile?.bio ?? '',
        phone: settings.profile?.phone ?? '',
        department: settings.profile?.department ?? '',
        profilePicture: settings.profile?.profilePicture ?? null
      }
    };

    res.json(userSettings);
  } catch (error) {
    console.error('Get user settings error:', error);
    res.status(500).json({ error: 'Failed to fetch user settings' });
  }
};

// Update user settings
const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notifications, privacy, profile } = req.body;

    // Update settings in Firebase
    await db.ref(`userSettings/${userId}`).update({
      notifications: notifications || {},
      privacy: privacy || {},
      profile: profile || {},
      updatedAt: Date.now()
    });

    // If name was updated, also update in users collection
    if (profile?.name && profile.name !== req.user.name) {
      await db.ref(`users/${userId}`).update({
        name: profile.name
      });
    }

    res.json({ 
      success: true, 
      message: 'Settings updated successfully' 
    });
  } catch (error) {
    console.error('Update user settings error:', error);
    res.status(500).json({ error: 'Failed to update user settings' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.ref(`users/${userId}`).update({
      password: hashedPassword
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const { imageData } = req.body;

    // Store base64 image in Firebase (for free tier, we'll use base64)
    await db.ref(`userSettings/${userId}/profile`).update({
      profilePicture: imageData
    });

    res.json({ 
      success: true, 
      message: 'Profile picture updated successfully',
      imageData 
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    // Verify password
    const user = await User.findById(userId);
    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Password is incorrect' });
    }

    // Delete user data from all collections
    const deletions = [
      db.ref(`users/${userId}`).remove(),
      db.ref(`userSettings/${userId}`).remove(),
      db.ref(`notifications`).orderByChild('userId').equalTo(userId).once('value')
        .then(snapshot => {
          const updates = {};
          snapshot.forEach(child => {
            updates[child.key] = null;
          });
          return db.ref('notifications').update(updates);
        })
    ];

    await Promise.all(deletions);

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

module.exports = {
  getUserSettings,
  updateUserSettings,
  changePassword,
  uploadProfilePicture,
  deleteAccount
};