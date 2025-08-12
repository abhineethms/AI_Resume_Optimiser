import axiosWithAuth from './axiosWithAuth';
import sessionManager from './sessionManager';

/**
 * Guest to User Migration Utility
 * Handles transferring guest session data to authenticated user account
 */

/**
 * Migrate guest session data to authenticated user account
 * @param {Object} userData - User data from Firebase authentication
 * @returns {Promise} Migration result
 */
export const migrateGuestDataToUser = async (userData) => {
  try {
    const sessionData = sessionManager.getSessionData();
    
    // Only proceed if we have a guest session with data
    if (!sessionData?.isGuest || !sessionData?.sessionId) {
      console.log('No guest session to migrate');
      return { success: true, message: 'No guest data to migrate' };
    }
    
    console.log('Starting guest data migration for session:', sessionData.sessionId);
    
    // Call backend API to migrate data
    const response = await axiosWithAuth.post('/auth/migrate-guest-data', {
      sessionId: sessionData.sessionId,
      userData: {
        firebaseUid: userData.uid,
        email: userData.email,
        displayName: userData.displayName || userData.name,
        photoURL: userData.photoURL
      }
    });
    
    if (response.data.success) {
      console.log('Guest data migration successful:', response.data.data);
      
      // Convert session from guest to user
      sessionManager.convertGuestToUser(userData);
      
      return {
        success: true,
        message: 'Successfully migrated guest data to your account',
        data: response.data.data
      };
    } else {
      throw new Error(response.data.message || 'Migration failed');
    }
    
  } catch (error) {
    console.error('Guest data migration failed:', error);
    
    // Even if migration fails, still convert the session
    // The user can continue with a fresh account
    sessionManager.convertGuestToUser(userData);
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Migration failed, but account created successfully',
      error: error
    };
  }
};

/**
 * Check if current session has data worth migrating
 * @returns {Object} Migration info
 */
export const checkMigrationEligibility = () => {
  const sessionData = sessionManager.getSessionData();
  
  if (!sessionData?.isGuest) {
    return {
      eligible: false,
      reason: 'Not a guest session'
    };
  }
  
  // Check localStorage for any app data that indicates the user has done work
  const hasResumeData = localStorage.getItem('resumeData') || 
                        localStorage.getItem('lastResumeUpload') ||
                        localStorage.getItem('ai_resume_optimizer_resume');
                        
  const hasJobData = localStorage.getItem('jobData') || 
                     localStorage.getItem('lastJobUpload') ||
                     localStorage.getItem('ai_resume_optimizer_job');
                     
  const hasMatchData = localStorage.getItem('matchData') || 
                       localStorage.getItem('ai_resume_optimizer_match');
  
  if (hasResumeData || hasJobData || hasMatchData) {
    return {
      eligible: true,
      reason: 'Guest has created content',
      sessionId: sessionData.sessionId,
      dataTypes: {
        resume: !!hasResumeData,
        job: !!hasJobData,
        match: !!hasMatchData
      }
    };
  }
  
  return {
    eligible: false,
    reason: 'No significant guest data found'
  };
};

/**
 * Show migration prompt to user (if they have data worth saving)
 * @returns {Promise} User's choice
 */
export const promptUserForMigration = () => {
  const eligibility = checkMigrationEligibility();
  
  if (!eligibility.eligible) {
    return Promise.resolve(false);
  }
  
  return new Promise((resolve) => {
    const message = `
You have some work saved from your guest session (${Object.keys(eligibility.dataTypes).filter(key => eligibility.dataTypes[key]).join(', ')}).

Would you like to transfer this data to your new account?
    `;
    
    if (window.confirm(message)) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
};

/**
 * Handle user registration with optional guest data migration
 * @param {Object} userData - User data from registration
 * @param {boolean} shouldMigrate - Whether to attempt migration
 * @returns {Promise} Registration and migration result
 */
export const handleRegistrationWithMigration = async (userData, shouldMigrate = true) => {
  try {
    let migrationResult = { success: true, message: 'No migration needed' };
    
    if (shouldMigrate) {
      const eligibility = checkMigrationEligibility();
      
      if (eligibility.eligible) {
        console.log('User is eligible for migration, attempting...');
        migrationResult = await migrateGuestDataToUser(userData);
      }
    }
    
    return {
      registrationSuccess: true,
      migrationResult
    };
  } catch (error) {
    console.error('Registration with migration failed:', error);
    return {
      registrationSuccess: false,
      migrationResult: {
        success: false,
        message: error.message || 'Registration failed',
        error
      }
    };
  }
};

const guestMigration = {
  migrateGuestDataToUser,
  checkMigrationEligibility,
  promptUserForMigration,
  handleRegistrationWithMigration
};

export default guestMigration;