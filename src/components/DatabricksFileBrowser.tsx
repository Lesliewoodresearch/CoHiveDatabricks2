import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { 
  FolderIcon, 
  FileIcon, 
  ChevronRight, 
  Download, 
  Search,
  RefreshCw,
  Database,
  HardDrive,
  FolderOpen,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  listDatabricksFiles, 
  readDatabricksFile, 
  checkDatabricksHealth,
  DATABRICKS_PATHS,
  RESEARCH_FILE_TYPES,
  type DatabricksFile 
} from '../utils/databricksClient';
import { colors, spacing } from '../styles/cohive-theme';

interface DatabricksFileBrowserProps {
  open: boolean;
  onClose: () => void;
  onFilesSelected: (files: Array<{ name: string; content: string; source: string }>, autoApprove: boolean) => void;
}

export function DatabricksFileBrowser({ open, onClose, onFilesSelected }: DatabricksFileBrowserProps) {
  const [currentPath, setCurrentPath] = useState(DATABRICKS_PATHS.workspace);
  const [files, setFiles] = useState<DatabricksFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [importing, setImporting] = useState(false);
  const [autoApprove, setAutoApprove] = useState(true); // Auto-approve by default for Databricks files

  // Check API health on mount
  useEffect(() => {
    if (open) {
      checkHealth();
    }
  }, [open]);

  // Load files when path changes
  useEffect(() => {
    if (open && isHealthy) {
      loadFiles();
    }
  }, [currentPath, open, isHealthy]);

  const checkHealth = async () => {
    const healthy = await checkDatabricksHealth();
    setIsHealthy(healthy);
    if (!healthy) {
      setError('Unable to connect to Databricks API. Please ensure the backend is running.');
    }
  };

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listDatabricksFiles(currentPath, RESEARCH_FILE_TYPES);
      setFiles(response.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFileSelection = (filePath: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filePath)) {
      newSelected.delete(filePath);
    } else {
      newSelected.add(filePath);
    }
    setSelectedFiles(newSelected);
  };

  const handleImportSelected = async () => {
    if (selectedFiles.size === 0) return;

    setImporting(true);
    setError(null);

    try {
      const importedFiles = [];
      
      for (const filePath of selectedFiles) {
        try {
          const fileData = await readDatabricksFile(filePath, 'text');
          importedFiles.push({
            name: fileData.name,
            content: fileData.content,
            source: `Databricks: ${filePath}`
          });
        } catch (err) {
          console.error(`Failed to read file ${filePath}:`, err);
          // Continue with other files
        }
      }

      if (importedFiles.length > 0) {
        onFilesSelected(importedFiles, autoApprove);
        setSelectedFiles(new Set());
        onClose();
      } else {
        setError('Failed to import any files. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import files');
    } finally {
      setImporting(false);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'workspace':
        return <FolderOpen className="h-4 w-4" />;
      case 'volume':
        return <Database className="h-4 w-4" />;
      case 'dbfs':
        return <HardDrive className="h-4 w-4" />;
      default:
        return <FolderIcon className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col" style={{ backgroundColor: colors.background.primary }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3" style={{ color: colors.text.primary }}>
            <Database className="h-6 w-6" style={{ color: colors.accent.purple }} />
            Import from Databricks
          </DialogTitle>
          <DialogDescription style={{ color: colors.text.secondary }}>
            Select research files from your Databricks workspace, volumes, or DBFS
          </DialogDescription>
        </DialogHeader>

        {/* Location Selector */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={currentPath.startsWith('/Workspace') ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentPath(DATABRICKS_PATHS.workspace)}
            className="gap-2"
            style={currentPath.startsWith('/Workspace') ? { backgroundColor: colors.accent.purple } : {}}
          >
            <FolderOpen className="h-4 w-4" />
            Workspace
          </Button>
          <Button
            variant={currentPath.startsWith('/Volumes') ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentPath(DATABRICKS_PATHS.volumes)}
            className="gap-2"
            style={currentPath.startsWith('/Volumes') ? { backgroundColor: colors.accent.purple } : {}}
          >
            <Database className="h-4 w-4" />
            Volumes
          </Button>
          <Button
            variant={currentPath.startsWith('dbfs:') ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentPath(DATABRICKS_PATHS.dbfs)}
            className="gap-2"
            style={currentPath.startsWith('dbfs:') ? { backgroundColor: colors.accent.purple } : {}}
          >
            <HardDrive className="h-4 w-4" />
            DBFS
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadFiles}
            disabled={loading}
            className="ml-auto gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Current Path & Search */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm" style={{ color: colors.text.secondary }}>
            <FolderIcon className="h-4 w-4" />
            <span className="font-mono">{currentPath}</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: colors.text.secondary }} />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: '#fee', color: '#c33' }}>
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* File List */}
        <ScrollArea className="flex-1 border rounded-lg" style={{ borderColor: colors.border.default }}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: colors.accent.purple }} />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <FileIcon className="h-12 w-12" style={{ color: colors.text.tertiary }} />
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                {searchTerm ? 'No files match your search' : 'No files found in this location'}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredFiles.map((file) => {
                const isSelected = selectedFiles.has(file.path);
                return (
                  <div
                    key={file.path}
                    onClick={() => toggleFileSelection(file.path)}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md"
                    style={{
                      borderColor: isSelected ? colors.accent.purple : colors.border.default,
                      backgroundColor: isSelected ? colors.background.hexHover : colors.background.secondary
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleFileSelection(file.path)}
                      className="h-4 w-4 rounded"
                      style={{ accentColor: colors.accent.purple }}
                    />
                    
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileIcon className="h-5 w-5 flex-shrink-0" style={{ color: colors.accent.purple }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: colors.text.primary }}>
                          {file.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: colors.text.secondary }}>
                          {file.path}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant="outline" className="gap-1">
                        {getLocationIcon(file.type)}
                        {file.type}
                      </Badge>
                      <span className="text-xs" style={{ color: colors.text.secondary }}>
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.border.default }}>
          <div className="flex items-center gap-4">
            <div className="text-sm" style={{ color: colors.text.secondary }}>
              {selectedFiles.size > 0 ? (
                <span className="font-medium" style={{ color: colors.accent.purple }}>
                  {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
                </span>
              ) : (
                <span>Select files to import</span>
              )}
            </div>
            
            {/* Auto-approve checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                className="h-4 w-4 rounded"
                style={{ accentColor: colors.accent.purple }}
              />
              <span className="text-sm" style={{ color: colors.text.primary }}>
                Auto-approve imported files
              </span>
            </label>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={importing}>
              Cancel
            </Button>
            <Button
              onClick={handleImportSelected}
              disabled={selectedFiles.size === 0 || importing}
              className="gap-2"
              style={{ backgroundColor: colors.accent.purple }}
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Import {selectedFiles.size > 0 ? `(${selectedFiles.size})` : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}