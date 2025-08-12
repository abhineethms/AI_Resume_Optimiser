import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Features',
      links: [
        { name: 'Resume Parser', path: '/resume' },
        { name: 'Job Matcher', path: '/job-match' },
        { name: 'Cover Letter Generator', path: '/cover-letter' },
        { name: 'Resume Feedback', path: '/feedback' },
      ]
    },
    {
      title: 'Account',
      links: [
        { name: 'Login', path: '/login' },
        { name: 'Register', path: '/register' },
        { name: 'Dashboard', path: '/dashboard' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Terms of Service', path: '/terms' },
      ]
    }
  ];

  return (
    <footer className="bg-dark-900 border-t border-dark-800 mt-auto">
      <div className="content-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-neon rounded-lg flex items-center justify-center font-bold text-dark-950">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-gradient">Resume Optimizer</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Optimize your resume with AI technology to match job descriptions, generate cover letters, and receive feedback.
            </p>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>Powered by</span>
              <span className="text-neon-400 font-medium">AI Technology</span>
            </div>
          </div>
          
          {/* Links Sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-gray-200 font-semibold mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-neon-400 text-sm transition-colors duration-200 block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-dark-800 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>
              Copyright © {currentYear}{' '}
              <Link to="/" className="text-neon-400 hover:text-neon-300 transition-colors duration-200">
                AI Resume Optimizer
              </Link>
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Built with</span>
            <div className="flex items-center space-x-1">
              <span className="text-red-400">♥</span>
              <span>and</span>
              <span className="text-neon-400 font-medium">React</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;