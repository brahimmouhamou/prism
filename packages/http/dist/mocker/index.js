"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvalidContentTypeResponse = exports.createUnprocessableEntityResponse = exports.createUnauthorisedResponse = exports.createInvalidInputResponse = void 0;
const types_1 = require("@stoplight/types");
const caseless = require("caseless");
const E = require("fp-ts/Either");
const Record = require("fp-ts/Record");
const function_1 = require("fp-ts/function");
const A = require("fp-ts/Array");
const Apply_1 = require("fp-ts/Apply");
const R = require("fp-ts/Reader");
const O = require("fp-ts/Option");
const RE = require("fp-ts/ReaderEither");
const lodash_1 = require("lodash");
const type_is_1 = require("type-is");
const types_2 = require("../types");
const withLogger_1 = require("../withLogger");
const errors_1 = require("./errors");
const JSONSchema_1 = require("./generator/JSONSchema");
const NegotiatorHelpers_1 = require("./negotiator/NegotiatorHelpers");
const callbacks_1 = require("./callback/callbacks");
const body_1 = require("../validator/validators/body");
const eitherRecordSequence = Record.sequence(E.Applicative);
const eitherSequence = Apply_1.sequenceT(E.Apply);
const mock = ({ resource, input, config, }) => {
    const payloadGenerator = config.dynamic
        ? lodash_1.partial(JSONSchema_1.generate, resource['__bundled__'])
        : lodash_1.partial(JSONSchema_1.generateStatic, resource);
    return function_1.pipe(withLogger_1.default(logger => {
        const acceptMediaType = input.data.headers && caseless(input.data.headers).get('accept');
        if (!config.mediaTypes && acceptMediaType) {
            logger.info(`Request contains an accept header: ${acceptMediaType}`);
            config.mediaTypes = acceptMediaType.split(',');
        }
        return config;
    }), R.chain(mockConfig => negotiateResponse(mockConfig, input, resource)), R.chain(result => negotiateDeprecation(result, resource)), R.chain(result => assembleResponse(result, payloadGenerator)), R.chain(response => logger => function_1.pipe(response, E.map(response => runCallbacks({ resource, request: input.data, response })(logger)), E.chain(() => response))));
};
function runCallbacks({ resource, request, response, }) {
    return withLogger_1.default(logger => function_1.pipe(O.fromNullable(resource.callbacks), O.map(callbacks => function_1.pipe(callbacks, A.map(callback => callbacks_1.runCallback({ callback, request: parseBodyIfUrlEncoded(request, resource), response })(logger)())))));
}
function parseBodyIfUrlEncoded(request, resource) {
    const mediaType = caseless(request.headers || {}).get('content-type');
    if (!mediaType)
        return request;
    if (!type_is_1.is(mediaType, ['application/x-www-form-urlencoded']))
        return request;
    const specs = function_1.pipe(O.fromNullable(resource.request), O.chainNullableK(request => request.body), O.chainNullableK(body => body.contents), O.getOrElse(() => []));
    const encodedUriParams = body_1.splitUriParams(request.body);
    if (specs.length < 1) {
        return Object.assign(request, { body: encodedUriParams });
    }
    const content = function_1.pipe(O.fromNullable(mediaType), O.chain(mediaType => body_1.findContentByMediaTypeOrFirst(specs, mediaType)), O.map(({ content }) => content), O.getOrElse(() => specs[0] || {}));
    const encodings = lodash_1.get(content, 'encodings', []);
    if (!content.schema)
        return Object.assign(request, { body: encodedUriParams });
    return Object.assign(request, {
        body: body_1.deserializeFormBody(content.schema, encodings, body_1.decodeUriEntities(encodedUriParams)),
    });
}
function createInvalidInputResponse(failedValidations, responses, mockConfig) {
    const expectedCodes = getExpectedCodesForViolations(failedValidations);
    const isExampleKeyFromExpectedCodes = !!mockConfig.code && expectedCodes.includes(mockConfig.code);
    return function_1.pipe(withLogger_1.default(logger => logger.warn({ name: 'VALIDATOR' }, 'Request did not pass the validation rules')), R.chain(() => function_1.pipe(NegotiatorHelpers_1.default.negotiateOptionsForInvalidRequest(responses, expectedCodes, isExampleKeyFromExpectedCodes ? mockConfig.exampleKey : undefined), RE.mapLeft(error => {
        if (error instanceof types_2.ProblemJsonError && error.status === 404) {
            return error;
        }
        return createResponseForViolations(failedValidations);
    }))));
}
exports.createInvalidInputResponse = createInvalidInputResponse;
function getExpectedCodesForViolations(failedValidations) {
    const hasSecurityViolations = findValidationByCode(failedValidations, 401);
    if (hasSecurityViolations) {
        return [401];
    }
    const hasInvalidContentTypeViolations = findValidationByCode(failedValidations, 415);
    if (hasInvalidContentTypeViolations) {
        return [415, 422, 400];
    }
    return [422, 400];
}
function createResponseForViolations(failedValidations) {
    const securityViolation = findValidationByCode(failedValidations, 401);
    if (securityViolation) {
        return exports.createUnauthorisedResponse(securityViolation.tags);
    }
    const invalidContentViolation = findValidationByCode(failedValidations, 415);
    if (invalidContentViolation) {
        return exports.createInvalidContentTypeResponse(invalidContentViolation);
    }
    return exports.createUnprocessableEntityResponse(failedValidations);
}
function findValidationByCode(validations, code) {
    return validations.find(validation => validation.code === code);
}
const createUnauthorisedResponse = (tags) => types_2.ProblemJsonError.fromTemplate(errors_1.UNAUTHORIZED, 'Your request does not fullfil the security requirements and no HTTP unauthorized response was found in the spec, so Prism is generating this error for you.', tags && tags.length ? { headers: { 'WWW-Authenticate': tags.join(',') } } : undefined);
exports.createUnauthorisedResponse = createUnauthorisedResponse;
const createUnprocessableEntityResponse = (validations) => types_2.ProblemJsonError.fromTemplate(errors_1.UNPROCESSABLE_ENTITY, 'Your request is not valid and no HTTP validation response was found in the spec, so Prism is generating this error for you.', {
    validation: validations.map(detail => ({
        location: detail.path,
        severity: types_1.DiagnosticSeverity[detail.severity],
        code: detail.code,
        message: detail.message,
    })),
});
exports.createUnprocessableEntityResponse = createUnprocessableEntityResponse;
const createInvalidContentTypeResponse = (validation) => types_2.ProblemJsonError.fromTemplate(errors_1.INVALID_CONTENT_TYPE, validation.message);
exports.createInvalidContentTypeResponse = createInvalidContentTypeResponse;
function negotiateResponse(mockConfig, input, resource) {
    const { [types_1.DiagnosticSeverity.Error]: errors, [types_1.DiagnosticSeverity.Warning]: warnings } = lodash_1.groupBy(input.validations, validation => validation.severity);
    if (errors && A.isNonEmpty(input.validations)) {
        return createInvalidInputResponse(input.validations, resource.responses, mockConfig);
    }
    else {
        return function_1.pipe(withLogger_1.default(logger => {
            warnings && warnings.forEach(warn => logger.warn({ name: 'VALIDATOR' }, warn.message));
            return logger.success({ name: 'VALIDATOR' }, 'The request passed the validation rules. Looking for the best response');
        }), R.chain(() => NegotiatorHelpers_1.default.negotiateOptionsForValidRequest(resource, mockConfig)));
    }
}
function negotiateDeprecation(result, httpOperation) {
    if (httpOperation.deprecated) {
        return function_1.pipe(withLogger_1.default(logger => {
            logger.info('Adding "Deprecation" header since operation is deprecated');
            return result;
        }), RE.map(result => ({
            ...result,
            deprecated: true,
        })));
    }
    return RE.fromEither(result);
}
const assembleResponse = (result, payloadGenerator) => logger => function_1.pipe(E.Do, E.bind('negotiationResult', () => result), E.bind('mockedData', ({ negotiationResult }) => eitherSequence(computeBody(negotiationResult, payloadGenerator), computeMockedHeaders(negotiationResult.headers || [], payloadGenerator))), E.map(({ mockedData: [mockedBody, mockedHeaders], negotiationResult }) => {
    const response = {
        statusCode: parseInt(negotiationResult.code),
        headers: {
            ...mockedHeaders,
            ...(negotiationResult.mediaType && {
                'Content-type': negotiationResult.mediaType,
            }),
            ...(negotiationResult.deprecated && {
                deprecation: 'true',
            }),
        },
        body: mockedBody,
    };
    logger.success(`Responding with the requested status code ${response.statusCode}`);
    return response;
}));
function isINodeExample(nodeExample) {
    return !!nodeExample && 'value' in nodeExample;
}
function computeMockedHeaders(headers, payloadGenerator) {
    return eitherRecordSequence(lodash_1.mapValues(lodash_1.keyBy(headers, h => h.name), header => {
        if (header.schema) {
            if (header.examples && header.examples.length > 0) {
                const example = header.examples[0];
                if (isINodeExample(example)) {
                    return E.right(example.value);
                }
            }
            else {
                return function_1.pipe(payloadGenerator(header.schema), E.map(example => {
                    if (lodash_1.isNumber(example) || lodash_1.isString(example))
                        return example;
                    return null;
                }));
            }
        }
        return E.right(null);
    }));
}
function computeBody(negotiationResult, payloadGenerator) {
    if (isINodeExample(negotiationResult.bodyExample) && negotiationResult.bodyExample.value !== undefined) {
        return E.right(negotiationResult.bodyExample.value);
    }
    if (negotiationResult.schema) {
        return payloadGenerator(negotiationResult.schema);
    }
    return E.right(undefined);
}
exports.default = mock;
