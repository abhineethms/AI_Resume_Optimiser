import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebaseConfig';
import { fetchUserDetails, logout } from '../features/auth/authSlice';
import axiosWithAuth from '../utils/axiosWithAuth';
import {
  FileText,
  Briefcase,
  Target,
  Mail,
  User,
  LogOut,
  BarChart3,
  Activity,
  Calendar,
  TrendingUp
} from 'lucide-react';

// Define the workflow steps for the app process
const workflowSteps = [
  {
    title: 'Parse Resume',
    icon: FileText,
    description: 'Upload your resume to extract key information',
    path: '/resume',
    gradient: 'from-neon-500 to-neon-600'
  },
  {
    title: 'Match Jobs',
    icon: Briefcase,
    description: 'Upload job descriptions to match with your resume',
    path: '/job-match',
    gradient: 'from-electric-500 to-electric-600'
  },
  {
    title: 'View Results',
    icon: Target,
    description: 'See how well your resume matches job descriptions',
    path: '/match-results',
    gradient: 'from-neon-400 to-electric-500'
  },
  {
    title: 'Generate Cover Letter',
    icon: Mail,
    description: 'Create tailored cover letters for each job',
    path: '/cover-letter',
    gradient: 'from-electric-400 to-neon-500'
  }
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get auth state from Firebase
  const [user, loading] = useAuthState(auth);
  
  // Get auth state from Redux
  const { isLoading } = useSelector(state => state.auth);
  
  // Local state for dashboard data
  const [dashboardData, setDashboardData] = useState({
    recentActivities: [],
    stats: {
      resumesUploaded: 0,
      jobsAnalyzed: 0,
      coverLettersGenerated: 0
    },
    loading: true,
    error: null
  });
  
  // Fetch user details and dashboard data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user details
        await dispatch(fetchUserDetails());
        
        // Fetch dashboard data
        const response = await axiosWithAuth.get('/api/auth/dashboard');
        setDashboardData(prevData => ({
          ...prevData,
          ...response.data.data,
          loading: false
        }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prevData => ({
          ...prevData,
          loading: false,
          error: error.message || 'Failed to load dashboard data'
        }));
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user, dispatch]);
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };
  
  // Show loading state while checking auth
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading-spinner w-16 h-16"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="page-container">
      <div className="content-container">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* User Profile Section */}
          <div className="lg:col-span-4">
            <div className="card p-6 sticky top-24">
              {/* User Profile */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-24 h-24 rounded-full border-2 border-neon-500 shadow-glow"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-dark-700 border-2 border-neon-500 flex items-center justify-center shadow-glow">
                      <User className="w-12 h-12 text-neon-400" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-neon-500 rounded-full border-2 border-dark-950 flex items-center justify-center">
                    <div className="w-2 h-2 bg-dark-950 rounded-full"></div>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">
                  {user.displayName || 'Welcome!'}
                </h2>
                
                <p className="text-gray-400 mb-4 text-center break-all">
                  {user.email}
                </p>
                
                <Link 
                  to="/profile"
                  className="btn-secondary text-sm"
                >
                  Edit Profile
                </Link>
              </div>
              
              <div className="border-t border-dark-700 pt-6 mb-6">
                <div className="flex items-center mb-4">
                  <BarChart3 className="w-5 h-5 text-neon-400 mr-2" />
                  <h3 className="text-lg font-semibold text-white">Score Board</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-neon-400 mr-3" />
                      <span className="text-gray-300">Resumes Parsed</span>
                    </div>
                    <span className="text-2xl font-bold text-neon-400">
                      {dashboardData.stats.resumesUploaded}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                    <div className="flex items-center">
                      <Briefcase className="w-5 h-5 text-electric-400 mr-3" />
                      <span className="text-gray-300">Jobs Analyzed</span>
                    </div>
                    <span className="text-2xl font-bold text-electric-400">
                      {dashboardData.stats.jobsAnalyzed}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                    <div className="flex items-center">
                      <Target className="w-5 h-5 text-neon-400 mr-3" />
                      <span className="text-gray-300">Matches Created</span>
                    </div>
                    <span className="text-2xl font-bold text-neon-400">
                      {dashboardData.stats.matchesCreated || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-electric-400 mr-3" />
                      <span className="text-gray-300">Cover Letters</span>
                    </div>
                    <span className="text-2xl font-bold text-electric-400">
                      {dashboardData.stats.coverLettersGenerated}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-dark-700 pt-6">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content Section */}
          <div className="lg:col-span-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                Resume <span className="text-gradient">Optimization Process</span>
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed">
                Optimize your job applications by following our 4-step process. Start by parsing your resume, 
                then match it against job descriptions to get insights and generate tailored cover letters.
              </p>
            </div>
            
            {/* Workflow Process Cards */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {workflowSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div 
                    key={index}
                    className="card card-hover overflow-hidden group transition-all duration-300 hover:scale-105"
                  >
                    {/* Header with gradient */}
                    <div className={`bg-gradient-to-r ${step.gradient} p-4 text-dark-950`}>
                      <div className="flex items-center">
                        <IconComponent className="w-6 h-6 mr-3" />
                        <h3 className="text-lg font-bold">
                          Step {index + 1}: {step.title}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 flex-1">
                      <p className="text-gray-400 mb-6 leading-relaxed">
                        {step.description}
                      </p>
                      
                      <Link 
                        to={step.path}
                        className={`inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r ${step.gradient} text-dark-950 font-medium rounded-lg hover:shadow-glow transition-all duration-200 group-hover:scale-105`}
                      >
                        {index === 0 ? 'Start Here' : 'Go to Step'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Recent Activities Section */}
            {dashboardData.recentActivities.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center mb-6">
                  <Activity className="w-6 h-6 text-neon-400 mr-3" />
                  <h2 className="text-2xl font-bold text-white">Recent Activities</h2>
                </div>
                
                <div className="space-y-4">
                  {dashboardData.recentActivities.map((activity, index) => (
                    <div 
                      key={index}
                      className={`p-4 bg-dark-800 rounded-lg ${index !== dashboardData.recentActivities.length - 1 ? 'border-b border-dark-700' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-300 mb-1">{activity.description}</p>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(activity.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <TrendingUp className="w-5 h-5 text-neon-400 ml-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;