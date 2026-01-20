import { FileText, Download, Database, Clock } from 'lucide-react';

interface ResearchFile {
  id: string;
  brand: string;
  projectType: string;
  fileName: string;
  isApproved: boolean;
  uploadDate: number;
  fileType: string;
}

interface HexExecution {
  id: string;
  selectedFiles: string[];
  assessmentType: string[];
  assessment: string;
  timestamp: number;
}

interface ReviewViewProps {
  researchFiles: ResearchFile[];
  hexExecutions: { [hexId: string]: HexExecution[] };
  responses: any;
}

export function ReviewView({ researchFiles, hexExecutions, responses }: ReviewViewProps) {
  // Get all hex execution data
  const allExecutions = Object.entries(hexExecutions).flatMap(([hexId, executions]) =>
    executions.map(exec => ({ hexId, ...exec }))
  );

  // Sort executions by timestamp (most recent first)
  const sortedExecutions = allExecutions.sort((a, b) => b.timestamp - a.timestamp);

  const hexLabels: { [key: string]: string } = {
    Luminaries: 'Luminaries',
    panelist: 'Panelist',
    Consumers: 'Consumers',
    competitors: 'Competitors',
    Colleagues: 'Colleagues',
    cultural: 'Cultural Voices',
    social: 'Social Voices',
    Grade: 'Grade',
    Buzz: 'Buzz',
    Findings: 'Findings',
  };
  
  return (
    <div className="space-y-6">
      {/* Research Files Section */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Research Files ({researchFiles.length})
        </h3>
        
        {researchFiles.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-lg text-gray-600">
            No research files available
          </div>
        ) : (
          <div className="space-y-3">
            {researchFiles.map((file) => (
              <div
                key={file.id}
                className={`p-4 border-2 rounded-lg ${
                  file.isApproved
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-gray-900">{file.fileName}</div>
                    <div className="flex gap-4 mt-1">
                      <span className="text-sm text-gray-600">
                        Brand: {file.brand}
                      </span>
                      <span className="text-sm text-gray-600">
                        Type: {file.fileType}
                      </span>
                      <span className="text-sm text-gray-600">
                        Uploaded: {new Date(file.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        file.isApproved
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-400 text-white'
                      }`}
                    >
                      {file.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Execution History Section */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-600" />
          Execution History ({sortedExecutions.length} total)
        </h3>

        {sortedExecutions.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-lg text-gray-600">
            No executions recorded yet. Complete central hexagon steps to see execution history.
          </div>
        ) : (
          <div className="space-y-4">
            {sortedExecutions.map((execution, idx) => (
              <div
                key={execution.id}
                className="p-4 border-2 border-gray-300 rounded-lg bg-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm">
                      {hexLabels[execution.hexId] || execution.hexId}
                    </span>
                    <span className="text-gray-600 text-sm flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(execution.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <strong className="text-gray-900">Files Used:</strong>
                    <div className="mt-1 text-gray-700">
                      {execution.selectedFiles.join(', ')}
                    </div>
                  </div>

                  <div className="text-sm">
                    <strong className="text-gray-900">Assessment Type:</strong>
                    <div className="mt-1 text-gray-700">
                      {Array.isArray(execution.assessmentType)
                        ? execution.assessmentType
                            .map((type) =>
                              type === 'assess'
                                ? 'Assess'
                                : type === 'recommend'
                                ? 'Recommend'
                                : 'Unified Response'
                            )
                            .join(', ')
                        : execution.assessmentType === 'assess'
                        ? 'Assess'
                        : execution.assessmentType === 'recommend'
                        ? 'Recommend'
                        : 'Unified Response'}
                    </div>
                  </div>

                  <div className="text-sm">
                    <strong className="text-gray-900">Assessment Details:</strong>
                    <div className="mt-1 p-3 bg-white rounded border border-gray-300 text-gray-700">
                      {execution.assessment}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h3 className="text-blue-900 mb-3 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export All Results
        </h3>
        <p className="text-blue-700 text-sm mb-4">
          Download a comprehensive report containing all research files and execution results.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Full Report
        </button>
      </div>
    </div>
  );
}