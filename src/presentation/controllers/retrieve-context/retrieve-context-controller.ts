import { badRequest, ok, serverError } from "../../helpers/index.js";
import {
  Controller,
  Request,
  Response,
  RetrieveContextRequest,
  RetrieveContextResponse,
  RetrieveContextUseCase,
  Validator,
} from "./protocols.js";

export class RetrieveContextController
  implements Controller<RetrieveContextRequest, RetrieveContextResponse>
{
  constructor(
    private readonly retrieveContextUseCase: RetrieveContextUseCase,
    private readonly validator: Validator
  ) {}

  async handle(
    request: Request<RetrieveContextRequest>
  ): Promise<Response<RetrieveContextResponse>> {
    try {
      const validationError = this.validator.validate(request.body);
      if (validationError) {
        return badRequest(validationError);
      }

      const { projectName, localPath } = request.body!;

      const result = await this.retrieveContextUseCase.retrieveContext({
        projectName,
        localPath,
      });

      const message = `Retrieved ${result.filesRetrieved} file(s) from project ${projectName}. ${result.filesWritten.length} file(s) written to local directory${result.errors && result.errors.length > 0 ? `. ${result.errors.length} error(s) occurred` : ""}. Files: ${result.filesWritten.join(", ")}`;

      return ok(message);
    } catch (error) {
      return serverError(error as Error);
    }
  }
}
