import { ListProjectFiles } from "../../../data/usecases/list-project-files/list-project-files.js";
import { RetrieveContext } from "../../../data/usecases/retrieve-context/retrieve-context.js";
import { FsFileRepository } from "../../../infra/filesystem/index.js";
import { FsProjectRepository } from "../../../infra/filesystem/repositories/fs-project-repository.js";
import { env } from "../../config/env.js";
import { makeReadFile } from "./read-file-factory.js";

export const makeRetrieveContext = () => {
  const projectRepository = new FsProjectRepository(env.rootPath);
  const fileRepository = new FsFileRepository(env.rootPath);
  const readFileUseCase = makeReadFile();
  const listProjectFilesUseCase = new ListProjectFiles(
    fileRepository,
    projectRepository
  );

  return new RetrieveContext(
    listProjectFilesUseCase,
    readFileUseCase,
    fileRepository
  );
};
