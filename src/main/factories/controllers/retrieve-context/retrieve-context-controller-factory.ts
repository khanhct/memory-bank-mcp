import { RetrieveContextController } from "../../../../presentation/controllers/retrieve-context/retrieve-context-controller.js";
import { makeRetrieveContext } from "../../use-cases/retrieve-context-factory.js";
import { makeRetrieveContextValidation } from "./retrieve-context-validation-factory.js";

export const makeRetrieveContextController = () => {
  const validator = makeRetrieveContextValidation();
  const retrieveContextUseCase = makeRetrieveContext();

  return new RetrieveContextController(retrieveContextUseCase, validator);
};
