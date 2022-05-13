"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@stoplight/types");
const __1 = require("../");
const utils_1 = require("@stoplight/prism-core/src/__tests__/utils");
const faker = require("faker/locale/en");
const baseRequest = {
    method: 'get',
    url: { path: '/hey' },
};
describe('validateSecurity', () => {
    const token = Buffer.from('test:test').toString('base64');
    it('passes the validation', () => {
        (0, utils_1.assertRight)((0, __1.validateSecurity)({ element: baseRequest, resource: { security: [[]] } }));
    });
    describe('when security scheme uses Basic authorization', () => {
        const securityScheme = [
            [{ id: faker.random.word(), scheme: 'basic', type: 'http', key: 'sec' }],
        ];
        it('passes the validation', () => {
            (0, utils_1.assertRight)((0, __1.validateSecurity)({
                element: { ...baseRequest, headers: { authorization: `Basic ${token}` } },
                resource: { security: securityScheme },
            }));
        });
        it('fails with an invalid credentials error', () => {
            (0, utils_1.assertLeft)((0, __1.validateSecurity)({
                element: { ...baseRequest, headers: { authorization: 'Basic abc123' } },
                resource: { security: securityScheme },
            }), res => expect(res).toStrictEqual([
                {
                    code: 401,
                    message: 'Invalid security scheme used',
                    severity: types_1.DiagnosticSeverity.Error,
                    tags: [],
                },
            ]));
        });
        it('fails with an invalid security scheme error', () => {
            (0, utils_1.assertLeft)((0, __1.validateSecurity)({
                element: { ...baseRequest, headers: { authorization: 'Bearer abc123' } },
                resource: { security: securityScheme },
            }), res => expect(res).toStrictEqual([
                {
                    code: 401,
                    tags: ['Basic realm="*"'],
                    message: 'Invalid security scheme used',
                    severity: types_1.DiagnosticSeverity.Error,
                },
            ]));
        });
    });
    describe('when security scheme uses Digest authorization', () => {
        const securityScheme = [
            [{ id: faker.random.word(), scheme: 'digest', type: 'http', key: 'sec' }],
        ];
        it('passes the validation', () => {
            (0, utils_1.assertRight)((0, __1.validateSecurity)({
                element: {
                    ...baseRequest,
                    headers: { authorization: 'Digest username="", realm="", nonce="", uri="", response=""' },
                },
                resource: { security: securityScheme },
            }));
        });
        it('fails with an invalid credentials error', () => {
            (0, utils_1.assertLeft)((0, __1.validateSecurity)({
                element: { ...baseRequest, headers: { authorization: 'Digest username=""' } },
                resource: { security: securityScheme },
            }), res => expect(res).toStrictEqual([
                {
                    code: 401,
                    message: 'Invalid security scheme used',
                    severity: types_1.DiagnosticSeverity.Error,
                    tags: [],
                },
            ]));
        });
    });
    describe('when security scheme uses Bearer authorization', () => {
        const securityScheme = [
            [{ id: faker.random.word(), scheme: 'bearer', type: 'http', key: 'sec' }],
        ];
        it('passes the validation', () => {
            (0, utils_1.assertRight)((0, __1.validateSecurity)({
                element: { ...baseRequest, headers: { authorization: 'Bearer abc123' } },
                resource: { security: securityScheme },
            }));
        });
        it('fails with an invalid security scheme error', () => {
            (0, utils_1.assertLeft)((0, __1.validateSecurity)({
                element: { ...baseRequest, headers: { authorization: 'Digest abc123' } },
                resource: { security: securityScheme },
            }), res => expect(res).toStrictEqual([
                {
                    code: 401,
                    tags: ['Bearer'],
                    message: 'Invalid security scheme used',
                    severity: types_1.DiagnosticSeverity.Error,
                },
            ]));
        });
    });
    describe('when security scheme uses OAuth2 authorization', () => {
        const securityScheme = [
            [{ id: faker.random.word(), type: 'oauth2', flows: {}, key: 'sec' }],
        ];
        it('it passes the validation', () => {
            (0, utils_1.assertRight)((0, __1.validateSecurity)({
                element: { ...baseRequest, headers: { authorization: 'Bearer abc123' } },
                resource: { security: securityScheme },
            }));
        });
        it('fails with an invalid security scheme error', () => {
            (0, utils_1.assertLeft)((0, __1.validateSecurity)({
                element: { ...baseRequest, headers: { authorization: 'Digest abc123' } },
                resource: { security: securityScheme },
            }), res => expect(res).toStrictEqual([
                {
                    code: 401,
                    tags: ['OAuth2'],
                    message: 'Invalid security scheme used',
                    severity: types_1.DiagnosticSeverity.Error,
                },
            ]));
        });
    });
    describe('when security scheme uses OpenID authorization', () => {
        const securityScheme = [
            [{ id: faker.random.word(), type: 'openIdConnect', openIdConnectUrl: 'https://google.it', key: 'sec' }],
        ];
        it('passes the validation', () => {
            (0, utils_1.assertRight)((0, __1.validateSecurity)({
                element: { ...baseRequest, headers: { authorization: 'Bearer abc123' } },
                resource: { security: securityScheme },
            }));
        });
        it('fails with an invalid security scheme error', () => {
            (0, utils_1.assertLeft)((0, __1.validateSecurity)({
                element: { ...baseRequest, headers: { authorization: 'Digest abc123' } },
                resource: { security: securityScheme },
            }), res => expect(res).toStrictEqual([
                {
                    code: 401,
                    tags: ['OpenID'],
                    message: 'Invalid security scheme used',
                    severity: types_1.DiagnosticSeverity.Error,
                },
            ]));
        });
    });
    describe('when security scheme uses Api Key authorization', () => {
        describe('when api key schema is used with another security scheme', () => {
            it('does not add info to WWW-Authenticate header', () => {
                (0, utils_1.assertLeft)((0, __1.validateSecurity)({
                    element: { ...baseRequest, headers: {} },
                    resource: {
                        security: [
                            [
                                { id: faker.random.word(), scheme: 'basic', type: 'http', key: 'sec' },
                                { id: faker.random.word(), in: 'header', type: 'apiKey', name: 'x-api-key', key: 'sec' },
                            ],
                        ],
                    },
                }), res => expect(res).toStrictEqual([
                    {
                        code: 401,
                        tags: ['Basic realm="*"'],
                        message: 'Invalid security scheme used',
                        severity: types_1.DiagnosticSeverity.Error,
                    },
                ]));
            });
        });
        describe('when api key is expected to be found in a header', () => {
            const securityScheme = [
                [{ id: faker.random.word(), in: 'header', type: 'apiKey', name: 'x-api-key', key: 'sec' }],
            ];
            it('passes the validation', () => {
                (0, utils_1.assertRight)((0, __1.validateSecurity)({
                    element: { ...baseRequest, headers: { 'x-api-key': 'abc123' } },
                    resource: { security: securityScheme },
                }));
            });
            it('fails with an invalid security scheme error', () => {
                (0, utils_1.assertLeft)((0, __1.validateSecurity)({ element: { ...baseRequest, headers: {} }, resource: { security: securityScheme } }), res => expect(res).toStrictEqual([
                    {
                        code: 401,
                        tags: [],
                        message: 'Invalid security scheme used',
                        severity: types_1.DiagnosticSeverity.Error,
                    },
                ]));
            });
        });
        describe('when api key is expected to be found in the query', () => {
            const securityScheme = [
                [{ id: faker.random.word(), in: 'query', type: 'apiKey', name: 'key', key: 'sec' }],
            ];
            it('passes the validation', () => {
                (0, utils_1.assertRight)((0, __1.validateSecurity)({
                    element: { ...baseRequest, url: { path: '/', query: { key: 'abc123' } } },
                    resource: { security: securityScheme },
                }));
            });
            it('fails with an invalid security scheme error', () => {
                (0, utils_1.assertLeft)((0, __1.validateSecurity)({ element: baseRequest, resource: { security: securityScheme } }), res => expect(res).toStrictEqual([
                    {
                        code: 401,
                        tags: [],
                        message: 'Invalid security scheme used',
                        severity: types_1.DiagnosticSeverity.Error,
                    },
                ]));
            });
        });
        describe('when api key is expected to be found in a cookie', () => {
            const securityScheme = [
                [{ id: faker.random.word(), in: 'cookie', type: 'apiKey', name: 'key', key: 'sec' }],
            ];
            it('passes the validation', () => {
                (0, utils_1.assertRight)((0, __1.validateSecurity)({
                    element: { ...baseRequest, headers: { cookie: 'key=abc123' } },
                    resource: { security: securityScheme },
                }));
            });
            it('fails with an invalid security scheme error', () => {
                (0, utils_1.assertLeft)((0, __1.validateSecurity)({ element: baseRequest, resource: { security: securityScheme } }), res => expect(res).toStrictEqual([
                    {
                        code: 401,
                        tags: [],
                        message: 'Invalid security scheme used',
                        severity: types_1.DiagnosticSeverity.Error,
                    },
                ]));
            });
        });
    });
    describe('OR relation between security schemes', () => {
        const securityScheme = [
            [{ id: faker.random.word(), scheme: 'bearer', type: 'http', key: 'sec' }],
            [{ id: faker.random.word(), scheme: 'basic', type: 'http', key: 'sec' }],
        ];
        it('fails with an invalid security scheme error', () => {
            (0, utils_1.assertLeft)((0, __1.validateSecurity)({
                element: baseRequest,
                resource: {
                    security: securityScheme,
                },
            }), res => expect(res).toStrictEqual([
                {
                    code: 401,
                    message: 'Invalid security scheme used',
                    severity: types_1.DiagnosticSeverity.Error,
                    tags: ['Bearer', 'Basic realm="*"'],
                },
            ]));
        });
        it('passes the validation', () => {
            (0, utils_1.assertRight)((0, __1.validateSecurity)({
                element: { ...baseRequest, headers: { authorization: 'Bearer abc123' } },
                resource: {
                    security: securityScheme,
                },
            }));
        });
        it('passes the validation', () => {
            (0, utils_1.assertRight)((0, __1.validateSecurity)({
                element: { ...baseRequest, headers: { authorization: `Basic ${token}` } },
                resource: {
                    security: securityScheme,
                },
            }));
        });
    });
    describe('AND relation between security schemes', () => {
        const headerScheme = {
            id: faker.random.word(),
            in: 'header',
            type: 'apiKey',
            name: 'x-api-key',
            key: 'sec',
        };
        describe('when 2 different security schemes are expected', () => {
            describe('expecting oauth + apikey', () => {
                const securityScheme = [
                    [headerScheme, { id: faker.random.word(), type: 'oauth2', flows: {}, key: 'sec' }],
                ];
                it('fails with an invalid security scheme error', () => {
                    (0, utils_1.assertLeft)((0, __1.validateSecurity)({
                        element: { ...baseRequest, headers: { 'x-api-key': 'abc123' } },
                        resource: {
                            security: securityScheme,
                        },
                    }), res => expect(res).toStrictEqual([
                        {
                            code: 401,
                            message: 'Invalid security scheme used',
                            severity: types_1.DiagnosticSeverity.Error,
                            tags: ['OAuth2'],
                        },
                    ]));
                });
                it('passes the validation', () => {
                    (0, utils_1.assertRight)((0, __1.validateSecurity)({
                        element: { ...baseRequest, headers: { 'x-api-key': 'abc123', authorization: 'Bearer abc123' } },
                        resource: {
                            security: securityScheme,
                        },
                    }));
                });
            });
            describe('expecting openid + apikey', () => {
                const securityScheme = [
                    [
                        headerScheme,
                        { id: faker.random.word(), type: 'openIdConnect', openIdConnectUrl: 'https://google.it', key: 'sec' },
                    ],
                ];
                it('fails with an invalid security scheme error', () => {
                    (0, utils_1.assertLeft)((0, __1.validateSecurity)({
                        element: { ...baseRequest, headers: { 'x-api-key': 'abc123' } },
                        resource: {
                            security: securityScheme,
                        },
                    }), res => expect(res).toStrictEqual([
                        {
                            code: 401,
                            message: 'Invalid security scheme used',
                            severity: types_1.DiagnosticSeverity.Error,
                            tags: ['OpenID'],
                        },
                    ]));
                });
                it('passes the validation', () => {
                    (0, utils_1.assertRight)((0, __1.validateSecurity)({
                        element: { ...baseRequest, headers: { 'x-api-key': 'abc123', authorization: 'Bearer abc123' } },
                        resource: {
                            security: securityScheme,
                        },
                    }));
                });
            });
        });
        describe('when security scheme expects two keys', () => {
            const securityScheme = [
                [
                    headerScheme,
                    {
                        id: faker.random.word(),
                        in: 'query',
                        type: 'apiKey',
                        name: 'apiKey',
                        key: 'sec',
                    },
                ],
            ];
            it('fails with an invalid security scheme error', () => {
                (0, utils_1.assertLeft)((0, __1.validateSecurity)({
                    element: { ...baseRequest, headers: { 'x-api-key': 'abc123' } },
                    resource: {
                        security: securityScheme,
                    },
                }), res => expect(res).toStrictEqual([
                    {
                        code: 401,
                        message: 'Invalid security scheme used',
                        severity: types_1.DiagnosticSeverity.Error,
                        tags: [],
                    },
                ]));
            });
            it('passes the validation', () => {
                (0, utils_1.assertRight)((0, __1.validateSecurity)({
                    element: {
                        ...baseRequest,
                        headers: { 'x-api-key': 'abc123' },
                        url: { path: '/', query: { apiKey: 'abc123' } },
                    },
                    resource: {
                        security: securityScheme,
                    },
                }));
            });
        });
    });
});
