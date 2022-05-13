"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@stoplight/types");
const E = require("fp-ts/Either");
const validators = require("../validators");
const validator = require("../");
const utils_1 = require("@stoplight/prism-core/src/__tests__/utils");
const types_2 = require("../validators/types");
const faker = require("faker/locale/en");
const validate = (resourceExtension, inputExtension, length = 3) => () => {
    const validationResult = validator.validateInput({
        resource: Object.assign({
            method: 'get',
            path: '/',
            id: '1',
            request: {},
            responses: [{ id: faker.random.word(), code: '200' }],
        }, resourceExtension),
        element: Object.assign({ method: 'get', url: { path: '/', query: {} } }, inputExtension),
    });
    length === 0
        ? (0, utils_1.assertRight)(validationResult)
        : (0, utils_1.assertLeft)(validationResult, error => expect(error).toHaveLength(length));
};
const mockError = {
    message: 'mocked C is required',
    code: 'required',
    path: ['mocked-b'],
    severity: types_1.DiagnosticSeverity.Error,
};
describe('HttpValidator', () => {
    describe('validator.validateInput()', () => {
        beforeAll(() => {
            jest.spyOn(validators, 'validateQuery').mockReturnValue(E.left([mockError]));
            jest.spyOn(validators, 'validateBody').mockReturnValue(E.left([mockError]));
            jest.spyOn(validators, 'validateHeaders').mockReturnValue(E.left([mockError]));
            jest.spyOn(validators, 'validatePath').mockReturnValue(E.left([mockError]));
        });
        afterAll(() => jest.restoreAllMocks());
        describe('body validation in enabled', () => {
            describe('request.body is set', () => {
                describe('request body is not required', () => {
                    it('does not try to validate the body', validate({ request: { body: { id: faker.random.word(), required: false, contents: [] } } }, undefined, 0));
                });
                describe('request body is required', () => {
                    it('tries to validate the body', validate({
                        method: 'get',
                        path: '/',
                        id: '1',
                        request: { body: { id: faker.random.word(), contents: [], required: true } },
                        responses: [{ id: faker.random.word(), code: '200' }],
                    }, undefined, 1));
                });
            });
        });
        describe('headers validation in enabled', () => {
            describe('request is not set', () => {
                it('does not validate headers', validate(undefined, undefined, 0));
            });
        });
        describe('query validation is enabled', () => {
            describe('request is not set', () => {
                it('does not validate query', validate(undefined, undefined, 0));
            });
            describe('request is set', () => {
                describe('request.query is not set', () => {
                    it('does not validate query', validate({ request: {} }, undefined, 0));
                });
                describe('request.query is set', () => {
                    it('validates query', validate({
                        request: {
                            query: [
                                { id: faker.random.word(), style: types_1.HttpParamStyles.SpaceDelimited, name: 'hey', required: true },
                            ],
                        },
                    }, undefined, 1));
                });
            });
            describe('input.url.query is not set', () => {
                it("validates query assuming it's empty", validate(undefined, { url: { path: '/' } }, 0));
            });
        });
        describe('path validation in enabled', () => {
            describe('request is set', () => {
                describe('request.path is set', () => {
                    it('calls the path validator', () => {
                        validator.validateInput({
                            resource: {
                                method: 'get',
                                path: '/a/{a}/b/{b}',
                                id: '1',
                                request: {
                                    path: [
                                        { id: faker.random.word(), name: 'a', style: types_1.HttpParamStyles.Simple },
                                        { id: faker.random.word(), name: 'b', style: types_1.HttpParamStyles.Matrix },
                                    ],
                                },
                                responses: [{ id: faker.random.word(), code: '200' }],
                            },
                            element: { method: 'get', url: { path: '/a/1/b/;b=2' } },
                        });
                        expect(validators.validatePath).toHaveBeenCalledWith({ a: '1', b: ';b=2' }, [
                            { id: expect.any(String), name: 'a', style: types_1.HttpParamStyles.Simple },
                            { id: expect.any(String), name: 'b', style: types_1.HttpParamStyles.Matrix },
                        ], undefined);
                    });
                });
            });
        });
        describe('path validation in enabled', () => {
            describe('request is set', () => {
                describe('request.path is set and has hyphens in path params', () => {
                    it('calls the path validator', () => {
                        validator.validateInput({
                            resource: {
                                method: 'get',
                                path: '/a-path/{a-id}/b/{b-id}',
                                id: '1',
                                request: {
                                    path: [
                                        { id: faker.random.word(), name: 'a-id', style: types_1.HttpParamStyles.Simple },
                                        { id: faker.random.word(), name: 'b-id', style: types_1.HttpParamStyles.Matrix },
                                    ],
                                },
                                responses: [{ id: faker.random.word(), code: '200' }],
                            },
                            element: { method: 'get', url: { path: '/a-path/1/b/;b-id=2' } },
                        });
                        expect(validators.validatePath).toHaveBeenCalledWith({ 'a-id': '1', 'b-id': ';b-id=2' }, [
                            { id: expect.any(String), name: 'a-id', style: types_1.HttpParamStyles.Simple },
                            { id: expect.any(String), name: 'b-id', style: types_1.HttpParamStyles.Matrix },
                        ], undefined);
                    });
                });
            });
        });
    });
    describe('validateOutput()', () => {
        describe('output is set', () => {
            beforeAll(() => {
                jest.spyOn(validators, 'validateBody').mockReturnValue(E.left([mockError]));
                jest.spyOn(validators, 'validateQuery').mockReturnValue(E.left([mockError]));
                jest.spyOn(validators, 'validateHeaders').mockReturnValue(E.left([mockError]));
            });
            afterAll(() => jest.restoreAllMocks());
            describe('the output does not have the media type header', () => {
                it('validates the body and headers, but not the media type', () => {
                    (0, utils_1.assertLeft)(validator.validateOutput({
                        resource: {
                            method: 'get',
                            path: '/',
                            id: '1',
                            request: {},
                            responses: [{ id: faker.random.word(), code: '200' }],
                        },
                        element: { statusCode: 200 },
                    }), error => expect(error).toHaveLength(2));
                    expect(validators.validateBody).toHaveBeenCalledWith(undefined, [], types_2.ValidationContext.Output, undefined, undefined);
                    expect(validators.validateHeaders).toHaveBeenCalled();
                });
            });
            describe('the output has the media type header', () => {
                it('should validate the media type as well', () => {
                    (0, utils_1.assertLeft)(validator.validateOutput({
                        resource: {
                            method: 'get',
                            path: '/',
                            id: '1',
                            request: {},
                            responses: [
                                {
                                    id: faker.random.word(),
                                    code: '200',
                                    contents: [{ id: faker.random.word(), mediaType: 'application/json' }],
                                },
                            ],
                        },
                        element: { statusCode: 200, headers: { 'content-type': 'text/plain' } },
                    }), e => expect(e).toHaveLength(3));
                });
            });
        });
        describe('cannot match status code with responses', () => {
            beforeEach(() => {
                jest.spyOn(validators, 'validateBody').mockReturnValue(E.right({}));
                jest.spyOn(validators, 'validateHeaders').mockReturnValue(E.right({}));
            });
            afterEach(() => jest.clearAllMocks());
            const resource = {
                method: 'get',
                path: '/',
                id: '1',
                request: {},
                responses: [{ id: faker.random.word(), code: '200' }],
            };
            describe('when the desidered response is between 200 and 300', () => {
                it('returns an error', () => {
                    (0, utils_1.assertLeft)(validator.validateOutput({ resource, element: { statusCode: 201 } }), error => expect(error).toEqual([
                        {
                            message: 'Unable to match the returned status code with those defined in the document: 200',
                            severity: types_1.DiagnosticSeverity.Error,
                        },
                    ]));
                });
            });
            describe('when the desidered response is over 300', () => {
                it('returns an error', () => {
                    (0, utils_1.assertLeft)(validator.validateOutput({ resource, element: { statusCode: 400 } }), error => expect(error).toEqual([
                        {
                            message: 'Unable to match the returned status code with those defined in the document: 200',
                            severity: types_1.DiagnosticSeverity.Warning,
                        },
                    ]));
                });
            });
        });
        describe('returned response media type', () => {
            const resource = {
                method: 'get',
                path: '/',
                id: '1',
                request: {},
                responses: [
                    {
                        id: faker.random.word(),
                        code: '200',
                        contents: [
                            {
                                id: faker.random.word(),
                                mediaType: 'application/json',
                                schema: {
                                    type: 'string',
                                },
                            },
                        ],
                    },
                ],
            };
            describe('when the response has a content type not declared in the spec', () => {
                it('returns an error', () => {
                    (0, utils_1.assertLeft)(validator.validateOutput({
                        resource,
                        element: { statusCode: 200, headers: { 'content-type': 'application/xml' } },
                    }), error => expect(error).toEqual([
                        {
                            message: 'The received media type "application/xml" does not match the one specified in the current response: application/json',
                            severity: types_1.DiagnosticSeverity.Error,
                        },
                    ]));
                });
            });
            describe('when the response has a content type declared in the spec', () => {
                it('returns an error', () => {
                    (0, utils_1.assertRight)(validator.validateOutput({
                        resource,
                        element: { statusCode: 200, headers: { 'content-type': 'application/json' } },
                    }));
                });
            });
        });
    });
});
describe('validateMediaType()', () => {
    describe('when available content type does not have parameters', () => {
        const content = {
            id: faker.random.word(),
            mediaType: 'application/vnd.archa.api+json',
        };
        describe('and the request media type matches, but has parameter', () => {
            it('should pass the validation', () => {
                const result = validator.validateMediaType([content], 'application/vnd.archa.api+json; version=1');
                (0, utils_1.assertRight)(result);
            });
        });
    });
});
