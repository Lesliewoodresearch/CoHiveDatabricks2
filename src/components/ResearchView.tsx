import { useState } from 'react';
import { DatabricksFileBrowser } from './DatabricksFileBrowser';
import { Database } from 'lucide-react';

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

interface EditSuggestion {
  id: string;
  researchFileId: string;
  fileName: string;
  suggestedBy: string;
  suggestion: string;
  timestamp: number;
  status: 'pending' | 'reviewed' | 'implemented';
}

interface ResearchViewProps {
  role: 'researcher' | 'non-researcher';
  brand: string;
  projectType: string;
  researchFiles: ResearchFile[];
  editSuggestions: EditSuggestion[];
  onAddSuggestion: (fileId: string, suggestion: string) => void;
  onUpdateSuggestionStatus: (suggestionId: string, status: 'pending' | 'reviewed' | 'implemented') => void;
  onToggleApproval: (fileId: string) => void;
  canApproveResearch: boolean;
  onCreateResearchFile: (file: Omit<ResearchFile, 'id' | 'uploadDate'>) => void;
}

export function ResearchView({ 
  role, 
  brand, 
  projectType, 
  researchFiles,
  editSuggestions,
  onAddSuggestion,
  onUpdateSuggestionStatus,
  onToggleApproval,
  canApproveResearch,
  onCreateResearchFile
}: ResearchViewProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [showDatabricksBrowser, setShowDatabricksBrowser] = useState(false);

  // Filter files based on brand and project type
  const filteredFiles = researchFiles.filter(
    file => file.brand.toLowerCase() === brand.toLowerCase() && 
            file.projectType.toLowerCase() === projectType.toLowerCase()
  );

  // For non-researcher, only show approved files
  const displayFiles = role === 'researcher' 
    ? filteredFiles 
    : filteredFiles.filter(file => file.isApproved);

  const handleAddSuggestion = (fileId: string) => {
    if (newSuggestion.trim()) {
      onAddSuggestion(fileId, newSuggestion);
      setNewSuggestion('');
      setShowSuggestionForm(false);
    }
  };

  const handleDatabricksFilesSelected = (files: Array<{ name: string; content: string; source: string }>, autoApprove: boolean) => {
    // Create research files from imported Databricks files
    files.forEach(file => {
      const newFile: Omit<ResearchFile, 'id' | 'uploadDate'> = {
        brand,
        projectType,
        fileName: file.name,
        isApproved: autoApprove, // Use the autoApprove setting from the browser
        fileType: 'text/plain', // Could be enhanced to detect file type
        content: file.content, // Store the actual file content
        source: file.source // Store the source path for reference
      };
      onCreateResearchFile(newFile);
    });
  };

  // Non-Researcher View: Simple view with read/download/suggest
  if (role === 'non-researcher') {
    return (
      <div className="space-y-2">
        <div className="bg-blue-50 border-2 border-blue-200 p-2 mb-2">
          <h3 className="text-blue-900 leading-tight">Available Research Reports</h3>
          <p className="text-blue-700 text-sm">
            Approved research files for {brand} - {projectType}
          </p>
        </div>

        {displayFiles.length === 0 ? (
          <div className="bg-gray-100 border-2 border-gray-300 p-4 text-center">
            <p className="text-gray-600">No approved research files available for this brand and project type.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayFiles.map((file) => (
              <div key={file.id} className="bg-white border-2 border-gray-300 p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-gray-900">{file.fileName}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                          {file.fileType}
                        </span>
                      </span>
                      <span>Uploaded: {new Date(file.uploadDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      className="px-3 py-1.5 border-2 border-gray-400 bg-white text-gray-700 rounded hover:bg-gray-50 text-sm"
                      onClick={() => setSelectedFile(selectedFile === file.id ? null : file.id)}
                    >
                      Read
                    </button>
                    <button className="px-3 py-1.5 border-2 border-gray-400 bg-white text-gray-700 rounded hover:bg-gray-50 text-sm">
                      Download
                    </button>
                    <button 
                      className="px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                      onClick={() => {
                        setSelectedFile(file.id);
                        setShowSuggestionForm(true);
                      }}
                    >
                      Suggest Edit
                    </button>
                  </div>
                </div>

                {/* File Preview */}
                {selectedFile === file.id && !showSuggestionForm && (
                  <div className="mt-4 pt-4 border-t-2 border-gray-200">
                    <div className="bg-gray-50 border-2 border-gray-300 rounded p-4 h-64 overflow-y-auto">
                      {file.content ? (
                        // Show actual file content if available
                        <div className="space-y-3">
                          {file.source && (
                            <p className="text-xs text-gray-500 border-b pb-2">
                              <strong>Source:</strong> {file.source}
                            </p>
                          )}
                          <pre className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                            {file.content}
                          </pre>
                        </div>
                      ) : (
                        // Show mock preview if no content
                        <p className="text-gray-700 text-sm leading-relaxed">
                          <strong>Document Preview:</strong> {file.fileName}<br /><br />
                          This is a mock preview of the research document. In a production environment, this would display the actual content of the PDF, spreadsheet, or document file.
                          <br /><br />
                          <strong>Executive Summary:</strong><br />
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                          <br /><br />
                          <strong>Key Findings:</strong><br />
                          • Finding 1: Market share has increased by 15%<br />
                          • Finding 2: Customer satisfaction ratings are at 4.5/5<br />
                          • Finding 3: Brand awareness has grown in target demographics
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Suggestion Form */}
                {selectedFile === file.id && showSuggestionForm && (
                  <div className="mt-4 pt-4 border-t-2 border-gray-200">
                    <h5 className="text-gray-900 mb-2">Suggest an Edit</h5>
                    <textarea
                      className="w-full h-24 border-2 border-gray-300 bg-white rounded p-2 text-gray-700 resize-none focus:outline-none focus:border-blue-500"
                      placeholder="Describe the edit or improvement you'd like to suggest..."
                      value={newSuggestion}
                      onChange={(e) => setNewSuggestion(e.target.value)}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        onClick={() => handleAddSuggestion(file.id)}
                      >
                        Submit Suggestion
                      </button>
                      <button
                        className="px-4 py-2 border-2 border-gray-400 bg-white text-gray-700 rounded hover:bg-gray-50 text-sm"
                        onClick={() => {
                          setShowSuggestionForm(false);
                          setNewSuggestion('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Researcher View: Complex view with file management and suggestions
  const fileSuggestions = (fileId: string) => 
    editSuggestions.filter(s => s.researchFileId === fileId);

  return (
    <div className="space-y-3">
      <div className="bg-purple-50 border-2 border-purple-200 p-2">
        <h3 className="text-purple-900 leading-tight">Research Management Dashboard</h3>
        <p className="text-purple-700 text-sm">
          Manage research files for {brand} - {projectType}
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white border-2 border-gray-300 p-3">
        <h4 className="text-gray-900 mb-3">
          Upload New Research File
        </h4>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.xlsx,.xls,.csv"
          className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const newFile: Omit<ResearchFile, 'id' | 'uploadDate'> = {
                brand,
                projectType,
                fileName: file.name,
                isApproved: false,
                fileType: file.type,
              };
              onCreateResearchFile(newFile);
            }
          }}
        />
        <button
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          onClick={() => setShowDatabricksBrowser(true)}>
          Import from Databricks
        </button>
      </div>

      {/* Databricks File Browser */}
      <DatabricksFileBrowser
        open={showDatabricksBrowser}
        onClose={() => setShowDatabricksBrowser(false)}
        onFilesSelected={handleDatabricksFilesSelected}
      />

      {/* Files List */}
      <div className="space-y-2">
        <h4 className="text-gray-900">Research Files ({filteredFiles.length})</h4>
        
        {filteredFiles.length === 0 ? (
          <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-600">No research files for this brand and project type.</p>
          </div>
        ) : (
          filteredFiles.map((file) => {
            const suggestions = fileSuggestions(file.id);
            const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
            
            return (
              <div key={file.id} className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-gray-900">{file.fileName}</h4>
                      {file.isApproved ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                          Pending Approval
                        </span>
                      )}
                      {file.source?.startsWith('Databricks:') && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          Databricks
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                        {file.fileType}
                      </span>
                      <span>Uploaded: {new Date(file.uploadDate).toLocaleDateString()}</span>
                      {pendingSuggestions.length > 0 && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs">
                          {pendingSuggestions.length} pending suggestion{pendingSuggestions.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      className="px-3 py-1.5 border-2 border-gray-400 bg-white text-gray-700 rounded hover:bg-gray-50 text-sm"
                      onClick={() => setSelectedFile(selectedFile === file.id ? null : file.id)}
                    >
                      {selectedFile === file.id ? 'Hide Details' : 'View Details'}
                    </button>
                    <button 
                      className={`px-3 py-1.5 rounded text-sm ${
                        file.isApproved 
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                      onClick={() => onToggleApproval(file.id)}
                      disabled={!canApproveResearch}
                    >
                      {file.isApproved ? 'Unapprove' : 'Approve'}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedFile === file.id && (
                  <div className="mt-4 pt-4 border-t-2 border-gray-200 space-y-4">
                    {/* File Preview */}
                    <div>
                      <h5 className="text-gray-900 mb-2">Document Preview</h5>
                      <div className="bg-gray-50 border-2 border-gray-300 rounded p-4 h-48 overflow-y-auto">
                        {file.content ? (
                          // Show actual file content if available
                          <div className="space-y-3">
                            {file.source && (
                              <p className="text-xs text-gray-500 border-b pb-2">
                                <strong>Source:</strong> {file.source}
                              </p>
                            )}
                            <pre className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                              {file.content}
                            </pre>
                          </div>
                        ) : (
                          // Show mock preview if no content
                          <p className="text-gray-700 text-sm leading-relaxed">
                            <strong>Document:</strong> {file.fileName}<br /><br />
                            This is a mock preview. In production, this would show the actual file content.
                            <br /><br />
                            <strong>Research Summary:</strong><br />
                            Comprehensive analysis of {brand} market performance for {projectType}.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Edit Suggestions */}
                    <div>
                      <h5 className="text-gray-900 mb-2">Edit Suggestions ({suggestions.length})</h5>
                      {suggestions.length === 0 ? (
                        <p className="text-gray-500 text-sm">No suggestions yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {suggestions.map((suggestion) => (
                            <div 
                              key={suggestion.id} 
                              className={`border-2 rounded p-3 ${
                                suggestion.status === 'pending' ? 'border-orange-300 bg-orange-50' :
                                suggestion.status === 'reviewed' ? 'border-blue-300 bg-blue-50' :
                                'border-green-300 bg-green-50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm text-gray-700">{suggestion.suggestedBy}</span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(suggestion.timestamp).toLocaleDateString()}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                      suggestion.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                      suggestion.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {suggestion.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">{suggestion.suggestion}</p>
                                </div>
                                {suggestion.status === 'pending' && (
                                  <div className="flex gap-1">
                                    <button
                                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                      onClick={() => onUpdateSuggestionStatus(suggestion.id, 'reviewed')}
                                      title="Mark as reviewed"
                                    >
                                      Review
                                    </button>
                                    <button
                                      className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                      onClick={() => onUpdateSuggestionStatus(suggestion.id, 'implemented')}
                                      title="Mark as implemented"
                                    >
                                      Implement
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}