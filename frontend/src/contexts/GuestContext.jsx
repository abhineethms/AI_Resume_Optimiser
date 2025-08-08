import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const GuestContext = createContext();

export const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
};

export const GuestProvider = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const [guestData, setGuestData] = useState({
    currentSession: {
      resumes: [],
      jobs: [],
      matches: [],
      startTime: Date.now()
    },
    sessionStats: {
      resumesProcessed: 0,
      jobsAnalyzed: 0,
      matchesCreated: 0
    }
  });

  // Clear guest data when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      setGuestData({
        currentSession: {
          resumes: [],
          jobs: [],
          matches: [],
          startTime: Date.now()
        },
        sessionStats: {
          resumesProcessed: 0,
          jobsAnalyzed: 0,
          matchesCreated: 0
        }
      });
    }
  }, [isAuthenticated]);

  const addGuestResume = (resume) => {
    const resumeWithId = {
      ...resume,
      _id: `guest_resume_${Date.now()}`,
      isGuest: true,
      createdAt: new Date().toISOString()
    };

    setGuestData(prev => ({
      ...prev,
      currentSession: {
        ...prev.currentSession,
        resumes: [...prev.currentSession.resumes, resumeWithId]
      },
      sessionStats: {
        ...prev.sessionStats,
        resumesProcessed: prev.sessionStats.resumesProcessed + 1
      }
    }));

    return resumeWithId;
  };

  const addGuestJob = (job) => {
    const jobWithId = {
      ...job,
      _id: `guest_job_${Date.now()}`,
      isGuest: true,
      createdAt: new Date().toISOString()
    };

    setGuestData(prev => ({
      ...prev,
      currentSession: {
        ...prev.currentSession,
        jobs: [...prev.currentSession.jobs, jobWithId]
      },
      sessionStats: {
        ...prev.sessionStats,
        jobsAnalyzed: prev.sessionStats.jobsAnalyzed + 1
      }
    }));

    return jobWithId;
  };

  const addGuestMatch = (match) => {
    const matchWithId = {
      ...match,
      _id: `guest_match_${Date.now()}`,
      isGuest: true,
      createdAt: new Date().toISOString()
    };

    setGuestData(prev => ({
      ...prev,
      currentSession: {
        ...prev.currentSession,
        matches: [...prev.currentSession.matches, matchWithId]
      },
      sessionStats: {
        ...prev.sessionStats,
        matchesCreated: prev.sessionStats.matchesCreated + 1
      }
    }));

    return matchWithId;
  };

  const getGuestResumes = () => {
    return guestData.currentSession.resumes;
  };

  const getGuestJobs = () => {
    return guestData.currentSession.jobs;
  };

  const getGuestMatches = () => {
    return guestData.currentSession.matches;
  };

  const getGuestStats = () => {
    return guestData.sessionStats;
  };

  const clearGuestData = () => {
    setGuestData({
      currentSession: {
        resumes: [],
        jobs: [],
        matches: [],
        startTime: Date.now()
      },
      sessionStats: {
        resumesProcessed: 0,
        jobsAnalyzed: 0,
        matchesCreated: 0
      }
    });
  };

  const isGuestMode = !isAuthenticated;

  const getSessionDuration = () => {
    return Date.now() - guestData.currentSession.startTime;
  };

  const value = {
    isGuestMode,
    guestData,
    addGuestResume,
    addGuestJob,
    addGuestMatch,
    getGuestResumes,
    getGuestJobs,
    getGuestMatches,
    getGuestStats,
    clearGuestData,
    getSessionDuration
  };

  return (
    <GuestContext.Provider value={value}>
      {children}
    </GuestContext.Provider>
  );
};

export default GuestContext;