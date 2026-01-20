import { useState } from "react";
import {
  CheckCircle,
  PlayCircle,
  FileText,
  ChevronRight,
} from "lucide-react";

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
  assessmentType: string[]; // Changed to array to support multiple selections
  assessment: string;
  timestamp: number;
}

interface CentralHexViewProps {
  hexId: string;
  hexLabel: string;
  researchFiles: ResearchFile[];
  onExecute: (
    selectedFiles: string[],
    assessmentType: string[], // Changed to array
    assessment: string,
  ) => void;
  databricksInstructions?: string;
  previousExecutions: HexExecution[];
  onSaveRecommendation?: (recommendation: string, hexId: string) => void;
}

export function CentralHexView({
  hexId,
  hexLabel,
  researchFiles,
  onExecute,
  databricksInstructions,
  previousExecutions,
  onSaveRecommendation,
}: CentralHexViewProps) {
  // Set initial step based on hexId - Competitors starts at step 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(hexId === 'competitors' ? 3 : 1);
  const [selectedFiles, setSelectedFiles] = useState<string[]>(
    [],
  );
  const [assessmentType, setAssessmentType] = useState<string[]>([
    "unified"
  ]); // Changed to array to support multiple selections
  const [testingScale, setTestingScale] = useState<string>("");
  const [assessment, setAssessment] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [sendToKnowledgeBase, setSendToKnowledgeBase] = useState(false);
  const [recommendationText, setRecommendationText] = useState("");

  // Competitors-specific state
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>("");
  const [competitorAnalysisType, setCompetitorAnalysisType] = useState<string>("");

  // Filter research files relevant to this hex
  const relevantFiles = researchFiles.filter(
    (file) => file.isApproved && file.fileType === hexId,
  );

  const handleFileToggle = (fileName: string) => {
    if (selectedFiles.includes(fileName)) {
      setSelectedFiles(
        selectedFiles.filter((f) => f !== fileName),
      );
    } else {
      setSelectedFiles([...selectedFiles, fileName]);
    }
  };

  const handleAssessmentTypeChange = (type: string) => {
    if (assessmentType.includes(type)) {
      // Remove the type if it's already selected
      const newTypes = assessmentType.filter(t => t !== type);
      // Ensure at least one type is always selected
      if (newTypes.length > 0) {
        setAssessmentType(newTypes);
      }
    } else {
      // Add the type to the selection
      setAssessmentType([...assessmentType, type]);
    }
  };

  const handleExecute = () => {
    // For competitors, only validate competitor selection and analysis type
    if (hexId === 'competitors') {
      if (!selectedCompetitor || !competitorAnalysisType) {
        alert("Please select a competitor and analysis type");
        return;
      }
    } else {
      // For other hexes, validate files and assessment
      if (selectedFiles.length === 0 || !assessment.trim()) {
        alert(
          "Please select at least one file and provide an assessment",
        );
        return;
      }
    }

    onExecute(selectedFiles, assessmentType, assessment);

    // Reset for next execution
    setCurrentStep(hexId === 'competitors' ? 3 : 1);
    setSelectedFiles([]);
    setAssessmentType(["unified"]);
    setAssessment("");
    
    // Reset competitors-specific fields
    if (hexId === 'competitors') {
      setSelectedCompetitor("");
      setCompetitorAnalysisType("");
    }

    alert(
      "Process executed successfully! Data has been sent to Databricks.",
    );
  };

  const canProceedToStep2 = selectedFiles.length > 0;
  const canProceedToStep3 =
    hexId === "Grade"
      ? canProceedToStep2 && testingScale
      : canProceedToStep2 && assessmentType.length > 0;
  const canExecute =
    hexId === 'competitors' 
      ? selectedCompetitor.length > 0 && competitorAnalysisType.length > 0
      : canProceedToStep3 && assessment.trim().length > 0;

  return (
    <div className="space-y-2">
      {/* Step Progress Indicator - Hidden for Competitors */}
      {hexId !== 'competitors' && (
        <div className="flex items-center justify-between pb-1 border-b-2 border-gray-300">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <button
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    currentStep === step
                      ? "bg-blue-600 text-white border-blue-600"
                      : currentStep > step
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-gray-200 text-gray-600 border-gray-300"
                  }`}
                  onClick={() => {
                    if (step === 1) setCurrentStep(1);
                    if (step === 2 && canProceedToStep2)
                      setCurrentStep(2);
                    if (step === 3 && canProceedToStep3)
                      setCurrentStep(3);
                  }}
                  disabled={
                    (step === 2 && !canProceedToStep2) ||
                    (step === 3 && !canProceedToStep3)
                  }
                >
                  {currentStep > step ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </button>
                {step < 3 && (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Step {currentStep} of 3
            </span>
            {previousExecutions.length > 0 && (
              <button
                className="px-3 py-1 border-2 border-gray-400 text-gray-700 rounded text-sm hover:bg-gray-50"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? "Hide" : "Show"} History (
                {previousExecutions.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* History Button for Competitors (without step indicator) */}
      {hexId === 'competitors' && previousExecutions.length > 0 && (
        <div className="flex justify-end pb-1 border-b-2 border-gray-300">
          <button
            className="px-3 py-1 border-2 border-gray-400 text-gray-700 rounded text-sm hover:bg-gray-50"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "Hide" : "Show"} History (
            {previousExecutions.length})
          </button>
        </div>
      )}

      {/* History View */}
      {showHistory && previousExecutions.length > 0 && (
        <div className="mb-2 p-2">
          <h3 className="text-gray-900 mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Execution History
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {previousExecutions.map((execution, idx) => (
              <div
                key={execution.id}
                className="p-2 bg-white border border-gray-300 rounded"
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-900">
                    Execution #{previousExecutions.length - idx}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(
                      execution.timestamp,
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-700 mb-1">
                  <strong>Files:</strong>{" "}
                  {execution.selectedFiles.join(", ")}
                </div>
                <div className="text-sm text-gray-700 mb-1">
                  <strong>Type:</strong>{" "}
                  {Array.isArray(execution.assessmentType) 
                    ? execution.assessmentType.map(type => 
                        type === 'assess' ? 'Assess' : 
                        type === 'recommend' ? 'Recommend' : 
                        'Unified'
                      ).join(', ')
                    : execution.assessmentType === "assess"
                      ? "Assess"
                      : execution.assessmentType === "recommend"
                        ? "Recommend"
                        : "Unified"
                  }
                </div>
                <div className="text-sm text-gray-700">
                  <strong>Assessment:</strong>
                  <div className="mt-1 p-2 rounded text-xs border border-gray-200">
                    {execution.assessment}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitors-specific dropdowns */}
      {hexId === 'competitors' && (
        <div className="p-3 border-b-2 border-gray-300">
          <div className="space-y-3">
            {/* Competitor Selector */}
            <div>
              <label className="block text-gray-900 mb-1 font-semibold">
                Select Competitor
              </label>
              <select
                className="w-full border-2 border-gray-300 bg-white rounded p-2 text-gray-700 focus:outline-none focus:border-blue-500"
                value={selectedCompetitor}
                onChange={(e) => setSelectedCompetitor(e.target.value)}
              >
                <option value="">Choose a competitor...</option>
                <option value="Puma">Competitor A</option>
                <option value="Under Armour">Competitor B</option>
                <option value="New Balance">Competitor C</option>
                <option value="Lululemon">Competitor D</option>
                <option value="Converse">Competitor E</option>
              </select>
            </div>

            {/* Analysis Type */}
            <div>
              <label className="block text-gray-900 mb-1 font-semibold">
                Analysis Type
              </label>
              <select
                className="w-full border-2 border-gray-300 bg-white rounded p-2 text-gray-700 focus:outline-none focus:border-blue-500"
                value={competitorAnalysisType}
                onChange={(e) => setCompetitorAnalysisType(e.target.value)}
              >
                <option value="">Choose analysis type...</option>
                <option value="compare-assets">Compare Assets</option>
                <option value="strengths-weaknesses">Identify Strengths and Weaknesses</option>
                <option value="propose-improvements">Propose Improvements</option>
              </select>
            </div>

            {/* Show current selections */}
            {(selectedCompetitor || competitorAnalysisType) && (
              <div className="p-2 border-2 border-blue-500 rounded">
                <p className="text-sm text-gray-700">
                  {selectedCompetitor && (
                    <span className="block">
                      <strong>Competitor:</strong> {selectedCompetitor}
                    </span>
                  )}
                  {competitorAnalysisType && (
                    <span className="block">
                      <strong>Analysis:</strong>{" "}
                      {competitorAnalysisType === 'compare-assets' ? 'Compare Assets' :
                       competitorAnalysisType === 'strengths-weaknesses' ? 'Identify Strengths and Weaknesses' :
                       'Propose Improvements'}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Execute Button for Competitors */}
            <button
              className="w-full px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              onClick={handleExecute}
              disabled={!canExecute}
            >
              <PlayCircle className="w-5 h-5" />
              Execute Process
            </button>
          </div>
        </div>
      )}

      {/* Step 1: File Selection */}
      {currentStep === 1 && (
        <div className="p-3">
          <h3 className="text-gray-900 leading-tight">
            Step 1: Select Knowledge Base Files
          </h3>
          <p className="text-gray-600 mb-2">
            Choose the knowledge files you want to include in
            this {hexLabel} process.
          </p>

          {relevantFiles.length === 0 ? (
            <div className="p-2 border-2 border-yellow-500">
              <p className="text-yellow-800">
                No approved knowledge base files available for this
                hexagon. Please upload and approve files in the
                Knowledge Base step first.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {relevantFiles.map((file) => (
                <label
                  key={file.id}
                  className="flex items-center gap-2 p-2 cursor-pointer transition-all"
                >
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(
                      file.fileName,
                    )}
                    onChange={() =>
                      handleFileToggle(file.fileName)
                    }
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="text-gray-900">
                      {file.fileName}
                    </div>
                    <div className="text-sm text-gray-500">
                      Uploaded:{" "}
                      {new Date(
                        file.uploadDate,
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  {selectedFiles.includes(file.fileName) && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </label>
              ))}
            </div>
          )}

          {selectedFiles.length > 0 && (
            <div className="mt-2 p-2 border-2 border-green-500">
              <p className="text-green-800">
                <strong>{selectedFiles.length}</strong> file(s)
                selected
              </p>
            </div>
          )}

          <div className="flex justify-end mt-3">
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentStep(2)}
              disabled={!canProceedToStep2}
            >
              Next: Choose Assessment Type/Scale →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Assessment Type */}
      {currentStep === 2 && (
        <div className="p-3">
          {hexId === "Grade" ? (
            <>
              <h3 className="text-gray-900 leading-tight">
                Step 2: What grading scale should be used?
              </h3>
              <p className="text-gray-600 mb-2">
                Select the grading scale for segment evaluation.
              </p>

              <div className="space-y-1">
                <label
                  className="flex items-center gap-2 p-2 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="testingScale"
                    value="scale-1-5-written"
                    checked={testingScale === "scale-1-5-written"}
                    onChange={(e) => setTestingScale(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="text-gray-900 font-semibold">
                      Scale of 1-5 with written assessments
                    </div>
                  </div>
                </label>

                <label
                  className="flex items-start gap-2 p-2 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="testingScale"
                    value="scale-1-5-no-written"
                    checked={testingScale === "scale-1-5-no-written"}
                    onChange={(e) => setTestingScale(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="text-gray-900 font-semibold">
                      Scale of 1-5 with no written assessments
                    </div>
                  </div>
                </label>

                <label
                  className="flex items-start gap-2 p-2 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="testingScale"
                    value="scale-1-10-written"
                    checked={testingScale === "scale-1-10-written"}
                    onChange={(e) => setTestingScale(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="text-gray-900 font-semibold">
                      Scale of 1-10 written assessments
                    </div>
                  </div>
                </label>

                <label
                  className="flex items-start gap-2 p-2 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="testingScale"
                    value="scale-1-10-no-written"
                    checked={testingScale === "scale-1-10-no-written"}
                    onChange={(e) => setTestingScale(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="text-gray-900 font-semibold">
                      Scale of 1-10 no written assessments
                    </div>
                  </div>
                </label>

                <label
                  className="flex items-start gap-2 p-2 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="testingScale"
                    value="no-scale-written"
                    checked={testingScale === "no-scale-written"}
                    onChange={(e) => setTestingScale(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="text-gray-900 font-semibold">
                      No scale, just written assessments
                    </div>
                  </div>
                </label>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-gray-900 leading-tight">
                Step 2: Choose Assessment Type
              </h3>
              <p className="text-gray-600 mb-2">
                Select how you want to process the selected
                files.
              </p>

              <div className="space-y-1">
                <label
                  className="flex items-start gap-2 p-2 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={assessmentType.includes("assess")}
                    onChange={() => handleAssessmentTypeChange("assess")}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="text-gray-900 font-semibold">
                      Assess
                    </div>
                    <div className="text-sm text-gray-600">
                      Evaluate and analyze the current state
                      based on the selected knowledge base files
                    </div>
                  </div>
                </label>

                <label
                  className="flex items-start gap-2 p-2 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={assessmentType.includes("recommend")}
                    onChange={() => handleAssessmentTypeChange("recommend")}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="text-gray-900 font-semibold">
                      Recommend
                    </div>
                    <div className="text-sm text-gray-600">
                      Generate recommendations and action items
                      based on the knowledge base
                    </div>
                  </div>
                </label>

                <label
                  className="flex items-start gap-2 p-2 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={assessmentType.includes("unified")}
                    onChange={() => handleAssessmentTypeChange("unified")}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="text-gray-900 font-semibold">
                      Unified Response (Combine all experts responses into a single response)
                    </div>
                    <div className="text-sm text-gray-600">
                      This button combines the assessments and
                      recommendations of all personas to a
                      single unified response
                    </div>
                  </div>
                </label>
              </div>
            </>
          )}

          <div className="flex justify-between mt-6">
            <button
              className="px-6 py-2 border-2 border-gray-400 text-gray-700 rounded hover:bg-gray-50"
              onClick={() => setCurrentStep(1)}
            >
              ← Back
            </button>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setCurrentStep(3)}
            >
              Next: Provide Assessment →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Assessment Input */}
      {currentStep === 3 && hexId !== 'competitors' && (
        <div className="p-3">
          <h3 className="text-gray-900 leading-tight">
            Step 3: Provide Your Assessment
          </h3>
          <p className="text-gray-600 mb-2">
            Enter your assessment or instructions for how to
            process these files.
          </p>

          <div className="mb-2">
            <label className="block text-gray-900 mb-1">
              Assessment / Instructions
            </label>
            <textarea
              className="w-full h-40 border-2 border-gray-300 bg-white rounded p-3 text-gray-700 resize-none focus:outline-none focus:border-blue-500"
              placeholder={`Enter your ${assessmentType.includes("assess") ? "assessment criteria" : assessmentType.includes("recommend") ? "recommendation requirements" : "assessment and recommendation instructions"}...`}
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
            />
            <div className="text-sm text-gray-500 mt-1">
              {assessment.length} characters
            </div>
          </div>

          {/* Summary - Hidden for Competitors */}
          {hexId !== 'competitors' && (
            <div className="p-2 mb-2 border-2 border-blue-500">
              <h4 className="text-gray-900 font-semibold mb-2">
                Execution Summary
              </h4>
              <div className="text-sm text-gray-700 space-y-1">
                <div>
                  <strong>Files:</strong> {selectedFiles.length}{" "}
                  selected
                </div>
                <div>
                  <strong>Type:</strong>{" "}
                  {assessmentType.map(type => 
                    type === 'assess' ? 'Assess' : 
                    type === 'recommend' ? 'Recommend' : 
                    'Unified'
                  ).join(', ')}
                </div>
                {databricksInstructions && (
                  <div className="mt-2 pt-2 border-t border-blue-400">
                    <strong>Databricks Instructions:</strong>
                    <div className="mt-1 text-xs italic">
                      {databricksInstructions}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-3">
            {hexId !== 'competitors' && (
              <button
                className="px-6 py-2 border-2 border-gray-400 text-gray-700 rounded hover:bg-gray-50"
                onClick={() => setCurrentStep(2)}
              >
                ← Back
              </button>
            )}
            <button
              className={`px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${hexId === 'competitors' ? 'w-full justify-center' : ''}`}
              onClick={handleExecute}
              disabled={!canExecute}
            >
              <PlayCircle className="w-5 h-5" />
              Execute Process
            </button>
          </div>
        </div>
      )}

      {/* Selected Files Preview (always visible) */}
      {selectedFiles.length > 0 && currentStep > 1 && (
        <div className="p-4 rounded-lg border border-gray-300">
          <h4 className="text-gray-900 font-semibold mb-2">
            Selected Files:
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((fileName, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {fileName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Send Recommendations to Knowledge base */}
      <div className="p-3 border-t-2 border-gray-300 mt-4">
        <label className="flex items-center gap-2 cursor-pointer mb-2">
          <input
            type="checkbox"
            checked={sendToKnowledgeBase}
            onChange={(e) => setSendToKnowledgeBase(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-gray-900">
            Send Recommendations to Knowledge Base
          </span>
        </label>
        
        {sendToKnowledgeBase && (
          <div className="space-y-2">
            <textarea
              className="w-full h-24 border-2 border-gray-300 bg-white rounded p-2 text-gray-700 resize-none focus:outline-none focus:border-blue-500"
              placeholder="Enter your recommendations for the knowledge base..."
              value={recommendationText}
              onChange={(e) => setRecommendationText(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!recommendationText.trim()}
              onClick={() => {
                if (recommendationText.trim()) {
                  // TODO: Add to research/knowledge base recommendations
                  if (onSaveRecommendation) {
                    onSaveRecommendation(recommendationText, hexId);
                  }
                  alert('Recommendation saved to Knowledge base!');
                  setRecommendationText('');
                  setSendToKnowledgeBase(false);
                }
              }}
            >
              Save to Knowledge base
            </button>
          </div>
        )}
      </div>
    </div>
  );
}