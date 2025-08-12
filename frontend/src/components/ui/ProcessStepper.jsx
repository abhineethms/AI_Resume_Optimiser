import React from 'react';
import { 
  FileText,
  Briefcase,
  Target,
  BarChart3,
  Mail,
  Check
} from 'lucide-react';

// Custom step icon component
function StepIcon({ active, completed, stepNumber, icon: IconComponent }) {
  if (completed) {
    return (
      <div className="w-12 h-12 bg-gradient-neon rounded-full flex items-center justify-center shadow-glow-sm transition-all duration-300">
        <Check className="w-6 h-6 text-dark-950" />
      </div>
    );
  }

  if (active) {
    return (
      <div className="w-12 h-12 bg-gradient-neon rounded-full flex items-center justify-center shadow-glow animate-pulse-glow transition-all duration-300">
        <IconComponent className="w-6 h-6 text-dark-950" />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center transition-all duration-300">
      <IconComponent className="w-6 h-6 text-gray-400" />
    </div>
  );
}

// Main ProcessStepper component
const ProcessStepper = ({ activeStep = 0 }) => {
  // Steps in the application process
  const steps = [
    { 
      label: 'Resume Parser', 
      description: 'Upload and parse your resume',
      icon: FileText
    },
    { 
      label: 'Job Matcher', 
      description: 'Enter job description',
      icon: Briefcase
    },
    { 
      label: 'Match Results', 
      description: 'View compatibility analysis',
      icon: Target
    },
    { 
      label: 'Keyword Insights', 
      description: 'Analyze keyword relevance',
      icon: BarChart3
    },
    { 
      label: 'Cover Letter', 
      description: 'Generate tailored cover letter',
      icon: Mail
    }
  ];

  return (
    <div className="card p-6 mb-8">
      {/* Desktop Horizontal Stepper */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Progress line background */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-dark-700 rounded-full"></div>
          
          {/* Active progress line */}
          <div 
            className="absolute top-6 left-0 h-1 bg-gradient-neon rounded-full transition-all duration-700 ease-out"
            style={{ 
              width: `${activeStep > 0 ? ((activeStep) / (steps.length - 1)) * 100 : 0}%` 
            }}
          ></div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isCompleted = index < activeStep;
              
              return (
                <div key={step.label} className="flex flex-col items-center">
                  <StepIcon 
                    active={isActive}
                    completed={isCompleted}
                    stepNumber={index + 1}
                    icon={step.icon}
                  />
                  <div className="mt-4 text-center max-w-32">
                    <div className={`text-sm font-semibold mb-1 ${
                      isActive ? 'text-neon-400' : 
                      isCompleted ? 'text-gray-200' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Vertical Stepper */}
      <div className="lg:hidden">
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.label} className="relative">
                <div className="flex items-start space-x-4">
                  {/* Icon and connector */}
                  <div className="relative flex flex-col items-center">
                    <StepIcon 
                      active={isActive}
                      completed={isCompleted}
                      stepNumber={index + 1}
                      icon={step.icon}
                    />
                    
                    {/* Vertical connector line */}
                    {!isLast && (
                      <div className="relative mt-2">
                        <div className="w-1 h-12 bg-dark-700 rounded-full"></div>
                        {isCompleted && (
                          <div className="absolute top-0 w-1 h-12 bg-gradient-neon rounded-full"></div>
                        )}
                        {isActive && (
                          <div 
                            className="absolute top-0 w-1 bg-gradient-neon rounded-full transition-all duration-1000 ease-out"
                            style={{ height: '50%' }}
                          ></div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className={`text-base font-semibold mb-1 ${
                      isActive ? 'text-neon-400' : 
                      isCompleted ? 'text-gray-200' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </div>
                    <div className="text-sm text-gray-400">
                      {step.description}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress indicator at bottom */}
      <div className="mt-6 pt-4 border-t border-dark-800">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">
            Step {activeStep + 1} of {steps.length}
          </span>
          <span className="text-neon-400 font-medium">
            {Math.round(((activeStep + 1) / steps.length) * 100)}% Complete
          </span>
        </div>
        <div className="mt-2 progress-bar h-2">
          <div 
            className="progress-fill h-full transition-all duration-700 ease-out"
            style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProcessStepper;