import fs from "fs-extra";
import path from "path";
import {
  FileRepository,
  ListProjectFilesUseCase,
  ReadFileUseCase,
  RetrieveContextParams,
  RetrieveContextResult,
  RetrieveContextUseCase,
} from "./retrieve-context-protocols.js";

export class RetrieveContext implements RetrieveContextUseCase {
  constructor(
    private readonly listProjectFilesUseCase: ListProjectFilesUseCase,
    private readonly readFileUseCase: ReadFileUseCase,
    private readonly fileRepository: FileRepository
  ) {}

  async retrieveContext(
    params: RetrieveContextParams
  ): Promise<RetrieveContextResult> {
    const { projectName, localPath = "./context" } = params;

    // Resolve the local path to absolute
    const absoluteLocalPath = path.resolve(localPath);

    // Ensure the local directory exists
    await fs.ensureDir(absoluteLocalPath);

    // List all files in the project from the server
    const fileNames = await this.listProjectFilesUseCase.listProjectFiles({
      projectName,
    });

    if (fileNames.length === 0) {
      return {
        filesRetrieved: 0,
        filesWritten: [],
      };
    }

    const filesWritten: string[] = [];
    const errors: string[] = [];

    // Read each file from the server and write to local
    for (const fileName of fileNames) {
      try {
        const content = await this.readFileUseCase.readFile({
          projectName,
          fileName,
        });

        if (content === null) {
          errors.push(`Failed to read file ${fileName} from server`);
          continue;
        }

        // Write to local file system (override if exists)
        const localFilePath = path.join(absoluteLocalPath, fileName);
        await fs.writeFile(localFilePath, content, "utf-8");
        filesWritten.push(fileName);
      } catch (error) {
        errors.push(
          `Error processing file ${fileName}: ${(error as Error).message}`
        );
      }
    }

    return {
      filesRetrieved: fileNames.length,
      filesWritten,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
