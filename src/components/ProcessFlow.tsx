import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { HexagonBreadcrumb } from './HexagonBreadcrumb';
import { stepColors } from '../styles/cohive-theme';
import cohiveLogo from 'figma:asset/88105c0c8621f3d41d65e5be3ae75558f9de1753.png';

interface ProcessStep {
  id: string;
  label: string;
  color: string;
  icon?: any;
  position: { x: number; y: number };
  row: number;
}

const processSteps: ProcessStep[] = [
  // Row 1 - Start
  { id: 'Enter', label: 'Enter', color: stepColors.Enter, position: { x: 0, y: 0 }, row: 1 },
  
  // Row 2 - Research
  { id: 'research', label: 'Knowledge Base', color: stepColors.research,  position: { x: 0, y: 550 }, row: 2 },
  
  // Row 3 - Middle cluster (top row of cluster)
  { id: 'Luminaries', label: 'Luminaries', color: stepColors.Luminaries,  position: { x: 15, y: 140 }, row: 3 },
  { id: 'panelist', label: 'Panelist', color: stepColors.panelist,  position: { x: 120, y: 85 }, row: 3 },
  { id: 'Consumers', label: 'Consumers', color: stepColors.Consumers,  position: { x: 225, y: 140 }, row: 3 },
  { id: 'competitors', label: 'Competitors', color: stepColors.competitors,  position: { x: 15, y: 250 }, row: 4 },
  { id: 'Colleagues', label: 'Colleagues', color: stepColors.Colleagues,  position: { x: 120, y: 195 }, row: 4 },
  { id: 'cultural', label: 'Cultural\nVoices', color: stepColors.cultural,  position: { x: 225, y: 250 }, row: 4 },
  { id: 'social', label: 'Social\nVoices', color: stepColors.social,  position: { x: 120, y: 305 }, row: 5 },
  
  { id: 'Buzz', label: 'Buzz\nROI', color: stepColors.Buzz,  position: { x: 120, y: 550 }, row: 6 },
  { id: 'Grade', label: 'Grade', color: stepColors.Grade,  position: { x: 225, y: 385 }, row: 7 },
  { id: 'Findings', label: 'Findings', color: stepColors.Findings,  position: { x: 120, y: 435 }, row: 8 },
  { id: 'review', label: 'Review\nFiles', color: stepColors.review,  position: { x: 240, y: 550 }, row: 9 }

];

interface ProcessFlowProps {
  activeStep: string;
  onStepChange: (stepId: string) => void;
  completedSteps?: string[];
  isEnterComplete?: boolean;
  userRole?: 'administrator' | 'research-analyst' | 'knowledge-leader' | 'marketing-manager' | 'product-manager' | 'executive-stakeholder';
  hexExecutions?: { [hexId: string]: any[] }; // Add hex executions
}

// Separate research info for researchers
const researchInfoForResearchers = {
  title: 'Research',
  description: 'Create and manage comprehensive research assets including synthesis reports and persona files.',
  details: [
    'Choose between Synthesis and Personas modes',
    'Synthesis: Combine multiple studies, create new brand/project analyses',
    'Synthesis: Edit/approve existing synthesis files',
    'Personas: Create persona profiles for each hexagon (Luminaries, Panelist, Consumers, etc.)',
    'Personas: Edit/read existing persona files',
    'Approve or reject research files for use in the workflow',
    'Upload and manage research documents'
  ]
};

// Separate research info for non-researchers
const researchInfoForNonResearchers = {
  title: 'Research',
  description: 'View research files, make suggestions, and access approved research assets.',
  details: [
    'View all research files in the system',
    'Browse synthesis reports and persona files',
    'Suggest edits to existing research files',
    'Track status of your edit suggestions (Pending, Approved, Rejected)'
  ]
};

// Hex information content
const hexInfo: { [key: string]: { title: string; description: string; details: string[] } } = {
  Enter: {
    title: 'Enter',
    description: 'The starting point for every CoHive project. This hexagon initializes your research workflow.',
    details: [
      'You must complete this step in order to continue', 
      'Define your Brand and Project Type',
      'Create a new project or select an existing one',
      'Load current ideas or get AI-generated inspiration',
      'Select approved research files to work with',
    ]
  },
  research: {
    title: 'Research',
    description: 'Central hub for managing all research assets, synthesis, and persona files.',
    details: [
      'Create synthesis reports and persona files',
      'View research files and suggest edits',
      'Upload and manage research documents',
      'Approve or reject research files',
      'Build persona profiles for different hexagons',
      'Track user edit suggestions and their status'
    ]
  },
  Luminaries: {
    title: 'Luminaries',
    description: 'Gather insights and recommendations from industry experts outside your organization.',
    details: [
      'Select relevant research files for expert review', //LW Edit
      'Choose assessment type: Assess, Recommend, or Unified', //LW Edit
      'AI analyzes expert perspectives based on research',
      'Can be visited multiple times throughout the workflow'
    ]
  },
  panelist: {
    title: 'Panelist',
    description: 'Leverage data and insights from consumer panel households.',
    details: [
      'Select research files for panel analysis', //LW Edit
      'Understand how panel members would respond',
      'Get recommendations from diverse consumer perspectives',
      'Identify additional research opportunities',
      'Can be used repeatedly for different analyses'
    ]
  },
  Consumers: {
    title: 'Consumers',
    description: 'Understand buyer behavior, preferences, and key buyer personas.',
    details: [
      'Select relevant consumer research files', //LW Edit
      'Analyze key buyer personas and their characteristics',
      'Assess resonance with target buyers',
      'Identify messaging that appeals to buyers',
      'Generate buyer-focused recommendations',
      'Multiple executions available for different buyer segments'
    ]
  },
  competitors: {
    title: 'Competitors', //LW Edit
    description: 'Analyze competitor strategies, market position, and competitive landscape.',
    details: [
      'Select competitive analysis research files',
      'Evaluate competitor strengths and weaknesses',
      'Assess market share and positioning',
      'Identify competitive differentiators',
      'Generate strategic competitive insights',
      'Can be executed multiple times for different competitors'
    ]
  },
  Colleagues: {
    title: 'Colleagues',
    description: 'Leverage knowledge and insights from internal stakeholders and experts.',
    details: [
      'Select internal research and stakeholders', //LW Edit
      'Consult different departments and teams',
      'Generate cross-functional recommendations',
      'Multiple executions for different internal perspectives'
    ]
  },
  cultural: {
    title: 'Cultural Voices',
    description: 'Understand cultural trends, influences, and cultural factors affecting your market.',
    details: [
      'Select cultural research and trend files',
      'Analyze relevant cultural trends and movements',
      'Understand how culture influences behavior',
      'Identify cultural segments to target',
      'Assess cultural barriers and opportunities',
      'Execute multiple times for different cultural aspects'
    ]
  },
  social: {
    title: 'Social Voices',
    description: 'Monitor social media conversations, sentiment, and online trends.',
    details: [
      'Select social listening and media research files',
      'Analyze sentiment across social platforms',
      'Monitor keywords, topics, and trending conversations',
      'Identify emerging insights from social data',
      'Generate social media strategy recommendations',
      'Can be executed multiple times for different platforms or time periods'
    ]
  },
  Buzz: {
    title: 'Buzz',
    description: 'Include buzz, response measures, incrementality, all results from prior executions.',
    details: [
      'Modify research based on response measures',
      'Include buzz from social media tracking to improve research, comments and recommendations'
    ]
  },
  Grade: {
    title: 'Grade',
    description: 'Test hypotheses and strategies against defined target segments.',
    details: [
      'Select segment research and testing files',
      'Define and test hypotheses for each segment',
      'Choose appropriate testing methodology',
      'Evaluate against defined success metrics',
      'Generate segment-specific recommendations',
      'Multiple executions for different segments or hypotheses'
    ]
  },
  Findings: {
    title: 'Findings',
    description: 'The final step where you develop actionable strategies from all gathered insights.',
    details: [
      'This step adds the results from the prior steps to a combined document',
      'Final output for Databricks integration'
    ]
  },
  review: {
    title: 'Review',
    description: 'Final review and validation of all research and test results.',
    details: [
      'Review all gathered insights and test results',
      'Validate the accuracy and relevance of the data',
      'Make final adjustments if necessary',
      'Prepare the final report for stakeholders'
    ]
  }
};

export function ProcessFlow({ activeStep, onStepChange, completedSteps = [], isEnterComplete = false, userRole, hexExecutions = {} }: ProcessFlowProps) {
  const [showInfo, setShowInfo] = useState(false);

  const getStepStatus = (stepId: string): 'completed' | 'active' | 'upcoming' => {
    if (stepId === activeStep) return 'active';
    if (completedSteps.includes(stepId)) return 'completed';
    return 'upcoming';
  };

  // Get usage count for a specific hex
  const getUsageCount = (stepId: string): number => {
    return hexExecutions[stepId]?.length || 0;
  };

  const isStepClickable = (stepId: string): boolean => {
    // Enter is always clickable
    if (stepId === 'Enter') return true;
    
    // Review is always clickable
    if (stepId === 'review') return true;
    
    // After Enter is complete, all steps except Findings become clickable
    if (isEnterComplete) {
     // Findings requires at least one other step to be completed
 //     if (stepId === 'Findings') {
 //       const otherCompletedSteps = completedSteps.filter(
 //         id => id !== 'Enter' && id !== 'Findings' && id !== 'review'
 //       ).length;
 //       return otherCompletedSteps >= 1;
 //     }
      // All other steps are clickable after Enter
      return true;
    }
    
    // Before Enter is complete, nothing else is clickable
    return false;
  };

  // Get the appropriate info for the current step
  const getCurrentStepInfo = () => {
    // Special handling for Research hex - check user role
    if (activeStep === 'research') {
      const isResearcher = userRole === 'administrator' || userRole === 'research-analyst' || userRole === 'research-leader';
      return isResearcher ? researchInfoForResearchers : researchInfoForNonResearchers;
    }
    return hexInfo[activeStep];
  };

  // Helper to get info for any step (not just active one)
  const getStepInfo = (stepId: string) => {
    if (stepId === 'research') {
      const isResearcher = userRole === 'administrator' || userRole === 'research-analyst' || userRole === 'research-leader';
      return isResearcher ? researchInfoForResearchers : researchInfoForNonResearchers;
    }
    return hexInfo[stepId];
  };

  return (
    <div className="p-2" style={{ height: '650px' }}>
      <div className="relative" style={{ minWidth: '360px', width: '360px', height: '650px' }}>
        {/* Info Button - Top Right */}
        <div className="absolute top-0 right-0 z-50">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            title="View information about the current hexagon"
          >
            <Info className="w-4 h-4" />
            Info
          </button>

          {/* Info Popup */}
          {showInfo && (() => {
            const currentInfo = getCurrentStepInfo();
            return (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border-2 border-blue-600 rounded-lg shadow-xl z-50 p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-blue-900" style={{ fontSize: '8pt' }}>{currentInfo?.title || 'Hexagon Information'}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowInfo(false);
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                    title="Close"
                  >
                    <X className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
                
                <p className="text-gray-600 mb-3" style={{ fontSize: '6pt', lineHeight: '1.3' }}>
                  {currentInfo?.description || 'No description available.'}
                </p>

                <div className="bg-gray-50 rounded p-2">
                  <p className="text-gray-900 mb-2" style={{ fontSize: '7pt' }}>What Happens:</p>
                  <ul className="space-y-1">
                    {currentInfo?.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <div className="w-1 h-1 bg-blue-600 rounded-full mt-1 flex-shrink-0"></div>
                        <span className="text-gray-700" style={{ fontSize: '6pt', lineHeight: '1.3' }}>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })()}
        </div>
        
        {/*Arrows in Hex Box */}
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {/* Enter to Luminaries */}
          <line x1="90" y1="105" x2="120" y2="140" stroke="#9333EA" strokeWidth="3" markerEnd="url(#arrowhead)" />
          
          {/* Cluster connections - simplified */}
          <line x1="250" y1="360" x2="260" y2="380" stroke="#9333EA" strokeWidth="3" markerEnd="url(#arrowhead)" />
          
          {/* Grade to Findings */}
          <line x1="230" y1="425" x2="205" y2="435" stroke="#9333EA" strokeWidth="3" markerEnd="url(#arrowhead)" />
          
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#9333EA" />
            </marker>
          </defs>
        </svg>

        {/* Hexagons */}
        {processSteps.map((step) => {
          const clickable = isStepClickable(step.id);
          const usageCount = getUsageCount(step.id);
          const isActive = step.id === activeStep;
          
          return (
            <div
              key={step.id}
              className={`absolute ${!clickable ? 'opacity-30 pointer-events-none' : ''}`}
              style={{
                left: `${step.position.x}px`,
                top: `${step.position.y}px`,
                zIndex: isActive ? 20 : 10
              }}
            >
              <HexagonBreadcrumb
                label={step.label}
                icon={step.icon}
                color={step.color}
                status={getStepStatus(step.id)}
                onClick={() => clickable && onStepChange(step.id)}
                textColor={step.id === 'Enter' ? '#80350E' : undefined}
                usageCount={usageCount}
                infoContent={getStepInfo(step.id)}
                hideTextOutline={step.id === 'Enter'}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { processSteps };