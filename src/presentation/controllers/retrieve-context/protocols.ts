import { RetrieveContextUseCase } from "../../../domain/usecases/retrieve-context.js";
import {
  Controller,
  Request,
  Response,
  Validator,
} from "../../protocols/index.js";

export interface RetrieveContextRequest {
  /**
   * The name of the project to retrieve context bank files from.
   */
  projectName: string;

  /**
   * Optional local path where files should be saved. Defaults to "./context-bank".
   */
  localPath?: string;
}

export type RetrieveContextResponse = string;

export {
  Controller,
  Request,
  Response,
  RetrieveContextUseCase,
  Validator,
};
