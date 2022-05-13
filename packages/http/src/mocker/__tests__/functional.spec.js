"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ajv_1 = require("ajv");
const prism_core_1 = require("@stoplight/prism-core");
const fixtures_1 = require("../../__tests__/fixtures");
const utils_1 = require("@stoplight/prism-core/src/__tests__/utils");
const index_1 = require("../index");
const logger = (0, prism_core_1.createLogger)('TEST', { enabled: false });
describe('http mocker', () => {
    describe('request is valid', () => {
        describe('given only enforced content type', () => {
            test('and that content type exists should first 200 static example', () => {
                const response = (0, index_1.default)({
                    resource: fixtures_1.httpOperations[0],
                    input: fixtures_1.httpRequests[0],
                    config: {
                        dynamic: false,
                        mediaTypes: ['text/plain'],
                    },
                })(logger);
                (0, utils_1.assertRight)(response, result => expect(result).toMatchSnapshot());
            });
            test('and that content type does not exist should return a 406 error', () => {
                const mockResult = (0, index_1.default)({
                    resource: fixtures_1.httpOperations[0],
                    input: fixtures_1.httpRequests[0],
                    config: {
                        dynamic: false,
                        mediaTypes: ['text/funky'],
                    },
                })(logger);
                (0, utils_1.assertLeft)(mockResult, e => expect(e).toHaveProperty('status', 406));
            });
        });
        describe('given enforced status code and contentType and exampleKey', () => {
            test('should return the matching example', () => {
                const response = (0, index_1.default)({
                    resource: fixtures_1.httpOperations[0],
                    input: fixtures_1.httpRequests[0],
                    config: {
                        dynamic: false,
                        code: 201,
                        exampleKey: 'second',
                        mediaTypes: ['application/xml'],
                    },
                })(logger);
                (0, utils_1.assertRight)(response, result => expect(result).toMatchSnapshot());
            });
        });
        describe('given enforced status code and contentType', () => {
            test('should return the first matching example', () => {
                const response = (0, index_1.default)({
                    resource: fixtures_1.httpOperations[0],
                    input: fixtures_1.httpRequests[0],
                    config: {
                        dynamic: false,
                        code: 201,
                        mediaTypes: ['application/xml'],
                    },
                })(logger);
                (0, utils_1.assertRight)(response, result => expect(result).toMatchSnapshot());
            });
        });
        describe('given enforced example key', () => {
            test('should return application/json, 200 response', () => {
                const response = (0, index_1.default)({
                    resource: fixtures_1.httpOperations[0],
                    input: fixtures_1.httpRequests[0],
                    config: {
                        dynamic: false,
                        exampleKey: 'bear',
                    },
                })(logger);
                (0, utils_1.assertRight)(response, result => expect(result).toMatchSnapshot());
            });
            test('and mediaType should return 200 response', () => {
                const response = (0, index_1.default)({
                    resource: fixtures_1.httpOperations[0],
                    input: fixtures_1.httpRequests[0],
                    config: {
                        dynamic: false,
                        exampleKey: 'second',
                        mediaTypes: ['application/xml'],
                    },
                })(logger);
                (0, utils_1.assertRight)(response, result => expect(result).toMatchSnapshot());
            });
        });
        describe('given enforced status code', () => {
            test('should return the first matching example of application/json', () => {
                const response = (0, index_1.default)({
                    resource: fixtures_1.httpOperations[0],
                    input: fixtures_1.httpRequests[0],
                    config: {
                        dynamic: false,
                        code: 201,
                    },
                })(logger);
                (0, utils_1.assertRight)(response, result => expect(result).toMatchSnapshot());
            });
            test('given that status code is not defined should throw an error', () => {
                const rejection = (0, index_1.default)({
                    resource: fixtures_1.httpOperations[0],
                    input: fixtures_1.httpRequests[0],
                    config: {
                        dynamic: false,
                        code: 205,
                    },
                })(logger);
                (0, utils_1.assertLeft)(rejection, e => expect(e).toHaveProperty('message', 'The server cannot find the requested content'));
            });
            test('and example key should return application/json example', () => {
                const response = (0, index_1.default)({
                    resource: fixtures_1.httpOperations[0],
                    input: fixtures_1.httpRequests[0],
                    config: {
                        dynamic: false,
                        code: 201,
                        exampleKey: 'second',
                    },
                })(logger);
                (0, utils_1.assertRight)(response, result => expect(result).toMatchSnapshot());
            });
            describe('HttpOperation contains example', () => {
                test('return lowest 2xx code and match response example to media type accepted by request', () => {
                    const response = (0, index_1.default)({
                        resource: fixtures_1.httpOperations[0],
                        input: fixtures_1.httpRequests[0],
                        config: { dynamic: false },
                    })(logger);
                    (0, utils_1.assertRight)(response, result => {
                        expect(result.statusCode).toBe(200);
                        expect(result.body).toMatchObject({
                            completed: true,
                            id: 1,
                            name: 'make prism',
                        });
                    });
                });
                test('return lowest 2xx response and the first example matching the media type', () => {
                    const response = (0, index_1.default)({
                        config: { dynamic: false },
                        resource: fixtures_1.httpOperations[1],
                        input: Object.assign({}, fixtures_1.httpRequests[0], {
                            data: Object.assign({}, fixtures_1.httpRequests[0].data, {
                                headers: { accept: 'application/xml' },
                            }),
                        }),
                    })(logger);
                    (0, utils_1.assertRight)(response, result => {
                        expect(result.statusCode).toBe(200);
                        expect(result.headers).toHaveProperty('x-todos-publish');
                    });
                });
                describe('the media type requested does not match the example', () => {
                    test('returns an error', () => {
                        const mockResult = (0, index_1.default)({
                            config: { dynamic: false },
                            resource: fixtures_1.httpOperations[0],
                            input: Object.assign({}, fixtures_1.httpRequests[0], {
                                data: Object.assign({}, fixtures_1.httpRequests[0].data, {
                                    headers: { accept: 'application/yaml' },
                                }),
                            }),
                        })(logger);
                        (0, utils_1.assertLeft)(mockResult, result => expect(result).toHaveProperty('status', 406));
                    });
                });
            });
            describe('HTTPOperation contain no examples', () => {
                test('return dynamic response', () => {
                    if (!fixtures_1.httpOperations[1].responses[0].contents[0].schema) {
                        throw new Error('Missing test');
                    }
                    const ajv = new ajv_1.default();
                    const validate = ajv.compile(fixtures_1.httpOperations[1].responses[0].contents[0].schema);
                    const response = (0, index_1.default)({
                        resource: fixtures_1.httpOperations[1],
                        input: fixtures_1.httpRequests[0],
                        config: { dynamic: true },
                    })(logger);
                    (0, utils_1.assertRight)(response, result => {
                        expect(result).toHaveProperty('statusCode', 200);
                        expect(result).toHaveProperty('headers', {
                            'Content-type': 'application/json',
                            'x-todos-publish': expect.any(String),
                        });
                        expect(validate(result.body)).toBeTruthy();
                    });
                });
            });
        });
        describe('request is invalid', () => {
            test('returns 422 and static error response', () => {
                const response = (0, index_1.default)({
                    config: { dynamic: false },
                    resource: fixtures_1.httpOperations[0],
                    input: fixtures_1.httpRequests[1],
                })(logger);
                (0, utils_1.assertRight)(response, result => {
                    expect(result.statusCode).toBe(422);
                    expect(result.body).toMatchObject({ message: 'error' });
                });
            });
        });
        test('returns 422 and dynamic error response', () => {
            if (!fixtures_1.httpOperations[1].responses[1].contents[0].schema) {
                throw new Error('Missing test');
            }
            const response = (0, index_1.default)({
                config: { dynamic: false },
                resource: fixtures_1.httpOperations[1],
                input: fixtures_1.httpRequests[1],
            })(logger);
            const ajv = new ajv_1.default();
            const validate = ajv.compile(fixtures_1.httpOperations[1].responses[1].contents[0].schema);
            (0, utils_1.assertRight)(response, result => {
                expect(validate(result.body)).toBeTruthy();
            });
        });
    });
    describe('for operation that is deprecated', () => {
        it('should set "Deprecation" header', () => {
            const response = (0, index_1.default)({
                config: { dynamic: false },
                resource: fixtures_1.httpOperationsByRef.deprecated,
                input: fixtures_1.httpRequests[2],
            })(logger);
            (0, utils_1.assertRight)(response, result => {
                expect(result.headers).toHaveProperty('deprecation', 'true');
                expect(result.statusCode).toEqual(200);
            });
        });
    });
});
