/**
 * Databricks File Client
 * Handles communication with the Flask API for loading files from Databricks
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface DatabricksFile {
  name: string;
  path: string;
  type: 'workspace' | 'volume' | 'dbfs';
  size?: number;
  modified_at?: number;
}

export interface FileListResponse {
  path: string;
  files: DatabricksFile[];
  count: number;
}

export interface FileReadResponse {
  path: string;
  name: string;
  content: string;
  encoding: 'text' | 'base64';
}

/**
 * List files from a Databricks location
 */
export async function listDatabricksFiles(
  path: string,
  fileTypes?: string[]
): Promise<FileListResponse> {
  const params = new URLSearchParams({ path });
  if (fileTypes && fileTypes.length > 0) {
    params.append('file_types', fileTypes.join(','));
  }

  const response = await fetch(`${API_URL}/api/files/list?${params}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to list files');
  }

  return response.json();
}

/**
 * Read a file from Databricks
 */
export async function readDatabricksFile(
  path: string,
  encoding: 'text' | 'base64' = 'text'
): Promise<FileReadResponse> {
  const response = await fetch(`${API_URL}/api/files/read`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path, encoding }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to read file');
  }

  return response.json();
}

/**
 * Check if Databricks API is available
 */
export async function checkDatabricksHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    return response.ok;
  } catch (error) {
    console.error('Databricks API health check failed:', error);
    return false;
  }
}

/**
 * Common Databricks paths for quick access
 */
export const DATABRICKS_PATHS = {
  workspace: '/Workspace/Shared',
  workspaceUsers: '/Workspace/Users',
  volumes: '/Volumes',
  dbfs: 'dbfs:/FileStore',
};

/**
 * Supported file types for research synthesis
 */
export const RESEARCH_FILE_TYPES = [
  'pdf',
  'docx',
  'doc',
  'txt',
  'md',
  'csv',
  'xlsx',
  'xls',
];
