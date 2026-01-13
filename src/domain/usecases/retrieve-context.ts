export interface RetrieveContextParams {
  projectName: string;
  localPath?: string;
}

export interface RetrieveContextResult {
  filesRetrieved: number;
  filesWritten: string[];
  errors?: string[];
}

export interface RetrieveContextUseCase {
  retrieveContext(params: RetrieveContextParams): Promise<RetrieveContextResult>;
}
