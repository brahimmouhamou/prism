"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@stoplight/types");
const fixtures_1 = require("../../__tests__/fixtures");
const index_1 = require("../index");
const utils_1 = require("@stoplight/prism-core/src/__tests__/utils");
const faker = require("faker/locale/en");
const BAD_INPUT = Object.assign({}, fixtures_1.httpInputs[2], {
    body: { name: 'Shopping', completed: 'yes' },
    url: Object.assign({}, fixtures_1.httpInputs[2].url, { query: { overwrite: 'true' } }),
    headers: { 'x-todos-publish': 'yesterday' },
});
const GOOD_INPUT = Object.assign({}, fixtures_1.httpInputs[2], {
    url: Object.assign({}, fixtures_1.httpInputs[0].url, { query: { completed: true } }),
});
const BAD_OUTPUT = Object.assign({}, fixtures_1.httpOutputs[1], {
    body: { name: 'Shopping', completed: 'yes' },
    headers: { 'x-todos-publish': 'yesterday', 'content-type': 'application/something' },
});
describe('HttpValidator', () => {
    describe('validateInput()', () => {
        describe('all validations are turned on', () => {
            it('returns validation errors for whole request structure', () => {
                expect((0, index_1.validateInput)({ resource: fixtures_1.httpOperations[2], element: BAD_INPUT })).toMatchSnapshot();
            });
            it.each(['yesterday', '', '2021-02-18T12:02:16.49Z', '2021-02-18T12:02:16.49'])('properly validate date-time format ("%s")', (dateValue) => {
                expect((0, index_1.validateInput)({
                    resource: {
                        id: '?http-operation-id?',
                        method: 'get',
                        path: '/todos',
                        responses: [
                            {
                                id: faker.random.word(),
                                code: '200',
                            },
                        ],
                        request: {
                            query: [
                                {
                                    id: faker.random.word(),
                                    name: 'updated_since',
                                    schema: {
                                        type: 'string',
                                        format: 'date-time',
                                        $schema: 'http://json-schema.org/draft-07/schema#',
                                    },
                                    style: types_1.HttpParamStyles.Form,
                                },
                            ],
                            cookie: [],
                            path: [],
                        },
                    },
                    element: {
                        method: 'get',
                        url: { path: '/todos', query: { updated_since: dateValue } },
                    },
                })).toMatchSnapshot();
            });
            describe('when all required params are provided', () => {
                it('returns no validation errors', () => {
                    (0, utils_1.assertRight)((0, index_1.validateInput)({ resource: fixtures_1.httpOperations[0], element: GOOD_INPUT }));
                });
            });
        });
        describe('deprecated keyword validation', () => {
            const resource = {
                id: 'abc',
                method: 'get',
                path: '/test',
                responses: [
                    {
                        id: faker.random.word(),
                        code: '200',
                    },
                ],
                request: {
                    query: [
                        {
                            id: faker.random.word(),
                            style: types_1.HttpParamStyles.Form,
                            deprecated: true,
                            name: 'productId',
                        },
                    ],
                },
            };
            it('returns warnings', () => {
                (0, utils_1.assertLeft)((0, index_1.validateInput)({
                    resource,
                    element: {
                        method: 'get',
                        url: {
                            path: '/test',
                            query: {
                                productId: 'abc',
                            },
                        },
                    },
                }), error => expect(error).toEqual([
                    {
                        code: 'deprecated',
                        message: 'Query param productId is deprecated',
                        path: ['query', 'productId'],
                        severity: types_1.DiagnosticSeverity.Warning,
                    },
                ]));
            });
            it('does not return warnings', () => {
                (0, utils_1.assertRight)((0, index_1.validateInput)({
                    resource,
                    element: {
                        method: 'get',
                        url: {
                            path: '/test',
                            query: {},
                        },
                    },
                }));
            });
        });
        describe('headers validation', () => {
            it('is case insensitive', () => {
                (0, utils_1.assertRight)((0, index_1.validateInput)({
                    resource: {
                        method: 'GET',
                        path: '/hey',
                        responses: [
                            {
                                id: faker.random.word(),
                                code: '200',
                            },
                        ],
                        id: 'hey',
                        request: {
                            headers: [
                                {
                                    id: faker.random.word(),
                                    name: 'API_KEY',
                                    style: types_1.HttpParamStyles.Simple,
                                    schema: {
                                        type: 'string',
                                    },
                                    required: true,
                                },
                            ],
                        },
                    },
                    element: {
                        method: 'get',
                        url: {
                            path: '/hey',
                        },
                        headers: {
                            api_Key: 'ha',
                        },
                    },
                }));
            });
        });
        describe('query validation', () => {
            it('returns only query validation errors', () => {
                (0, utils_1.assertLeft)((0, index_1.validateInput)({
                    resource: fixtures_1.httpOperations[2],
                    element: BAD_INPUT,
                }), error => expect(error).toContainEqual({
                    code: 'pattern',
                    message: 'must match pattern "^(yes|no)$"',
                    path: ['query', 'overwrite'],
                    severity: types_1.DiagnosticSeverity.Error,
                }));
            });
        });
    });
    describe('validateOutput()', () => {
        describe('all validations are turned on', () => {
            it('returns validation errors for whole request structure', () => {
                expect((0, index_1.validateOutput)({ resource: fixtures_1.httpOperations[1], element: BAD_OUTPUT })).toMatchSnapshot();
            });
        });
    });
});
