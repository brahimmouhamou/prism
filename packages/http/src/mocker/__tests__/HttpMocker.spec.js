"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prism_core_1 = require("@stoplight/prism-core");
const types_1 = require("@stoplight/types");
const ReaderEither_1 = require("fp-ts/ReaderEither");
const E = require("fp-ts/Either");
const lodash_1 = require("lodash");
const mocker_1 = require("../../mocker");
const JSONSchemaGenerator = require("../../mocker/generator/JSONSchema");
const NegotiatorHelpers_1 = require("../negotiator/NegotiatorHelpers");
const utils_1 = require("@stoplight/prism-core/src/__tests__/utils");
const callbacks_1 = require("../callback/callbacks");
jest.mock('../callback/callbacks', () => ({
    runCallback: jest.fn(() => () => () => undefined),
}));
const logger = (0, prism_core_1.createLogger)('TEST', { enabled: false });
describe('mocker', () => {
    afterEach(() => jest.restoreAllMocks());
    describe('mock()', () => {
        const mockSchema = {
            type: 'object',
            properties: {
                name: { type: 'string' },
                surname: { type: 'string', format: 'email' },
            },
            required: ['name', 'surname'],
        };
        const mockResource = {
            id: 'id',
            method: 'get',
            path: '/test',
            request: {},
            responses: [
                {
                    id: '200',
                    code: '200',
                    headers: [],
                    contents: [
                        {
                            id: 'contents',
                            mediaType: 'application/json',
                            schema: mockSchema,
                            examples: [
                                {
                                    id: 'example-1',
                                    key: 'preferred key',
                                    value: 'hello',
                                },
                                {
                                    id: 'example-2',
                                    key: 'test key',
                                    value: 'test value',
                                },
                                {
                                    id: 'example-3',
                                    key: 'test key2',
                                    externalValue: 'http://example.org/examples/example1',
                                },
                            ],
                            encodings: [],
                        },
                    ],
                },
                {
                    id: '201',
                    code: '201',
                    headers: [],
                    contents: [
                        {
                            id: 'contents',
                            mediaType: 'application/json',
                            schema: {
                                $ref: '#/responses/0/contents/0/schema',
                            },
                        },
                    ],
                },
                {
                    id: '422',
                    code: '422',
                    headers: [],
                    contents: [
                        {
                            id: 'contents',
                            mediaType: 'application/json',
                            examples: [
                                {
                                    id: 'example-1',
                                    key: 'invalid_1',
                                    value: 'invalid input 1',
                                },
                                {
                                    id: 'example-2',
                                    key: 'invalid_2',
                                    value: 'invalid input 2',
                                },
                            ],
                            encodings: [],
                        },
                    ],
                },
            ],
        };
        const mockInput = {
            validations: [],
            data: {
                method: 'get',
                url: {
                    path: '/test',
                    baseUrl: 'example.com',
                },
            },
        };
        describe('with valid negotiator response', () => {
            it('returns an empty body when negotiator did not resolve to either example nor schema', () => {
                jest
                    .spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsForValidRequest')
                    .mockReturnValue((0, ReaderEither_1.right)({ code: '202', mediaType: 'test', headers: [] }));
                const mockResult = (0, mocker_1.default)({
                    config: { dynamic: false },
                    resource: mockResource,
                    input: mockInput,
                })(logger);
                (0, utils_1.assertRight)(mockResult, result => expect(result).toHaveProperty('body', undefined));
            });
            it('returns static example', () => {
                jest.spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsForValidRequest').mockReturnValue((0, ReaderEither_1.right)({
                    code: '202',
                    mediaType: 'test',
                    bodyExample: mockResource.responses[0].contents[0].examples[0],
                    headers: [],
                }));
                const mockResult = (0, mocker_1.default)({
                    config: { dynamic: false },
                    resource: mockResource,
                    input: mockInput,
                })(logger);
                (0, utils_1.assertRight)(mockResult, result => expect(result).toMatchSnapshot());
            });
            it('returns dynamic example', () => {
                jest.spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsForValidRequest').mockReturnValue((0, ReaderEither_1.right)({
                    code: '202',
                    mediaType: 'test',
                    schema: mockResource.responses[0].contents[0].schema,
                    headers: [],
                }));
                const response = (0, mocker_1.default)({
                    config: { dynamic: true },
                    resource: mockResource,
                    input: mockInput,
                })(logger);
                (0, utils_1.assertRight)(response, result => {
                    return expect(result).toHaveProperty('body', {
                        name: expect.any(String),
                        surname: expect.any(String),
                    });
                });
            });
            it('runs defined callbacks', () => {
                const callbacksMockResource = {
                    ...mockResource,
                    callbacks: [
                        {
                            callbackName: 'c1',
                            method: 'get',
                            path: 'http://example.com/notify',
                            id: '1',
                            responses: [{ id: '200', code: '200', contents: [{ id: 'contents', mediaType: 'application/json' }] }],
                        },
                        {
                            callbackName: 'c2',
                            method: 'get',
                            path: 'http://example.com/notify2',
                            id: '2',
                            responses: [{ id: '200', code: '200', contents: [{ id: 'contents', mediaType: 'application/json' }] }],
                        },
                    ],
                };
                jest.spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsForValidRequest').mockReturnValue((0, ReaderEither_1.right)({
                    code: '202',
                    mediaType: 'test',
                    schema: callbacksMockResource.responses[0].contents[0].schema,
                    headers: [],
                }));
                const response = (0, mocker_1.default)({
                    config: { dynamic: true },
                    resource: callbacksMockResource,
                    input: mockInput,
                })(logger);
                (0, utils_1.assertRight)(response, () => {
                    expect(callbacks_1.runCallback).toHaveBeenCalledTimes(2);
                    expect(callbacks_1.runCallback).toHaveBeenNthCalledWith(1, expect.objectContaining({ callback: expect.objectContaining({ callbackName: 'c1' }) }));
                    expect(callbacks_1.runCallback).toHaveBeenNthCalledWith(2, expect.objectContaining({ callback: expect.objectContaining({ callbackName: 'c2' }) }));
                });
            });
            describe('body is url encoded', () => {
                it('runs callback with deserialized body', () => {
                    const callbacksMockResource = {
                        ...mockResource,
                        request: {
                            body: {
                                id: 'body',
                                contents: [
                                    {
                                        id: 'application/x-www-form-urlencoded',
                                        mediaType: 'application/x-www-form-urlencoded',
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                param1: { type: 'string' },
                                                param2: { type: 'string' },
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                        callbacks: [
                            {
                                callbackName: 'callback',
                                method: 'get',
                                path: 'http://example.com/notify',
                                id: '1',
                                responses: [
                                    { id: '200', code: '200', contents: [{ id: 'application/json', mediaType: 'application/json' }] },
                                ],
                            },
                        ],
                    };
                    jest.spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsForValidRequest').mockReturnValue((0, ReaderEither_1.right)({
                        code: '202',
                        mediaType: 'test',
                        schema: callbacksMockResource.responses[0].contents[0].schema,
                        headers: [],
                    }));
                    const response = (0, mocker_1.default)({
                        config: { dynamic: true },
                        resource: callbacksMockResource,
                        input: {
                            ...mockInput,
                            data: {
                                ...mockInput.data,
                                body: 'param1=test1&param2=test2',
                                headers: {
                                    ...mockInput.data.headers,
                                    'content-type': 'application/x-www-form-urlencoded',
                                },
                            },
                        },
                    })(logger);
                    (0, utils_1.assertRight)(response, () => {
                        expect(callbacks_1.runCallback).toHaveBeenCalledWith(expect.objectContaining({
                            request: expect.objectContaining({
                                body: {
                                    param1: 'test1',
                                    param2: 'test2',
                                },
                            }),
                        }));
                    });
                });
            });
        });
        describe('with a negotiator response containing validation results of Warning severity', () => {
            it('returns static example', () => {
                jest.spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsForInvalidRequest');
                jest.spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsForValidRequest');
                (0, mocker_1.default)({
                    config: { dynamic: false },
                    resource: mockResource,
                    input: Object.assign({}, mockInput, { validations: [{ severity: types_1.DiagnosticSeverity.Warning }] }),
                })(logger);
                expect(NegotiatorHelpers_1.default.negotiateOptionsForValidRequest).toHaveBeenCalled();
                expect(NegotiatorHelpers_1.default.negotiateOptionsForInvalidRequest).not.toHaveBeenCalled();
            });
        });
        describe('with a negotiator response containing validation results of Error severity', () => {
            it('returns static example', () => {
                jest.spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsForValidRequest');
                jest.spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsForInvalidRequest');
                (0, mocker_1.default)({
                    config: { dynamic: false },
                    resource: mockResource,
                    input: Object.assign({}, mockInput, { validations: [{ severity: types_1.DiagnosticSeverity.Error }] }),
                })(logger);
                expect(NegotiatorHelpers_1.default.negotiateOptionsForValidRequest).not.toHaveBeenCalled();
                expect(NegotiatorHelpers_1.default.negotiateOptionsForInvalidRequest).toHaveBeenCalled();
            });
            describe('with examples are defined and exampleKey is defined', () => {
                const response = (0, mocker_1.default)({
                    input: Object.assign({}, mockInput, { validations: [{ severity: types_1.DiagnosticSeverity.Error }] }),
                    resource: mockResource,
                    config: { dynamic: false, exampleKey: 'invalid_2', code: 400 },
                })(logger);
                it('should return the selected example', () => {
                    const selectedExample = (0, lodash_1.flatMap)(mockResource.responses, res => (0, lodash_1.flatMap)(res.contents, content => content.examples || [])).find(ex => ex.key === 'invalid_2');
                    expect(selectedExample).toBeDefined();
                    (0, utils_1.assertRight)(response, result => {
                        expect(result.body).toEqual(selectedExample.value);
                    });
                });
            });
            describe('with examples are defined and incorrect exampleKey', () => {
                const response = (0, mocker_1.default)({
                    input: Object.assign({}, mockInput, { validations: [{ severity: types_1.DiagnosticSeverity.Error }] }),
                    resource: mockResource,
                    config: { dynamic: false, exampleKey: 'missingKey', code: 400 },
                })(logger);
                it('should return 404 error', () => {
                    const selectedExample = (0, lodash_1.flatMap)(mockResource.responses, res => (0, lodash_1.flatMap)(res.contents, content => content.examples || [])).find(ex => ex.key === 'invalid_2');
                    expect(selectedExample).toBeDefined();
                    (0, utils_1.assertLeft)(response, result => {
                        expect(result).toMatchObject({
                            detail: 'Response for contentType: application/json and exampleKey: missingKey does not exist.',
                            name: 'https://stoplight.io/prism/errors#NOT_FOUND',
                            status: 404,
                        });
                    });
                });
            });
        });
        describe('when example is of type INodeExternalExample', () => {
            it('generates a dynamic example', () => {
                jest.spyOn(NegotiatorHelpers_1.default, 'negotiateOptionsForValidRequest').mockReturnValue((0, ReaderEither_1.right)({
                    code: '202',
                    mediaType: 'test',
                    bodyExample: mockResource.responses[0].contents[0].examples[1],
                    headers: [],
                    schema: { type: 'string' },
                }));
                jest.spyOn(JSONSchemaGenerator, 'generate').mockReturnValue(E.right('example value chelsea'));
                const mockResult = (0, mocker_1.default)({
                    config: { dynamic: true },
                    resource: mockResource,
                    input: mockInput,
                })(logger);
                (0, utils_1.assertRight)(mockResult, result => expect(result).toMatchSnapshot());
            });
        });
        describe('when an example is defined', () => {
            describe('and dynamic flag is true', () => {
                describe('should generate a dynamic response', () => {
                    const generatedExample = { hello: 'world' };
                    beforeAll(() => {
                        jest.spyOn(JSONSchemaGenerator, 'generate').mockReturnValue(E.right(generatedExample));
                        jest.spyOn(JSONSchemaGenerator, 'generateStatic');
                    });
                    afterAll(() => {
                        jest.restoreAllMocks();
                    });
                    it('the dynamic response should not be an example one', () => {
                        const response = (0, mocker_1.default)({
                            input: mockInput,
                            resource: mockResource,
                            config: { dynamic: true },
                        })(logger);
                        expect(JSONSchemaGenerator.generate).toHaveBeenCalled();
                        expect(JSONSchemaGenerator.generateStatic).not.toHaveBeenCalled();
                        const allExamples = (0, lodash_1.flatMap)(mockResource.responses, res => (0, lodash_1.flatMap)(res.contents, content => content.examples || [])).map(x => {
                            if ('value' in x)
                                return x.value;
                        });
                        (0, utils_1.assertRight)(response, result => {
                            expect(result.body).toBeDefined();
                            allExamples.forEach(example => expect(result.body).not.toEqual(example));
                            expect(result.body).toHaveProperty('hello', 'world');
                        });
                    });
                });
            });
            describe('and dynamic flag is false', () => {
                describe('and the response has an example', () => {
                    describe('and the example has been explicited', () => {
                        const response = (0, mocker_1.default)({
                            input: mockInput,
                            resource: mockResource,
                            config: { dynamic: true, exampleKey: 'test key' },
                        })(logger);
                        it('should return the selected example', () => {
                            const selectedExample = (0, lodash_1.flatMap)(mockResource.responses, res => (0, lodash_1.flatMap)(res.contents, content => content.examples || [])).find(ex => ex.key === 'test key');
                            expect(selectedExample).toBeDefined();
                            (0, utils_1.assertRight)(response, result => expect(result.body).toEqual(selectedExample.value));
                        });
                    });
                    describe('no response example is requested', () => {
                        const response = (0, mocker_1.default)({
                            input: mockInput,
                            resource: mockResource,
                            config: { dynamic: false },
                        })(logger);
                        it('returns the first example', () => {
                            (0, utils_1.assertRight)(response, result => {
                                expect(result.body).toBeDefined();
                                const selectedExample = mockResource.responses[0].contents[0].examples[0];
                                expect(selectedExample).toBeDefined();
                                expect(result.body).toEqual(selectedExample.value);
                            });
                        });
                    });
                });
                describe('and the response has not an examples', () => {
                    function createOperationWithSchema(schema) {
                        return {
                            id: 'id',
                            method: 'get',
                            path: '/test',
                            request: {},
                            responses: [
                                {
                                    id: '200',
                                    code: '200',
                                    headers: [],
                                    contents: [
                                        {
                                            id: 'application/json',
                                            mediaType: 'application/json',
                                            schema,
                                        },
                                    ],
                                },
                            ],
                        };
                    }
                    function mockResponseWithSchema(schema) {
                        return (0, mocker_1.default)({
                            input: mockInput,
                            resource: createOperationWithSchema(schema),
                            config: { dynamic: false },
                        })(logger);
                    }
                    describe('and the property has an example key', () => {
                        const eitherResponse = mockResponseWithSchema({
                            type: 'object',
                            properties: {
                                name: { type: 'string', examples: ['Clark'] },
                            },
                        });
                        it('should return the example key', () => (0, utils_1.assertRight)(eitherResponse, response => expect(response.body).toHaveProperty('name', 'Clark')));
                        describe('and also a default key', () => {
                            const eitherResponseWithDefault = mockResponseWithSchema({
                                type: 'object',
                                properties: {
                                    middlename: { type: 'string', examples: ['J'], default: 'JJ' },
                                },
                            });
                            it('prefers the default', () => (0, utils_1.assertRight)(eitherResponseWithDefault, responseWithDefault => expect(responseWithDefault.body).toHaveProperty('middlename', 'JJ')));
                        });
                        describe('with multiple example values in the array', () => {
                            const eitherResponseWithMultipleExamples = mockResponseWithSchema({
                                type: 'object',
                                properties: {
                                    middlename: { type: 'string', examples: ['WW', 'JJ'] },
                                },
                            });
                            it('prefers the first example', () => (0, utils_1.assertRight)(eitherResponseWithMultipleExamples, responseWithMultipleExamples => expect(responseWithMultipleExamples.body).toHaveProperty('middlename', 'WW')));
                        });
                        describe('with an empty `examples` array', () => {
                            const eitherResponseWithNoExamples = mockResponseWithSchema({
                                type: 'object',
                                properties: {
                                    middlename: { type: 'string', examples: [] },
                                },
                            });
                            it('fallbacks to string', () => (0, utils_1.assertRight)(eitherResponseWithNoExamples, responseWithNoExamples => expect(responseWithNoExamples.body).toHaveProperty('middlename', 'string')));
                        });
                    });
                    describe('and the property containing the example is deeply nested', () => {
                        const eitherResponseWithNestedObject = mockResponseWithSchema({
                            type: 'object',
                            properties: {
                                pet: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', examples: ['Clark'] },
                                        middlename: { type: 'string', examples: ['J'], default: 'JJ' },
                                    },
                                },
                            },
                        });
                        (0, utils_1.assertRight)(eitherResponseWithNestedObject, responseWithNestedObject => {
                            it('should return the example key', () => expect(responseWithNestedObject.body).toHaveProperty('pet.name', 'Clark'));
                            it('should still prefer the default', () => expect(responseWithNestedObject.body).toHaveProperty('pet.middlename', 'JJ'));
                        });
                    });
                    describe('and the property has not an example, but a default key', () => {
                        const eitherResponse = mockResponseWithSchema({
                            type: 'object',
                            properties: {
                                surname: { type: 'string', default: 'Kent' },
                            },
                        });
                        it('should use such key', () => {
                            (0, utils_1.assertRight)(eitherResponse, response => expect(response.body).toHaveProperty('surname', 'Kent'));
                        });
                    });
                    describe('and the property has nor default, nor example', () => {
                        describe('is nullable', () => {
                            const eitherResponse = mockResponseWithSchema({
                                type: 'object',
                                properties: {
                                    age: { type: ['number', 'null'] },
                                },
                            });
                            it('should be set to number', () => (0, utils_1.assertRight)(eitherResponse, response => expect(response.body).toHaveProperty('age', 0)));
                        });
                        describe('and is not nullable', () => {
                            const eitherResponse = mockResponseWithSchema({
                                type: 'object',
                                properties: {
                                    name: { type: 'string', examples: ['Clark'] },
                                    middlename: { type: 'string', examples: ['J'], default: 'JJ' },
                                    surname: { type: 'string', default: 'Kent' },
                                    age: { type: ['number', 'null'] },
                                    email: { type: 'string' },
                                    deposit: { type: 'number' },
                                    paymentStatus: { type: 'string', enum: ['completed', 'outstanding'] },
                                    creditScore: {
                                        anyOf: [{ type: 'number', examples: [1958] }, { type: 'string' }],
                                    },
                                    paymentScore: {
                                        oneOf: [{ type: 'string' }, { type: 'number', examples: [1958] }],
                                    },
                                    walletScore: {
                                        allOf: [{ type: 'string' }, { default: 'hello' }],
                                    },
                                    pet: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string', examples: ['Clark'] },
                                            middlename: { type: 'string', examples: ['J'], default: 'JJ' },
                                        },
                                    },
                                },
                                required: ['name', 'surname', 'age', 'email'],
                            });
                            (0, utils_1.assertRight)(eitherResponse, response => {
                                it('should return the default string', () => expect(response.body).toHaveProperty('email', 'string'));
                                it('should return the default number', () => expect(response.body).toHaveProperty('deposit', 0));
                                it('should return the first enum value', () => expect(response.body).toHaveProperty('paymentStatus', 'completed'));
                                it('should return the first anyOf value', () => expect(response.body).toHaveProperty('creditScore', 1958));
                                it('should return the first oneOf value', () => expect(response.body).toHaveProperty('paymentScore', 'string'));
                                it('should return the first allOf value', () => expect(response.body).toHaveProperty('walletScore', 'hello'));
                            });
                        });
                    });
                });
            });
        });
        describe('when response schema has an inline $ref', () => {
            it('returns static example', () => {
                const mockResult = (0, mocker_1.default)({
                    config: { dynamic: false, code: 201 },
                    resource: mockResource,
                    input: mockInput,
                })(logger);
                (0, utils_1.assertRight)(mockResult, result => {
                    expect(result.body).toHaveProperty('name');
                    expect(result.body).toHaveProperty('surname');
                });
            });
        });
    });
});
