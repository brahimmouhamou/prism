"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prism_core_1 = require("@stoplight/prism-core");
const faker = require("faker/locale/en");
const E = require("fp-ts/Either");
const ReaderEither_1 = require("fp-ts/ReaderEither");
const utils_1 = require("@stoplight/prism-core/src/__tests__/utils");
const NegotiatorHelpers_1 = require("../NegotiatorHelpers");
const logger = (0, prism_core_1.createLogger)('TEST', { enabled: false });
const assertPayloadlessResponse = (actualResponse) => {
    (0, utils_1.assertRight)(actualResponse, response => {
        expect(response).not.toHaveProperty('bodyExample');
        expect(response).not.toHaveProperty('mediaType');
        expect(response).not.toHaveProperty('schema');
        expect(response).toHaveProperty('code');
        expect(response).toHaveProperty('headers');
    });
};
function anHttpOperation(givenHttpOperation) {
    const httpOperation = givenHttpOperation || {
        method: faker.random.word(),
        path: faker.internet.url(),
        responses: [{ id: faker.random.word(), code: '300' }],
        id: faker.random.word(),
        request: {},
    };
    return {
        instance() {
            return httpOperation;
        },
        withResponses(responses) {
            httpOperation.responses = responses;
            return this;
        },
    };
}
describe('NegotiatorHelpers', () => {
    let httpOperation;
    beforeEach(() => {
        httpOperation = anHttpOperation().instance();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('negotiateOptionsForInvalidRequest()', () => {
        describe('and 422 response exists', () => {
            const actualCode = '422';
            const actualMediaType = faker.system.mimeType();
            describe('and has static examples defined', () => {
                const response = {
                    id: 'response-id',
                    code: actualCode,
                    headers: [],
                    contents: [
                        {
                            id: 'content-id',
                            mediaType: actualMediaType,
                            examples: [
                                { key: 'key_1', value: 'value_1', externalValue: 'ext_value_1' },
                                { key: 'key_2', value: 'value_2', externalValue: 'ext_value_2' },
                                { key: 'key_3', value: 'value_3', externalValue: 'ext_value_3' },
                            ],
                            encodings: [],
                        },
                    ],
                };
                const expectedResult = {
                    code: actualCode,
                    mediaType: actualMediaType,
                    bodyExample: undefined,
                    headers: [],
                };
                test('and exampleKey is defined should return an example matching example key', () => {
                    httpOperation = anHttpOperation(httpOperation).withResponses([response]).instance();
                    const actualConfig = NegotiatorHelpers_1.default.negotiateOptionsForInvalidRequest(httpOperation.responses, [422, 400], 'key_2')(logger);
                    (0, utils_1.assertRight)(actualConfig, operationConfig => expect(operationConfig).toEqual({
                        ...expectedResult,
                        bodyExample: { key: 'key_2', value: 'value_2', externalValue: 'ext_value_2' },
                    }));
                });
                test('and exampleKey is defined but does not exist should return 404 error', () => {
                    httpOperation = anHttpOperation(httpOperation).withResponses([response]).instance();
                    const actualConfig = NegotiatorHelpers_1.default.negotiateOptionsForInvalidRequest(httpOperation.responses, [422, 400], 'undefined key')(logger);
                    (0, utils_1.assertLeft)(actualConfig, operationConfig => expect(operationConfig).toMatchObject({
                        name: 'https://stoplight.io/prism/errors#NOT_FOUND',
                        status: 404,
                        detail: `Response for contentType: ${actualMediaType} and exampleKey: undefined key does not exist.`,
                    }));
                });
                test('and exampleKey is not defined should return the first static example', () => {
                    httpOperation = anHttpOperation(httpOperation).withResponses([response]).instance();
                    const actualConfig = NegotiatorHelpers_1.default.negotiateOptionsForInvalidRequest(httpOperation.responses, [422, 400])(logger);
                    (0, utils_1.assertRight)(actualConfig, operationConfig => expect(operationConfig).toEqual({
                        ...expectedResult,
                        bodyExample: { key: 'key_1', value: 'value_1', externalValue: 'ext_value_1' },
                    }));
                });
            });
            describe('and has no static contents', () => {
                it('returns an empty payload response for an invalid request', () => {
                    httpOperation = anHttpOperation(httpOperation)
                        .withResponses([
                        {
                            id: 'response-id',
                            code: actualCode,
                            headers: [],
                            contents: [],
                        },
                    ])
                        .instance();
                    const actualResponse = NegotiatorHelpers_1.default.negotiateOptionsForInvalidRequest(httpOperation.responses, [422, 400])(logger);
                    assertPayloadlessResponse(actualResponse);
                });
                test('and has schemable contents should return first such contents', () => {
                    httpOperation = anHttpOperation(httpOperation)
                        .withResponses([
                        {
                            id: faker.random.word(),
                            code: actualCode,
                            headers: [],
                            contents: [
                                {
                                    id: faker.random.word(),
                                    mediaType: actualMediaType + faker.random.word[0],
                                },
                                {
                                    id: faker.random.word(),
                                    schema: { type: 'string' },
                                    mediaType: actualMediaType,
                                },
                                {
                                    id: faker.random.word(),
                                    schema: { type: 'number' },
                                    mediaType: actualMediaType + faker.random.word[0],
                                },
                            ],
                        },
                    ])
                        .instance();
                    const actualConfig = NegotiatorHelpers_1.default.negotiateOptionsForInvalidRequest(httpOperation.responses, [422, 400])(logger);
                    const expectedConfig = {
                        code: actualCode,
                        mediaType: actualMediaType,
                        schema: { type: 'string' },
                        headers: [],
                    };
                    (0, utils_1.assertRight)(actualConfig, operationConfig => expect(operationConfig).toEqual(expectedConfig));
                });
                test('and no schemable contents should return error', () => {
                    httpOperation = anHttpOperation(httpOperation)
                        .withResponses([
                        {
                            id: faker.random.word(),
                            code: actualCode,
                            headers: [],
                            contents: [
                                {
                                    id: faker.random.word(),
                                    mediaType: actualMediaType,
                                    examples: [],
                                    encodings: [],
                                },
                                {
                                    id: faker.random.word(),
                                    mediaType: actualMediaType,
                                    examples: [],
                                    encodings: [],
                                },
                            ],
                        },
                    ])
                        .instance();
                    const negotiationResult = NegotiatorHelpers_1.default.negotiateOptionsForInvalidRequest(httpOperation.responses, [422, 400])(logger);
                    (0, utils_1.assertRight)(negotiationResult, e => expect(e).toStrictEqual({ code: '422', headers: [] }));
                });
            });
        });
        describe('and no 422 response exists', () => {
            test('but a 400 response exists', () => {
                httpOperation = anHttpOperation(httpOperation)
                    .withResponses([
                    {
                        id: faker.random.word(),
                        code: '400',
                        headers: [],
                        contents: [
                            {
                                id: faker.random.word(),
                                mediaType: faker.system.mimeType(),
                                examples: [
                                    { key: faker.random.word(), value: '', externalValue: '' },
                                    { key: faker.random.word(), value: '', externalValue: '' },
                                ],
                                encodings: [],
                            },
                        ],
                    },
                ])
                    .instance();
                const actualConfig = NegotiatorHelpers_1.default.negotiateOptionsForInvalidRequest(httpOperation.responses, [422, 400])(logger);
                (0, utils_1.assertRight)(actualConfig, c => expect(c).toHaveProperty('code', '400'));
            });
            test('but a default response exists', () => {
                httpOperation = anHttpOperation(httpOperation)
                    .withResponses([
                    {
                        id: faker.random.word(),
                        code: 'default',
                        headers: [],
                        contents: [
                            {
                                id: faker.random.word(),
                                mediaType: faker.system.mimeType(),
                                examples: [
                                    { key: faker.random.word(), value: '', externalValue: '' },
                                    { key: faker.random.word(), value: '', externalValue: '' },
                                ],
                                encodings: [],
                            },
                        ],
                    },
                ])
                    .instance();
                const actualConfig = NegotiatorHelpers_1.default.negotiateOptionsForInvalidRequest(httpOperation.responses, [422, 400])(logger);
                (0, utils_1.assertRight)(actualConfig, config => expect(config).toHaveProperty('code', 422));
            });
            test('should return an error', () => {
                (0, utils_1.assertLeft)(NegotiatorHelpers_1.default.negotiateOptionsForInvalidRequest(httpOperation.responses, [422, 400])(logger), error => expect(error).toHaveProperty('message', 'No 422, 400, or default responses defined'));
            });
        });
    });
    describe('negotiateOptionsForValidRequest()', () => {
        it('given status code enforced should negotiate a specific code', () => {
            const options = {
                code: 200,
                dynamic: false,
            };
            const expectedResult = {
                code: options.code.toString(),
                mediaType: 'application/json',
                headers: [],
            };
            const negotiateOptionsForUnspecifiedCodeSpy = jest.spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsForUnspecifiedCode');
            const negotiateOptionsBySpecificCodeSpy = jest
                .spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsBySpecificCode')
                .mockReturnValue((0, ReaderEither_1.right)(expectedResult));
            const actualResult = NegotiatorHelpers_1.default.negotiateOptionsForValidRequest(httpOperation, options)(logger);
            expect(negotiateOptionsForUnspecifiedCodeSpy).not.toHaveBeenCalled();
            expect(negotiateOptionsBySpecificCodeSpy).toHaveBeenCalledTimes(1);
            (0, utils_1.assertRight)(actualResult, result => expect(result).toEqual(expectedResult));
        });
        it('given status code not enforced should negotiate a default code', () => {
            const options = { dynamic: false };
            const expectedResult = {
                code: '200',
                mediaType: 'application/json',
                headers: [],
            };
            const negotiateOptionsForUnspecifiedCodeSpy = jest
                .spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsForUnspecifiedCode')
                .mockReturnValue((0, ReaderEither_1.right)(expectedResult));
            const negotiateOptionsBySpecificCodeSpy = jest.spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsBySpecificCode');
            const actualResult = NegotiatorHelpers_1.default.negotiateOptionsForValidRequest(httpOperation, options)(logger);
            expect(negotiateOptionsBySpecificCodeSpy).not.toHaveBeenCalled();
            expect(negotiateOptionsForUnspecifiedCodeSpy).toHaveBeenCalledTimes(1);
            (0, utils_1.assertRight)(actualResult, result => expect(result).toEqual(expectedResult));
        });
    });
    describe('negotiateOptionsBySpecificCode()', () => {
        let negotiateOptionsBySpecificResponseMock;
        let negotiateOptionsForUnspecifiedCodeMock;
        beforeEach(() => {
            negotiateOptionsBySpecificResponseMock = jest.spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsBySpecificResponse');
            negotiateOptionsForUnspecifiedCodeMock = jest.spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsForUnspecifiedCode');
        });
        afterEach(() => {
            negotiateOptionsBySpecificResponseMock.mockClear();
            negotiateOptionsForUnspecifiedCodeMock.mockClear();
        });
        it('given response defined should try to negotiate by that response', () => {
            const code = faker.datatype.number();
            const fakeResponse = {
                id: faker.random.word(),
                code: code.toString(),
                contents: [],
                headers: [],
            };
            const desiredOptions = { dynamic: false };
            const fakeOperationConfig = {
                code: code.toString(),
                headers: [],
                mediaType: '',
            };
            negotiateOptionsBySpecificResponseMock.mockReturnValue((0, ReaderEither_1.right)(fakeOperationConfig));
            httpOperation = anHttpOperation(httpOperation).withResponses([fakeResponse]).instance();
            const actualOperationConfig = NegotiatorHelpers_1.default.negotiateOptionsBySpecificCode(httpOperation, desiredOptions, code)(logger);
            expect(negotiateOptionsBySpecificResponseMock).toHaveBeenCalledTimes(1);
            expect(negotiateOptionsBySpecificResponseMock).toHaveBeenCalledWith(httpOperation.method, desiredOptions, fakeResponse);
            expect(negotiateOptionsForUnspecifiedCodeMock).not.toHaveBeenCalled();
            (0, utils_1.assertRight)(actualOperationConfig, operationConfig => {
                expect(operationConfig).toEqual(fakeOperationConfig);
            });
        });
        it('given response defined should fallback to default code on error', () => {
            const code = faker.datatype.number();
            const fakeResponse = {
                id: faker.random.word(),
                code: code.toString(),
            };
            const desiredOptions = { dynamic: false };
            const fakeOperationConfig = {
                code: code.toString(),
                mediaType: '',
                headers: [],
            };
            negotiateOptionsBySpecificResponseMock.mockReturnValue((0, ReaderEither_1.left)(new Error('Hey')));
            negotiateOptionsForUnspecifiedCodeMock.mockReturnValue((0, ReaderEither_1.right)(fakeOperationConfig));
            httpOperation = anHttpOperation(httpOperation).withResponses([fakeResponse]).instance();
            const actualOperationConfig = NegotiatorHelpers_1.default.negotiateOptionsBySpecificCode(httpOperation, desiredOptions, code)(logger);
            expect(negotiateOptionsBySpecificResponseMock).toHaveBeenCalledTimes(1);
            expect(negotiateOptionsBySpecificResponseMock).toHaveBeenCalledWith(httpOperation.method, desiredOptions, fakeResponse);
            expect(negotiateOptionsForUnspecifiedCodeMock).toHaveBeenCalledTimes(1);
            expect(negotiateOptionsForUnspecifiedCodeMock).toHaveBeenCalledWith(httpOperation, desiredOptions);
            (0, utils_1.assertRight)(actualOperationConfig, operationConfig => {
                expect(operationConfig).toEqual(fakeOperationConfig);
            });
        });
        it('given response not defined should fallback to default code', () => {
            const code = faker.datatype.number();
            const desiredOptions = { dynamic: false };
            httpOperation = anHttpOperation(httpOperation).instance();
            (0, utils_1.assertLeft)(NegotiatorHelpers_1.default.negotiateOptionsBySpecificCode(httpOperation, desiredOptions, code)(logger), error => expect(error).toHaveProperty('message', 'The server cannot find the requested content'));
        });
    });
    describe('negotiateOptionsForUnspecifiedCode()', () => {
        it('given only a generic 2XX response should negotiate that one', () => {
            const desiredOptions = { dynamic: false };
            const response = {
                id: faker.random.word(),
                code: '2xx',
                contents: [],
                headers: [],
            };
            const fakeOperationConfig = {
                code: response.code,
                mediaType: 'application/json',
                headers: [],
            };
            jest.spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsBySpecificResponse').mockReturnValue((0, ReaderEither_1.right)(fakeOperationConfig));
            httpOperation = anHttpOperation(httpOperation).withResponses([response]).instance();
            const actualOperationConfig = NegotiatorHelpers_1.default.negotiateOptionsForUnspecifiedCode(httpOperation, desiredOptions)(logger);
            expect(NegotiatorHelpers_1.default.negotiateOptionsBySpecificResponse).toHaveBeenCalledTimes(1);
            (0, utils_1.assertRight)(actualOperationConfig, operationConfig => {
                expect(operationConfig).toEqual(fakeOperationConfig);
            });
        });
        it('given two 2xx response should negotiate the lowest', () => {
            const desiredOptions = { dynamic: false };
            const response = {
                id: faker.random.word(),
                code: '200',
                contents: [],
                headers: [],
            };
            const fakeOperationConfig = {
                code: response.code,
                mediaType: 'application/json',
                headers: [],
            };
            jest.spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsBySpecificResponse').mockReturnValue((0, ReaderEither_1.right)(fakeOperationConfig));
            httpOperation = anHttpOperation(httpOperation)
                .withResponses([
                response,
                {
                    id: faker.random.word(),
                    code: '201',
                    contents: [],
                    headers: [],
                },
                {
                    id: faker.random.word(),
                    code: '2xx',
                    contents: [],
                    headers: [],
                },
            ])
                .instance();
            const actualOperationConfig = NegotiatorHelpers_1.default.negotiateOptionsForUnspecifiedCode(httpOperation, desiredOptions)(logger);
            expect(NegotiatorHelpers_1.default.negotiateOptionsBySpecificResponse).toHaveBeenCalledTimes(1);
            (0, utils_1.assertRight)(actualOperationConfig, operationConfig => {
                expect(operationConfig).toEqual(fakeOperationConfig);
            });
        });
        it('given no 2xx response should return the first response', () => {
            const desiredOptions = { dynamic: false };
            jest.spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsBySpecificResponse');
            const negotiationResult = NegotiatorHelpers_1.default.negotiateOptionsForUnspecifiedCode(httpOperation, desiredOptions)(logger);
            (0, utils_1.assertRight)(negotiationResult, res => expect(res.code).toBe('300'));
        });
    });
    describe('negotiateOptionsBySpecificResponse()', () => {
        describe('given forced mediaType', () => {
            it('and httpContent exists should negotiate that contents', () => {
                const desiredOptions = {
                    mediaTypes: [faker.system.mimeType()],
                    dynamic: faker.datatype.boolean(),
                    exampleKey: faker.random.word(),
                };
                const contents = {
                    id: faker.random.word(),
                    mediaType: desiredOptions.mediaTypes[0],
                    examples: [],
                    encodings: [],
                };
                const httpResponseSchema = {
                    id: faker.random.word(),
                    code: '200',
                    contents: [contents],
                    headers: [],
                };
                const fakeOperationConfig = {
                    code: '200',
                    mediaType: desiredOptions.mediaTypes[0],
                    headers: [],
                };
                jest.spyOn(NegotiatorHelpers_1.default, 'negotiateByPartialOptionsAndHttpContent').mockReturnValue(E.right(fakeOperationConfig));
                jest.spyOn(NegotiatorHelpers_1.default, 'negotiateDefaultMediaType');
                const actualOperationConfig = NegotiatorHelpers_1.default.negotiateOptionsBySpecificResponse(httpOperation.method, desiredOptions, httpResponseSchema)(logger);
                expect(NegotiatorHelpers_1.default.negotiateByPartialOptionsAndHttpContent).toHaveBeenCalledTimes(1);
                expect(NegotiatorHelpers_1.default.negotiateByPartialOptionsAndHttpContent).toHaveBeenCalledWith({
                    code: httpResponseSchema.code,
                    dynamic: desiredOptions.dynamic,
                    exampleKey: desiredOptions.exampleKey,
                }, contents);
                expect(NegotiatorHelpers_1.default.negotiateDefaultMediaType).not.toHaveBeenCalled();
                (0, utils_1.assertRight)(actualOperationConfig, operationConfig => {
                    expect(operationConfig).toEqual(fakeOperationConfig);
                });
            });
            describe('the resource has multiple contents', () => {
                it('should negotiatiate the content according to the preference', () => {
                    const desiredOptions = {
                        mediaTypes: ['application/json', 'application/xml'],
                        dynamic: false,
                    };
                    const contents = desiredOptions.mediaTypes.reverse().map(mediaType => ({
                        id: faker.random.word(),
                        mediaType,
                        encodings: [],
                        examples: [],
                    }));
                    const httpResponseSchema = {
                        id: faker.random.word(),
                        code: '200',
                        contents,
                        headers: [],
                    };
                    const actualOperationConfig = NegotiatorHelpers_1.default.negotiateOptionsBySpecificResponse(httpOperation.method, desiredOptions, httpResponseSchema)(logger);
                    (0, utils_1.assertRight)(actualOperationConfig, config => expect(config).toHaveProperty('mediaType', 'application/xml'));
                });
                it('should negotiate the only content that is really available', () => {
                    const desiredOptions = {
                        mediaTypes: ['application/idonotexist', 'application/json'],
                        dynamic: false,
                    };
                    const content = {
                        id: faker.random.word(),
                        mediaType: 'application/json',
                        encodings: [],
                        examples: [],
                    };
                    const httpResponseSchema = {
                        id: faker.random.word(),
                        code: '200',
                        contents: [content],
                        headers: [],
                    };
                    const actualOperationConfig = NegotiatorHelpers_1.default.negotiateOptionsBySpecificResponse(httpOperation.method, desiredOptions, httpResponseSchema)(logger);
                    (0, utils_1.assertRight)(actualOperationConfig, config => expect(config).toHaveProperty('mediaType', 'application/json'));
                });
            });
            describe('204 response', () => {
                it('returns an empty payload response when desired media type does not exist', () => {
                    const httpResponseSchema = {
                        id: faker.random.word(),
                        code: '204',
                        contents: [],
                    };
                    const desiredOptions = {
                        dynamic: false,
                        mediaTypes: ['application/json'],
                    };
                    const actualResponse = NegotiatorHelpers_1.default.negotiateOptionsBySpecificResponse(httpOperation.method, desiredOptions, httpResponseSchema)(logger);
                    assertPayloadlessResponse(actualResponse);
                });
            });
            describe('the response exists, but there is no httpContent', () => {
                const httpResponseSchema = {
                    id: faker.random.word(),
                    code: '200',
                    contents: [],
                };
                it('returns an empty payload response', () => {
                    const desiredOptions = {
                        dynamic: false,
                        mediaTypes: ['*/*'],
                    };
                    const actualResponse = NegotiatorHelpers_1.default.negotiateOptionsBySpecificResponse(httpOperation.method, desiredOptions, httpResponseSchema)(logger);
                    assertPayloadlessResponse(actualResponse);
                });
                it('should throw an error', () => {
                    const desiredOptions = {
                        mediaTypes: [faker.system.mimeType()],
                        dynamic: faker.datatype.boolean(),
                        exampleKey: faker.random.word(),
                    };
                    const actualResponse = NegotiatorHelpers_1.default.negotiateOptionsBySpecificResponse(httpOperation.method, desiredOptions, httpResponseSchema)(logger);
                    expect(E.isLeft(actualResponse)).toBeTruthy();
                });
            });
            describe('the content-type from Accept header cannot be matched', () => {
                it('returns 406', () => {
                    const desiredOptions = {
                        dynamic: false,
                        mediaTypes: ['application/json'],
                    };
                    const httpResponseSchema = {
                        id: faker.random.word(),
                        code: '200',
                        contents: [
                            {
                                id: faker.random.word(),
                                mediaType: 'text/plain',
                            },
                        ],
                    };
                    const actualResponse = NegotiatorHelpers_1.default.negotiateOptionsBySpecificResponse(httpOperation.method, desiredOptions, httpResponseSchema)(logger);
                    (0, utils_1.assertLeft)(actualResponse, e => expect(e.message).toBe('The server cannot produce a representation for your accept header'));
                });
            });
        });
        describe('given no mediaType', () => {
            it('should negotiate default media type', () => {
                const desiredOptions = {
                    dynamic: faker.datatype.boolean(),
                    exampleKey: faker.random.word(),
                };
                const httpResponseSchema = {
                    id: faker.random.word(),
                    code: '200',
                    contents: [],
                    headers: [],
                };
                const fakeOperationConfig = {
                    code: '200',
                    mediaType: 'application/json',
                    headers: [],
                };
                jest.spyOn(NegotiatorHelpers_1.default, 'negotiateByPartialOptionsAndHttpContent');
                jest.spyOn(NegotiatorHelpers_1.default, 'negotiateDefaultMediaType').mockReturnValue(E.right(fakeOperationConfig));
                const actualOperationConfig = NegotiatorHelpers_1.default.negotiateOptionsBySpecificResponse(httpOperation.method, desiredOptions, httpResponseSchema)(logger);
                expect(NegotiatorHelpers_1.default.negotiateByPartialOptionsAndHttpContent).not.toHaveBeenCalled();
                expect(NegotiatorHelpers_1.default.negotiateDefaultMediaType).toHaveBeenCalledTimes(1);
                expect(NegotiatorHelpers_1.default.negotiateDefaultMediaType).toHaveBeenCalledWith({
                    code: httpResponseSchema.code,
                    dynamic: desiredOptions.dynamic,
                    exampleKey: desiredOptions.exampleKey,
                }, httpResponseSchema);
                (0, utils_1.assertRight)(actualOperationConfig, operationConfig => {
                    expect(operationConfig).toEqual(fakeOperationConfig);
                });
            });
        });
    });
    describe('negotiateDefaultMediaType()', () => {
        describe('default content', () => {
            it.each([
                ['*/*', 'application/xml'],
                ['*/*', 'application/json'],
                ['application/json', 'application/xml'],
            ])('should return %s even when %s is available', (defaultMediaType, alternateMediaType) => {
                const code = faker.random.word();
                const partialOptions = {
                    code,
                    dynamic: faker.datatype.boolean(),
                    exampleKey: faker.random.word(),
                };
                const contents = [alternateMediaType, defaultMediaType].map(mediaType => ({
                    id: faker.random.word(),
                    mediaType,
                    examples: [],
                    encodings: [],
                }));
                const response = {
                    id: faker.random.word(),
                    code,
                    contents,
                    headers: [],
                };
                const fakeOperationConfig = {
                    code: '200',
                    mediaType: defaultMediaType,
                    headers: [],
                };
                jest.spyOn(NegotiatorHelpers_1.default, 'negotiateByPartialOptionsAndHttpContent').mockReturnValue(E.right(fakeOperationConfig));
                const actualOperationConfig = NegotiatorHelpers_1.default.negotiateDefaultMediaType(partialOptions, response);
                expect(NegotiatorHelpers_1.default.negotiateByPartialOptionsAndHttpContent).toHaveBeenCalledTimes(1);
                expect(NegotiatorHelpers_1.default.negotiateByPartialOptionsAndHttpContent).toHaveBeenCalledWith({
                    code,
                    dynamic: partialOptions.dynamic,
                    exampleKey: partialOptions.exampleKey,
                }, contents[1]);
                (0, utils_1.assertRight)(actualOperationConfig, operationConfig => {
                    expect(operationConfig).toEqual(fakeOperationConfig);
                });
            });
        });
        describe('when no default response', () => {
            const code = faker.random.word();
            const partialOptions = { code: '200', dynamic: false };
            const response = {
                id: faker.random.word(),
                code,
                contents: [],
                headers: [],
            };
            const expectedResponse = {
                code: '200',
                mediaType: 'text/plain',
                headers: [],
                bodyExample: {
                    id: 'example',
                    value: undefined,
                    key: 'default',
                },
            };
            it('returns text/plain with empty body', () => {
                const negotiationResult = NegotiatorHelpers_1.default.negotiateDefaultMediaType(partialOptions, response);
                (0, utils_1.assertRight)(negotiationResult, result => {
                    expect(result).toEqual(expectedResponse);
                });
            });
        });
    });
    describe('when multiple responses', () => {
        const code = faker.random.word();
        const partialOptions = { code: '200', dynamic: false };
        describe('and json is among them', () => {
            const negotiationResult = NegotiatorHelpers_1.default.negotiateDefaultMediaType(partialOptions, {
                id: faker.random.word(),
                code,
                headers: [],
                contents: [
                    {
                        id: faker.random.word(),
                        mediaType: 'text/plain',
                        examples: [{ id: faker.random.word(), key: 'hey', value: {} }],
                    },
                    {
                        id: faker.random.word(),
                        mediaType: 'application/json',
                        examples: [{ id: faker.random.word(), key: 'hey', value: {} }],
                    },
                ],
            });
            it('should give json precedence', () => {
                (0, utils_1.assertRight)(negotiationResult, result => {
                    expect(result.mediaType).toEqual('application/json');
                });
            });
        });
        describe('and json is not them', () => {
            const negotiationResult = NegotiatorHelpers_1.default.negotiateDefaultMediaType(partialOptions, {
                id: faker.random.word(),
                code,
                headers: [],
                contents: [
                    {
                        id: faker.random.word(),
                        mediaType: 'application/xml',
                        examples: [{ id: faker.random.word(), key: 'hey', value: {} }],
                    },
                    {
                        id: faker.random.word(),
                        mediaType: 'text/plain',
                        examples: [{ id: faker.random.word(), key: 'hey', value: {} }],
                    },
                ],
            });
            it('should take the first content type', () => {
                (0, utils_1.assertRight)(negotiationResult, result => {
                    expect(result.mediaType).toBe('application/xml');
                });
            });
        });
    });
});
describe('negotiateByPartialOptionsAndHttpContent()', () => {
    describe('given exampleKey forced', () => {
        it('and example exists should return that example', () => {
            const exampleKey = faker.random.word();
            const partialOptions = {
                code: '200',
                exampleKey,
                dynamic: faker.datatype.boolean(),
            };
            const bodyExample = {
                id: faker.random.word(),
                key: exampleKey,
                value: '',
            };
            const httpContent = {
                id: faker.random.word(),
                mediaType: faker.system.mimeType(),
                examples: [bodyExample],
                encodings: [],
            };
            const actualOperationConfig = NegotiatorHelpers_1.default.negotiateByPartialOptionsAndHttpContent(partialOptions, httpContent);
            const expectedConfig = {
                code: partialOptions.code,
                mediaType: httpContent.mediaType,
                bodyExample,
            };
            (0, utils_1.assertRight)(actualOperationConfig, operationConfig => {
                expect(operationConfig).toEqual(expectedConfig);
            });
        });
        it('and example not exist should throw an error', () => {
            const exampleKey = faker.random.word();
            const partialOptions = {
                code: '200',
                exampleKey,
                dynamic: faker.datatype.boolean(),
            };
            const httpContent = {
                id: faker.random.word(),
                mediaType: faker.system.mimeType(),
                examples: [],
                encodings: [],
            };
            const negotiationResult = NegotiatorHelpers_1.default.negotiateByPartialOptionsAndHttpContent(partialOptions, httpContent);
            (0, utils_1.assertLeft)(negotiationResult, e => {
                expect(e.message).toBe('The server cannot find the requested content');
            });
        });
    });
    describe('given exampleKey not forced but dynamic forced', () => {
        it('and httpContent has schema return that contents', () => {
            const partialOptions = {
                code: '200',
                dynamic: true,
            };
            const httpContent = {
                id: faker.random.word(),
                mediaType: faker.system.mimeType(),
                examples: [],
                schema: { type: 'string' },
                encodings: [],
            };
            const actualOperationConfig = NegotiatorHelpers_1.default.negotiateByPartialOptionsAndHttpContent(partialOptions, httpContent);
            (0, utils_1.assertRight)(actualOperationConfig, operationConfig => {
                expect(operationConfig).toEqual({
                    code: partialOptions.code,
                    mediaType: httpContent.mediaType,
                    schema: httpContent.schema,
                });
            });
        });
        it('and httpContent has no schema throw error', () => {
            const partialOptions = {
                code: '200',
                dynamic: true,
            };
            const httpContent = {
                id: faker.random.word(),
                mediaType: faker.system.mimeType(),
                examples: [],
                encodings: [],
            };
            const negotiationResult = NegotiatorHelpers_1.default.negotiateByPartialOptionsAndHttpContent(partialOptions, httpContent);
            (0, utils_1.assertLeft)(negotiationResult, e => expect(e.message).toBe(`Tried to force a dynamic response for: ${httpContent.mediaType} but schema is not defined.`));
        });
    });
    describe('given neither exampleKey nor dynamic forced', () => {
        it('and can find other example return that example', () => {
            const partialOptions = {
                code: '200',
                dynamic: false,
            };
            const bodyExample = {
                key: faker.random.word(),
                value: '',
                externalValue: '',
            };
            const httpContent = {
                id: faker.random.word(),
                mediaType: faker.system.mimeType(),
                examples: [
                    bodyExample,
                    {
                        key: faker.random.word(),
                        value: '',
                        externalValue: '',
                    },
                ],
                encodings: [],
            };
            const actualOperationConfig = NegotiatorHelpers_1.default.negotiateByPartialOptionsAndHttpContent(partialOptions, httpContent);
            const expectedConfig = {
                code: partialOptions.code,
                mediaType: httpContent.mediaType,
                bodyExample,
            };
            (0, utils_1.assertRight)(actualOperationConfig, operationConfig => {
                expect(operationConfig).toEqual(expectedConfig);
            });
        });
        it('and cannot find example but schema exists return dynamic', () => {
            const partialOptions = {
                dynamic: false,
                code: '200',
            };
            const httpContent = {
                id: faker.random.word(),
                mediaType: faker.system.mimeType(),
                examples: [],
                schema: { type: 'string' },
                encodings: [],
            };
            const actualOperationConfig = NegotiatorHelpers_1.default.negotiateByPartialOptionsAndHttpContent(partialOptions, httpContent);
            (0, utils_1.assertRight)(actualOperationConfig, operationConfig => {
                expect(operationConfig).toEqual({
                    code: partialOptions.code,
                    mediaType: httpContent.mediaType,
                    schema: { type: 'string' },
                });
            });
        });
        it('and cannot find example and dynamic does not exist throw error', () => {
            const partialOptions = {
                dynamic: false,
                code: '200',
            };
            const httpContent = {
                id: faker.random.word(),
                mediaType: faker.system.mimeType(),
                examples: [],
                encodings: [],
            };
            const proposedResponse = NegotiatorHelpers_1.default.negotiateByPartialOptionsAndHttpContent(partialOptions, httpContent);
            (0, utils_1.assertRight)(proposedResponse, response => {
                expect(response).toHaveProperty('code');
                expect(response).toHaveProperty('mediaType');
            });
        });
    });
});
