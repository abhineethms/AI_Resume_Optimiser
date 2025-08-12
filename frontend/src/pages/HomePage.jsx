import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  Mail,
  MessageSquare,
  Check,
  Target,
  Zap,
  ChevronRight,
  Star,
  TrendingUp,
  Shield,
  Brain
} from 'lucide-react';

const featureCards = [
  {
    title: 'Resume Parser',
    description: 'Upload your resume and our AI will extract key information to optimize your job applications.',
    icon: FileText,
    link: '/resume',
    gradient: 'from-neon-500 to-neon-600',
  },
  {
    title: 'Job Matcher',
    description: 'Match your resume with job descriptions to see how well you fit and what skills you need to highlight.',
    icon: Briefcase,
    link: '/job-match',
    gradient: 'from-electric-500 to-electric-600',
  },
  {
    title: 'Cover Letter Generator',
    description: 'Generate tailored cover letters that highlight your relevant skills and experience for each job.',
    icon: Mail,
    link: '/cover-letter',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Resume Feedback',
    description: 'Get AI-powered feedback on how to improve your resume for better job application success.',
    icon: MessageSquare,
    link: '/feedback',
    gradient: 'from-cyan-500 to-cyan-600',
  },
];

const HomePage = () => {
  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-dark">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="content-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh] py-20">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="text-white">AI-Powered</span>
                  <br />
                  <span className="text-gradient">Resume</span>
                  <br />
                  <span className="text-white">Optimization</span>
                </h1>
                
                <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
                  Land your dream job with our AI tools that optimize your resume, match job descriptions, and generate tailored cover letters.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/resume"
                  className="btn-primary text-center group"
                >
                  <span>Get Started Now</span>
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/register"
                  className="btn-secondary text-center"
                >
                  Sign Up Free
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-dark-800">
                {[
                  { value: 'AI-Powered', label: 'Analysis' },
                  { value: 'Industry-Specific', label: 'Recommendations' },
                  { value: 'Instant', label: 'Feedback' },
                  { value: 'Free', label: 'Basic Features' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm font-semibold text-neon-400">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, title: 'ATS-Friendly Format', desc: 'Pass tracking systems' },
                  { icon: Target, title: 'Smart Matching', desc: 'Keyword optimization' },
                  { icon: Brain, title: 'AI-Powered', desc: 'Intelligent analysis' },
                  { icon: TrendingUp, title: 'Success Rate', desc: 'Higher job offers' }
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="card card-hover p-6 fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-neon rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-dark-950" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-200 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-400">{feature.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-10 w-2 h-2 bg-neon-500 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute bottom-32 left-16 w-1 h-1 bg-electric-500 rounded-full animate-pulse opacity-40"></div>
      </section>

      {/* Features Section */}
      <section className="section-spacing bg-dark-900">
        <div className="content-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Powerful <span className="text-gradient">Features</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to optimize your job application process and stand out from the competition
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  to={card.link}
                  className="group card card-hover block fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-8">
                    {/* Icon Header */}
                    <div className={`w-16 h-16 bg-gradient-to-r ${card.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-neon-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-gray-400 mb-6 line-clamp-3">
                      {card.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center text-neon-400 font-medium group-hover:text-neon-300 transition-colors">
                      <span>Try Now</span>
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-spacing bg-dark-950 border-t border-dark-800">
        <div className="content-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Four simple steps to optimize your resume and land your dream job
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Upload Your Resume',
                description: 'Upload your resume in PDF, DOCX, or TXT format. Our AI parser extracts key information.',
                features: ['Contact information', 'Work experience', 'Education history', 'Skills & certifications'],
                color: 'neon'
              },
              {
                step: '2',
                title: 'Add Job Description',
                description: 'Paste a job description or upload a job posting PDF for detailed analysis.',
                features: ['Required skills', 'Key responsibilities', 'Qualifications', 'Company culture'],
                color: 'electric'
              },
              {
                step: '3',
                title: 'Get Analysis',
                description: 'Our AI analyzes your resume against job requirements and provides insights.',
                features: ['Skill match %', 'Missing keywords', 'Experience alignment', 'ATS optimization'],
                color: 'purple'
              },
              {
                step: '4',
                title: 'Optimize & Apply',
                description: 'Use our tools to perfect your application and increase your chances.',
                features: ['Cover letter generation', 'Resume improvements', 'Interview prep', 'Follow-up templates'],
                color: 'cyan'
              }
            ].map((step, index) => (
              <div key={step.step} className="relative fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                {/* Connector Line */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-16 -right-4 w-8 h-0.5 bg-gradient-to-r from-neon-500 to-transparent"></div>
                )}
                
                <div className="card p-8 text-center h-full">
                  {/* Step Number */}
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center font-bold text-xl text-dark-950 ${
                    step.color === 'neon' ? 'bg-gradient-neon shadow-glow-sm' :
                    step.color === 'electric' ? 'bg-gradient-electric' :
                    step.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                    'bg-gradient-to-r from-cyan-500 to-cyan-600'
                  }`}>
                    {step.step}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {step.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 text-sm">
                    {step.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-300">
                        <Check className="w-4 h-4 text-neon-400 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Works Section */}
      <section className="section-spacing bg-dark-900">
        <div className="content-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Why Our AI <span className="text-gradient">Works</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: 'ATS-Friendly Format',
                description: 'Our system ensures your resume passes through Applicant Tracking Systems by optimizing format, keywords, and content structure.',
                icon: Shield
              },
              {
                title: 'Industry-Specific Analysis',
                description: 'We\'ve trained our AI on thousands of successful resumes across different industries to provide tailored recommendations.',
                icon: Target
              },
              {
                title: 'Continuous Learning',
                description: 'Our AI continuously improves by analyzing successful job applications and staying updated with hiring trends.',
                icon: Brain
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card p-8 text-center fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-16 h-16 bg-gradient-neon rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-dark-950" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Link to="/resume" className="btn-primary inline-flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Start Optimizing Your Resume
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-gradient-to-r from-dark-950 to-dark-900 border-t border-dark-800">
        <div className="content-container">
          <div className="card p-12 text-center bg-gradient-card border-neon-500">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to <span className="text-gradient">Optimize</span> Your Job Search?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of job seekers who have improved their resumes and landed their dream jobs with our AI-powered platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/resume" className="btn-primary text-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Get Started Now
                </Link>
                <Link to="/register" className="btn-secondary text-center">
                  Create Free Account
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center space-x-6 mt-8 pt-8 border-t border-dark-700">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-sm">Free to start</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Shield className="w-5 h-5 text-neon-400" />
                  <span className="text-sm">Privacy protected</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <TrendingUp className="w-5 h-5 text-electric-400" />
                  <span className="text-sm">Proven results</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;