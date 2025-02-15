import { IHttpOperation, IHttpOperationResponse, IMediaTypeContent } from '@stoplight/types';
import * as E from 'fp-ts/Either';
import { NonEmptyArray } from 'fp-ts/NonEmptyArray';
import * as O from 'fp-ts/Option';
import * as R from 'fp-ts/Reader';
import * as RE from 'fp-ts/ReaderEither';
import { Logger } from 'pino';
import { IHttpNegotiationResult, NegotiatePartialOptions, NegotiationOptions } from './types';
declare type BodyNegotiationResult = Omit<IHttpNegotiationResult, 'headers'>;
declare const helpers: {
  negotiateByPartialOptionsAndHttpContent(
    { code, exampleKey, dynamic }: NegotiatePartialOptions,
    httpContent: IMediaTypeContent
  ): E.Either<Error, BodyNegotiationResult>;
  negotiateDefaultMediaType(
    partialOptions: NegotiatePartialOptions,
    response: IHttpOperationResponse
  ): E.Either<Error, IHttpNegotiationResult>;
  negotiateOptionsBySpecificResponse(
    requestMethod: string,
    desiredOptions: NegotiationOptions,
    response: IHttpOperationResponse
  ): RE.ReaderEither<Logger, Error, IHttpNegotiationResult>;
  negotiateOptionsForUnspecifiedCode(
    httpOperation: IHttpOperation,
    desiredOptions: NegotiationOptions
  ): RE.ReaderEither<Logger, Error, IHttpNegotiationResult>;
  negotiateOptionsBySpecificCode(
    httpOperation: IHttpOperation,
    desiredOptions: NegotiationOptions,
    code: number
  ): RE.ReaderEither<Logger, Error, IHttpNegotiationResult>;
  negotiateOptionsForValidRequest(
    httpOperation: IHttpOperation,
    desiredOptions: NegotiationOptions
  ): RE.ReaderEither<Logger, Error, IHttpNegotiationResult>;
  findResponse(
    httpResponses: IHttpOperationResponse[],
    statusCodes: NonEmptyArray<number>
  ): R.Reader<Logger, O.Option<IHttpOperationResponse>>;
  negotiateOptionsForInvalidRequest(
    httpResponses: IHttpOperationResponse[],
    statusCodes: NonEmptyArray<number>,
    exampleKey?: string | undefined
  ): RE.ReaderEither<Logger, Error, IHttpNegotiationResult>;
};
export default helpers;
