import { useState, useEffect } from 'react';

interface ResearchFile {
  id: string;
  brand: string;
  projectType: string;
  fileName: string;
  isApproved: boolean;
  uploadDate: number;
  fileType: string;
  content?: string; // Optional: actual file content from Databricks
  source?: string; // Optional: source path in Databricks
}

interface ResearcherModesProps {
  brand: string;
  projectType: string;
  researchFiles: ResearchFile[];
  canApproveResearch: boolean;
  onCreateResearchFile: (file: Omit<ResearchFile, 'id' | 'uploadDate'>) => void;
  onToggleApproval: (fileId: string) => void;
  availableBrands?: string[];
  availableProjectTypes?: string[];
  onAddBrand?: (brand: string) => void;
  onAddProjectType?: (projectType: string) => void;
}

// Central hexagon steps (excluding Enter, Research, Findings)
const centralHexagons = [
  { id: 'Luminaries', label: 'Luminaries', color: 'bg-teal-100', borderColor: 'border-teal-300' },
  { id: 'panelist', label: 'Panelist', color: 'bg-cyan-100', borderColor: 'border-cyan-300' },
  { id: 'Consumers', label: 'Consumers', color: 'bg-sky-100', borderColor: 'border-sky-300' },
  { id: 'competitors', label: 'Competitors', color: 'bg-indigo-100', borderColor: 'border-indigo-300' },
  { id: 'Colleagues', label: 'Colleagues', color: 'bg-violet-100', borderColor: 'border-violet-300' },
  { id: 'cultural', label: 'Cultural Voices', color: 'bg-purple-100', borderColor: 'border-purple-300' },
  { id: 'social', label: 'Social Listening', color: 'bg-fuchsia-100', borderColor: 'border-fuchsia-300' },
  { id: 'Grade', label: 'Grade', color: 'bg-pink-100', borderColor: 'border-pink-300' }
];

export function ResearcherModes({
  brand,
  projectType,
  researchFiles,
  canApproveResearch,
  onCreateResearchFile,
  onToggleApproval,
  availableBrands = [],
  availableProjectTypes = [],
  onAddBrand,
  onAddProjectType
}: ResearcherModesProps) {
  const [mode, setMode] = useState<'synthesis' | 'personas' | 'read-edit-approve' | null>(() => {
    // Load saved mode from localStorage
    const saved = localStorage.getItem('cohive_research_mode');
    return saved as 'synthesis' | 'personas' | 'read-edit-approve' | null;
  });
  
  // Synthesis state
  const [synthesisOption, setSynthesisOption] = useState<'new-synthesis' | 'add-studies' | 'new-brand' | 'new-project-type' | 'edit-existing' | 'review-edits' | null>(null);
  const [synthesisResponses, setSynthesisResponses] = useState<{ [key: string]: string }>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Brand/Project Type management
  const [newBrand, setNewBrand] = useState('');
  const [newProjectType, setNewProjectType] = useState('');

  // Personas state
  const [selectedHexagon, setSelectedHexagon] = useState<string | null>(null);
  const [personaView, setPersonaView] = useState<'create' | 'edit'>('create');
  const [selectedFileToEdit, setSelectedFileToEdit] = useState<ResearchFile | null>(null);
  const [personaFileForm, setPersonaFileForm] = useState({
    brandScope: 'single' as 'single' | 'category' | 'all',
    brandName: brand,
    categoryName: '',
    fileName: '',
    fileType: ''
  });

  // Save mode to localStorage whenever it changes
  useEffect(() => {
    if (mode) {
      localStorage.setItem('cohive_research_mode', mode);
    } else {
      localStorage.removeItem('cohive_research_mode');
    }
  }, [mode]);

  // Helper function to generate default filename
  const generateDefaultFileName = (brand: string, projectType: string) => {
    const formatDate = (timestamp: number) => {
      const date = new Date(timestamp);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    };
    
    const cleanName = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '');
    
    const brandPart = cleanName(brand) || 'Brand';
    const projectTypePart = cleanName(projectType) || 'ProjectType';
    const creationPart = formatDate(Date.now());
    
    return `${brandPart}_${projectTypePart}_${creationPart}`;
  };

  // Get files created for personas mode (for central hexagons)
  const getPersonaFiles = (hexagonId: string) => {
    return researchFiles.filter(file => file.fileType === hexagonId);
  };

  const handleSynthesisQuestionChange = (questionKey: string, value: string) => {
    setSynthesisResponses(prev => ({
      ...prev,
      [questionKey]: value
    }));
  };

  const handleCreatePersonaFile = () => {
    if (!selectedHexagon || !personaFileForm.fileName.trim()) return;

    let brandValue = '';
    if (personaFileForm.brandScope === 'single') {
      brandValue = personaFileForm.brandName;
    } else if (personaFileForm.brandScope === 'category') {
      brandValue = `Category: ${personaFileForm.categoryName}`;
    } else {
      brandValue = 'All Brands';
    }

    const newFile: Omit<ResearchFile, 'id' | 'uploadDate'> = {
      brand: brandValue,
      projectType: selectedHexagon, // Store hexagon type in projectType for personas
      fileName: personaFileForm.fileName,
      isApproved: false,
      fileType: selectedHexagon // Also store in fileType for easy filtering
    };

    onCreateResearchFile(newFile);

    // Reset form
    setPersonaFileForm({
      brandScope: 'single',
      brandName: brand,
      categoryName: '',
      fileName: '',
      fileType: ''
    });
  };

  // If no mode selected, show mode selection
  if (!mode) {
    return (
      <div className="space-y-4">
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-6">
          <h3 className="text-purple-900 leading-tight">Research Mode Selection</h3>
          <p className="text-purple-700 text-sm">
            Build, Edit and Approve Research Files and Persona Files
          </p>
        </div>

        <div className={`grid ${canApproveResearch ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
          {/* Synthesis Mode */}
          <button
            onClick={() => setMode('synthesis')}
            className="bg-white border-2 border-gray-300 rounded-lg p-6 hover:border-purple-500 hover:bg-purple-50 transition-colors text-left group"
          >
            <div>
              <h4 className="text-gray-900">Synthesis</h4>
              <p className="text-gray-600 text-sm">
                Combine and analyze multiple research studies to generate comprehensive insights
              </p>
              <div className="mt-3 text-xs text-purple-600 group-hover:text-purple-700">
                • Add Studies • New Brand • New Project Type • {canApproveResearch ? 'Review/Edit/Approve' : 'View Files'}
              </div>
            </div>
          </button>

          {/* Personas Mode */}
          <button
            onClick={() => setMode('personas')}
            className="bg-white border-2 border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
          >
            <div>
              <h4 className="text-gray-900">Personas</h4>
              <p className="text-gray-600 text-sm">
               Create lists of Personas for each Hexagon with key characteristics for each Persona
              </p>
              <div className="mt-3 text-xs text-blue-600 group-hover:text-blue-700">
                Files can be for single brands, categories, or all brands • {canApproveResearch ? 'Review/Edit/Approve' : 'Create Personas'}
              </div>
            </div>
          </button>

          {/* Read/Edit/Approve Mode - Only for Research Leaders */}
          {canApproveResearch && (
            <button
              onClick={() => setMode('read-edit-approve')}
              className="bg-white border-2 border-gray-300 rounded-lg p-6 hover:border-green-500 hover:bg-green-50 transition-colors text-left group"
            >
              <div>
                <h4 className="text-gray-900">Read, Edit, or Approve</h4>
                <p className="text-gray-600 text-sm">
                  Read, edit, or approve any synthesis or persona file
                </p>
                <div className="mt-3 text-xs text-green-600 group-hover:text-green-700">
                  • View all files • Edit content • Approve/unapprove
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Synthesis Mode
  if (mode === 'synthesis') {
    return (
      <div className="space-y-4">
        {/* Mode Switcher - Always visible at top */}
        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <span className="text-gray-700 text-sm font-semibold">Research Mode:</span>
            <div className="flex gap-2 flex-1">
              <button
                onClick={() => setMode('synthesis')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg cursor-default"
              >
                Synthesis
              </button>
              <button
                onClick={() => {
                  setMode('personas');
                  setSynthesisOption(null);
                  setSynthesisResponses({});
                  setUploadedFiles([]);
                }}
                className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                Personas
              </button>
              {canApproveResearch && (
                <button
                  onClick={() => {
                    setMode('read-edit-approve');
                    setSynthesisOption(null);
                    setSynthesisResponses({});
                    setUploadedFiles([]);
                  }}
                  className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  Read/Edit/Approve
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-purple-900 leading-tight">
                Synthesis Mode
              </h3>
              <p className="text-purple-700 text-sm">
                Combine research studies to generate insights
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Choose synthesis option */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
          <label className="block text-gray-900 mb-3">
            1. Select Synthesis Approach
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-3 rounded cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="synthesisOption"
                value="new-synthesis"
                checked={synthesisOption === 'new-synthesis'}
                onChange={(e) => setSynthesisOption(e.target.value as 'new-synthesis')}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <div className="text-gray-900 font-semibold">New Synthesis</div>
                <p className="text-gray-600 text-sm">Start a new synthesis for an existing brand and project type</p>
              </div>
            </label>
            <label className="flex items-center gap-2 p-3 rounded cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="synthesisOption"
                value="new-brand"
                checked={synthesisOption === 'new-brand'}
                onChange={(e) => setSynthesisOption(e.target.value as 'new-brand')}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <div className="text-gray-900 font-semibold">New Brand</div>
                <p className="text-gray-600 text-sm">Start synthesis for a new brand with existing project type</p>
              </div>
            </label>
            <label className="flex items-center gap-2 p-3 rounded cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="synthesisOption"
                value="new-project-type"
                checked={synthesisOption === 'new-project-type'}
                onChange={(e) => setSynthesisOption(e.target.value as 'new-project-type')}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <div className="text-gray-900 font-semibold">New Project Type</div>
                <p className="text-gray-600 text-sm">Start synthesis for existing brand with new project type</p>
              </div>
            </label>
            <label className="flex items-center gap-2 p-3 rounded cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="synthesisOption"
                value="edit-existing"
                checked={synthesisOption === 'edit-existing'}
                onChange={(e) => setSynthesisOption(e.target.value as 'edit-existing')}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <div className="text-gray-900 font-semibold">Edit Existing Synthesis</div>
                <p className="text-gray-600 text-sm">Modify an existing synthesis file</p>
              </div>
            </label>
            <label className="flex items-center gap-2 p-3 rounded cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="synthesisOption"
                value="add-studies"
                checked={synthesisOption === 'add-studies'}
                onChange={(e) => setSynthesisOption(e.target.value as 'add-studies')}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <div className="text-gray-900 font-semibold">Add Studies to Existing Synthesis</div>
                <p className="text-gray-600 text-sm">Incorporate additional research studies into existing analysis</p>
              </div>
            </label>
            <label className="flex items-center gap-2 p-3 rounded cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="synthesisOption"
                value="review-edits"
                checked={synthesisOption === 'review-edits'}
                onChange={(e) => setSynthesisOption(e.target.value as 'review-edits')}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <div className="text-gray-900 font-semibold">Review Suggested Edits</div>
                <p className="text-gray-600 text-sm">Review and approve suggested edits to synthesis files</p>
              </div>
            </label>
          </div>
        </div>

        {/* Brand and Project Type Management */}
        {onAddBrand && onAddProjectType && (synthesisOption === 'new-brand' || synthesisOption === 'new-project-type') && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <h3 className="text-blue-900 mb-3">Manage Brands & Project Types</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Add Brand - Only show when "New Brand Synthesis" is selected */}
              {synthesisOption === 'new-brand' && (
                <div>
                  <label className="block text-gray-900 text-sm mb-2">Add New Brand</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 border-2 border-gray-300 bg-white rounded p-2 text-gray-700 focus:outline-none focus:border-blue-500"
                      placeholder="Enter brand name..."
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newBrand.trim()) {
                          onAddBrand(newBrand);
                          setNewBrand('');
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newBrand.trim()) {
                          onAddBrand(newBrand);
                          setNewBrand('');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">Available Brands ({availableBrands.length}):</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {availableBrands.map((b, idx) => (
                        <span key={idx} className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Add Project Type - Only show when "New Project Type" is selected */}
              {synthesisOption === 'new-project-type' && (
                <div>
                  <label className="block text-gray-900 text-sm mb-2">Add New Project Type</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 border-2 border-gray-300 bg-white rounded p-2 text-gray-700 focus:outline-none focus:border-blue-500"
                      placeholder="Enter project type..."
                      value={newProjectType}
                      onChange={(e) => setNewProjectType(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newProjectType.trim()) {
                          onAddProjectType(newProjectType);
                          setNewProjectType('');
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newProjectType.trim()) {
                          onAddProjectType(newProjectType);
                          setNewProjectType('');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">Available Types ({availableProjectTypes.length}):</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {availableProjectTypes.map((type, idx) => (
                        <span key={idx} className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Questions based on selected option */}
        {synthesisOption === 'add-studies' && (
          <div className="space-y-4">
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <label className="block text-gray-900 mb-3">
                2. What file are you adding studies to?
              </label>
              <div className="flex items-start gap-3">
                <input
                  type="text"
                  className="flex-1 border-2 border-gray-300 bg-white rounded p-2 text-gray-700 focus:outline-none focus:border-purple-500"
                  placeholder="Enter filename or select a file..."
                  value={synthesisResponses.targetFile || ''}
                  onChange={(e) => handleSynthesisQuestionChange('targetFile', e.target.value)}
                />
                <button
                  onClick={() => document.getElementById('add-studies-file-upload')?.click()}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  title="Upload files from device or cloud"
                >
                  +
                </button>
              </div>
              
              {/* Hidden file input */}
              <input
                id="add-studies-file-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.txt"
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setUploadedFiles(prev => [...prev, ...files]);
                  if (files.length > 0 && !synthesisResponses.targetFile) {
                    handleSynthesisQuestionChange('targetFile', files[0].name);
                  }
                }}
              />

              {/* Display uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-700">Uploaded files:</p>
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded">
                      <span className="text-sm text-gray-700 flex-1">{file.name}</span>
                      <button
                        onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))}
                        className="text-red-600 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Execute Button */}
            <button
              onClick={() => {
                console.log('Executing Add Studies:', {
                  targetFile: synthesisResponses.targetFile,
                  uploadedFiles: uploadedFiles.map(f => f.name)
                });
                alert(`Adding ${uploadedFiles.length} studies to ${synthesisResponses.targetFile}`);
              }}
              disabled={!synthesisResponses.targetFile || uploadedFiles.length === 0}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Execute - Add Studies
            </button>
          </div>
        )}

        {synthesisOption === 'new-brand' && (
          <div className="space-y-4">
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <label className="block text-gray-900 mb-2">
                2. Enter the new brand name
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-300 bg-white rounded p-2 text-gray-700 focus:outline-none focus:border-purple-500"
                placeholder="Brand name..."
                value={synthesisResponses.newBrand || ''}
                onChange={(e) => handleSynthesisQuestionChange('newBrand', e.target.value)}
              />
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <label className="block text-gray-900 mb-2">
                3. What project type?
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-300 bg-white rounded p-2 text-gray-700 focus:outline-none focus:border-purple-500"
                placeholder="Enter project type..."
                value={synthesisResponses.projectType || ''}
                onChange={(e) => handleSynthesisQuestionChange('projectType', e.target.value)}
              />
            </div>

            {/* Execute Button */}
            <button
              onClick={() => {
                console.log('Executing New Brand:', {
                  brandName: synthesisResponses.newBrand,
                  projectType: synthesisResponses.projectType
                });
                alert(`Creating synthesis for new brand: ${synthesisResponses.newBrand}`);
              }}
              disabled={!synthesisResponses.newBrand || !synthesisResponses.projectType}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Execute - New Brand
            </button>
          </div>
        )}

        {synthesisOption === 'new-project-type' && (
          <div className="space-y-4">
            {/* Execute Button */}
            <button
              onClick={() => {
                console.log('Executing New Project Type');
                alert(`Creating synthesis for new project type`);
              }}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Execute - New Project Type
            </button>
          </div>
        )}

        {synthesisOption === 'edit-existing' && (
          <div className="space-y-4">
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <label className="block text-gray-900 mb-3">
                2. Select the file to edit
              </label>
              <select
                className="w-full border-2 border-gray-300 bg-white rounded p-2 text-gray-700 focus:outline-none focus:border-purple-500"
                value={synthesisResponses.editFile || ''}
                onChange={(e) => handleSynthesisQuestionChange('editFile', e.target.value)}
              >
                <option value="">-- Select file --</option>
                {researchFiles.map((file, idx) => (
                  <option key={idx} value={file.id}>{file.fileName}</option>
                ))}
              </select>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <label className="block text-gray-900 mb-3">
                3. Edit the file
              </label>
              <textarea
                className="w-full h-20 border-2 border-gray-300 bg-white rounded p-2 text-gray-700 resize-none focus:outline-none focus:border-purple-500"
                placeholder="Edit the file content..."
                value={synthesisResponses.editContent || ''}
                onChange={(e) => handleSynthesisQuestionChange('editContent', e.target.value)}
              />
            </div>

            {/* Execute Button */}
            <button
              onClick={() => {
                console.log('Executing Edit Existing:', {
                  fileId: synthesisResponses.editFile,
                  content: synthesisResponses.editContent
                });
                alert(`Editing file: ${synthesisResponses.editFile}`);
              }}
              disabled={!synthesisResponses.editFile || !synthesisResponses.editContent}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Execute - Edit Existing
            </button>
          </div>
        )}

        {synthesisOption === 'review-edits' && (
          <div className="space-y-4">
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <label className="block text-gray-900 mb-3">
                2. Select the file to review
              </label>
              <select
                className="w-full border-2 border-gray-300 bg-white rounded p-2 text-gray-700 focus:outline-none focus:border-purple-500"
                value={synthesisResponses.reviewFile || ''}
                onChange={(e) => handleSynthesisQuestionChange('reviewFile', e.target.value)}
              >
                <option value="">-- Select file --</option>
                {researchFiles.map((file, idx) => (
                  <option key={idx} value={file.id}>{file.fileName}</option>
                ))}
              </select>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <label className="block text-gray-900 mb-3">
                3. Review the file
              </label>
              <textarea
                className="w-full h-20 border-2 border-gray-300 bg-white rounded p-2 text-gray-700 resize-none focus:outline-none focus:border-purple-500"
                placeholder="Review the file content..."
                value={synthesisResponses.reviewContent || ''}
                onChange={(e) => handleSynthesisQuestionChange('reviewContent', e.target.value)}
              />
            </div>

            {/* Execute Button */}
            <button
              onClick={() => {
                console.log('Executing Review Edits:', {
                  fileId: synthesisResponses.reviewFile,
                  content: synthesisResponses.reviewContent
                });
                alert(`Reviewing file: ${synthesisResponses.reviewFile}`);
              }}
              disabled={!synthesisResponses.reviewFile || !synthesisResponses.reviewContent}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Execute - Review Edits
            </button>
          </div>
        )}
      </div>
    );
  }

  // Personas Mode
  if (mode === 'personas') {
    return (
      <div className="space-y-4">
        {/* Mode Switcher - Always visible at top */}
        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <span className="text-gray-700 text-sm font-semibold">Research Mode:</span>
            <div className="flex gap-2 flex-1">
              <button
                onClick={() => {
                  setMode('synthesis');
                  setSelectedHexagon(null);
                  setPersonaFileForm({
                    brandScope: 'single',
                    brandName: brand,
                    categoryName: '',
                    fileName: '',
                    fileType: ''
                  });
                }}
                className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                Synthesis
              </button>
              <button
                onClick={() => setMode('personas')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-default"
              >
                Personas
              </button>
              {canApproveResearch && (
                <button
                  onClick={() => {
                    setMode('read-edit-approve');
                    setSelectedHexagon(null);
                    setPersonaFileForm({
                      brandScope: 'single',
                      brandName: brand,
                      categoryName: '',
                      fileName: '',
                      fileType: ''
                    });
                  }}
                  className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  Read/Edit/Approve
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-blue-900 leading-tight">
                Personas Mode
              </h3>
              <p className="text-blue-700 text-sm">
                Create lists of Personas for each Hexagon with key characteristics for each Persona
              </p>
            </div>
          </div>
        </div>

        {/* Hexagon Grid */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
          <h4 className="text-gray-900 mb-4">Select Workflow Step</h4>
          <div className="grid grid-cols-2 gap-3">
            {centralHexagons.map((hexagon) => {
              const existingFiles = getPersonaFiles(hexagon.id);
              const isSelected = selectedHexagon === hexagon.id;
              
              return (
                <button
                  key={hexagon.id}
                  onClick={() => setSelectedHexagon(hexagon.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    isSelected 
                      ? `${hexagon.borderColor} ${hexagon.color}` 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-gray-900 mb-1">{hexagon.label}</div>
                      <div className="text-xs text-gray-600">
                        {existingFiles.length} file{existingFiles.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="text-blue-600 flex-shrink-0">✓</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* File Creation Form */}
        {selectedHexagon && personaView === 'create' && (
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
            <h4 className="text-gray-900 mb-4">
              Create New File for {centralHexagons.find(h => h.id === selectedHexagon)?.label}
            </h4>

            <div className="space-y-4">
              {/* Brand Scope */}
              <div>
                <label className="block text-gray-700 mb-2 text-sm">Brand Scope</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="brandScope"
                      value="single"
                      checked={personaFileForm.brandScope === 'single'}
                      onChange={(e) => setPersonaFileForm({ ...personaFileForm, brandScope: e.target.value as 'single' })}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700 text-sm">Single Brand</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="brandScope"
                      value="category"
                      checked={personaFileForm.brandScope === 'category'}
                      onChange={(e) => setPersonaFileForm({ ...personaFileForm, brandScope: e.target.value as 'category' })}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700 text-sm">Category of Brands</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="brandScope"
                      value="all"
                      checked={personaFileForm.brandScope === 'all'}
                      onChange={(e) => setPersonaFileForm({ ...personaFileForm, brandScope: e.target.value as 'all' })}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700 text-sm">All Brands</span>
                  </label>
                </div>
              </div>

              {/* Brand/Category Name */}
              {personaFileForm.brandScope === 'single' && (
                <div>
                  <label className="block text-gray-700 mb-1 text-sm">Brand Name</label>
                  <input
                    type="text"
                    className="w-full border-2 border-gray-300 bg-white rounded p-2 text-gray-700 focus:outline-none focus:border-blue-500"
                    placeholder="Enter brand name..."
                    value={personaFileForm.brandName}
                    onChange={(e) => setPersonaFileForm({ ...personaFileForm, brandName: e.target.value })}
                  />
                </div>
              )}

              {personaFileForm.brandScope === 'category' && (
                <div>
                  <label className="block text-gray-700 mb-1 text-sm">Category Name</label>
                  <input
                    type="text"
                    className="w-full border-2 border-gray-300 bg-white rounded p-2 text-gray-700 focus:outline-none focus:border-blue-500"
                    placeholder="Enter category name (e.g., Athletic Footwear)..."
                    value={personaFileForm.categoryName}
                    onChange={(e) => setPersonaFileForm({ ...personaFileForm, categoryName: e.target.value })}
                  />
                </div>
              )}

              {/* Filename */}
              <div>
                <label className="block text-gray-700 mb-1 text-sm">Filename</label>
                {(() => {
                  let currentBrand = '';
                  let currentProjectType = selectedHexagon || '';
                  
                  if (personaFileForm.brandScope === 'single') {
                    currentBrand = personaFileForm.brandName;
                  } else if (personaFileForm.brandScope === 'category') {
                    currentBrand = personaFileForm.categoryName;
                  } else {
                    currentBrand = 'AllBrands';
                  }
                  
                  const defaultFileName = currentBrand && currentProjectType ? 
                    generateDefaultFileName(currentBrand, currentProjectType) : 
                    '';
                  
                  return (
                    <input
                      type="text"
                      className="w-full border-2 border-gray-300 bg-white rounded p-2 text-gray-700 focus:outline-none focus:border-blue-500"
                      placeholder={defaultFileName || 'Enter filename...'}
                      value={personaFileForm.fileName}
                      onChange={(e) => setPersonaFileForm({ ...personaFileForm, fileName: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !personaFileForm.fileName && defaultFileName) {
                          setPersonaFileForm({ ...personaFileForm, fileName: defaultFileName });
                        }
                      }}
                    />
                  );
                })()}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-gray-700 mb-1 text-sm">Upload File</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xlsx,.xls,.csv"
                  className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer text-sm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && !personaFileForm.fileName) {
                      setPersonaFileForm({ ...personaFileForm, fileName: file.name, fileType: file.type });
                    }
                  }}
                />
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreatePersonaFile}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={!personaFileForm.fileName.trim() || 
                         (personaFileForm.brandScope === 'single' && !personaFileForm.brandName.trim()) ||
                         (personaFileForm.brandScope === 'category' && !personaFileForm.categoryName.trim())}
              >
                Create Research File
              </button>
            </div>
          </div>
        )}

        {/* Existing Files for Selected Hexagon */}
        {selectedHexagon && getPersonaFiles(selectedHexagon).length > 0 && (
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
            <h4 className="text-gray-900 mb-4">
              Existing Files for {centralHexagons.find(h => h.id === selectedHexagon)?.label}
            </h4>
            <div className="space-y-2">
              {getPersonaFiles(selectedHexagon).map((file) => (
                <div key={file.id} className="border-2 border-gray-300 rounded p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-gray-900 text-sm">{file.fileName}</h5>
                        {file.isApproved ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                            Approved
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                            Pending Approval
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        {file.brand} • Uploaded: {new Date(file.uploadDate).toLocaleDateString()}
                      </div>
                    </div>
                    {canApproveResearch && (
                      <button
                        onClick={() => onToggleApproval(file.id)}
                        className={`px-3 py-1 rounded text-xs ml-2 ${
                          file.isApproved 
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {file.isApproved ? 'Unapprove' : 'Approve'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Read/Edit/Approve Mode
  if (mode === 'read-edit-approve') {
    const [selectedFile, setSelectedFile] = useState<ResearchFile | null>(null);
    const [editContent, setEditContent] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'synthesis' | 'personas'>('all');

    const getSynthesisFiles = () => {
      return researchFiles.filter(f => !f.fileType || f.fileType === 'synthesis' || !centralHexagons.find(h => h.id === f.fileType));
    };

    const getPersonasFiles = () => {
      return researchFiles.filter(f => centralHexagons.find(h => h.id === f.fileType));
    };

    const getFilteredFiles = () => {
      if (filterType === 'synthesis') return getSynthesisFiles();
      if (filterType === 'personas') return getPersonasFiles();
      return researchFiles;
    };

    return (
      <div className="space-y-4">
        {/* Mode Switcher - Always visible at top */}
        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <span className="text-gray-700 text-sm font-semibold">Research Mode:</span>
            <div className="flex gap-2 flex-1">
              <button
                onClick={() => setMode('synthesis')}
                className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                Synthesis
              </button>
              <button
                onClick={() => setMode('personas')}
                className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                Personas
              </button>
              <button
                onClick={() => setMode('read-edit-approve')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg cursor-default"
              >
                Read/Edit/Approve
              </button>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-green-900 leading-tight">
                Read/Edit/Approve Mode
              </h3>
              <p className="text-green-700 text-sm">
                Read, edit, or approve any synthesis or persona file
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Files ({researchFiles.length})
            </button>
            <button
              onClick={() => setFilterType('synthesis')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'synthesis'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Synthesis ({getSynthesisFiles().length})
            </button>
            <button
              onClick={() => setFilterType('personas')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'personas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Personas ({getPersonasFiles().length})
            </button>
          </div>

          {/* Files List */}
          <div className="space-y-2">
            <h4 className="text-gray-900 mb-3">Select a File</h4>
            {getFilteredFiles().length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No files available
              </div>
            ) : (
              getFilteredFiles().map((file) => (
                <div
                  key={file.id}
                  className={`border-2 rounded p-3 cursor-pointer transition-all ${
                    selectedFile?.id === file.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  onClick={() => {
                    setSelectedFile(file);
                    setEditContent('');
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-gray-900 text-sm">{file.fileName}</h5>
                        {file.isApproved ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                            Approved
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                            Pending Approval
                          </span>
                        )}
                        {file.fileType && centralHexagons.find(h => h.id === file.fileType) && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                            Persona
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        Brand: {file.brand} • Project Type: {file.projectType} • Uploaded: {new Date(file.uploadDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* File Actions */}
        {selectedFile && (
          <div className="space-y-4">
            {/* Read/View Section */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <h4 className="text-gray-900 mb-3">
                View File: {selectedFile.fileName}
              </h4>
              <div className="bg-gray-50 border-2 border-gray-300 rounded p-3 text-gray-700 text-sm min-h-[100px]">
                <p className="italic text-gray-500">File content would be displayed here...</p>
                <p className="mt-2 text-xs text-gray-600">
                  Brand: {selectedFile.brand} | Project Type: {selectedFile.projectType}
                </p>
              </div>
            </div>

            {/* Edit Section */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <h4 className="text-gray-900 mb-3">
                Edit File
              </h4>
              <textarea
                className="w-full h-32 border-2 border-gray-300 bg-white rounded p-3 text-gray-700 resize-none focus:outline-none focus:border-green-500"
                placeholder="Enter your edits here..."
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <button
                onClick={() => {
                  console.log('Saving edits for file:', selectedFile.id, editContent);
                  alert(`Edits saved for: ${selectedFile.fileName}`);
                  setEditContent('');
                }}
                disabled={!editContent.trim()}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Save Edits
              </button>
            </div>

            {/* Approval Section */}
            {canApproveResearch && (
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <h4 className="text-gray-900 mb-3">
                  Approval Status
                </h4>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Current Status: {selectedFile.isApproved ? (
                      <span className="text-green-600 font-semibold">Approved</span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">Pending Approval</span>
                    )}
                  </div>
                  <button
                    onClick={() => onToggleApproval(selectedFile.id)}
                    className={`px-4 py-2 rounded text-sm ${
                      selectedFile.isApproved
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {selectedFile.isApproved ? 'Unapprove File' : 'Approve File'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}