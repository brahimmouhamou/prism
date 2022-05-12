import { IPrismComponents, IPrismDiagnostic } from '@stoplight/prism-core';
import { IHttpOperation, IHttpOperationResponse } from '@stoplight/types';
import * as E from 'fp-ts/Either';
import * as R from 'fp-ts/Reader';
import { Logger } from 'pino';
import { IHttpMockConfig, IHttpOperationConfig, IHttpRequest, IHttpResponse, ProblemJsonError } from '../types';
import { IHttpNegotiationResult } from './negotiator/types';
import { NonEmptyArray } from 'fp-ts/NonEmptyArray';
declare const mock: IPrismComponents<IHttpOperation, IHttpRequest, IHttpResponse, IHttpMockConfig>['mock'];
export declare function createInvalidInputResponse(
  failedValidations: NonEmptyArray<IPrismDiagnostic>,
  responses: IHttpOperationResponse[],
  mockConfig: IHttpOperationConfig
): R.Reader<Logger, E.Either<ProblemJsonError, IHttpNegotiationResult>>;
export declare const createUnauthorisedResponse: (tags?: string[] | undefined) => ProblemJsonError;
export declare const createUnprocessableEntityResponse: (
  validations: NonEmptyArray<IPrismDiagnostic>
) => ProblemJsonError;
export declare const createInvalidContentTypeResponse: (validation: IPrismDiagnostic) => ProblemJsonError;
export default mock;
