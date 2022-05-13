"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const faker = require("faker/locale/en");
const utils_1 = require("@stoplight/prism-core/src/__tests__/utils");
const Either_1 = require("fp-ts/Either");
const __1 = require("../../");
const errors_1 = require("../errors");
const index_1 = require("../index");
const utils_2 = require("./utils");
function createResource(method, path, servers) {
    return {
        id: faker.datatype.uuid(),
        method,
        path,
        responses: [{ id: faker.random.word(), code: '200' }],
        servers,
        security: [],
        request: { path: [], query: [], cookie: [], headers: [] },
    };
}
describe('http router', () => {
    describe('route()', () => {
        test('should not match if no server defined', () => {
            const method = (0, utils_2.pickOneHttpMethod)();
            const path = (0, utils_2.randomPath)();
            (0, utils_1.assertLeft)((0, index_1.default)({
                resources: [createResource(method, path, [])],
                input: {
                    method,
                    url: {
                        baseUrl: 'http://some.url/',
                        path,
                    },
                },
            }), error => expect(error).toEqual(__1.ProblemJsonError.fromTemplate(errors_1.NO_SERVER_CONFIGURATION_PROVIDED_ERROR)));
        });
        test('should not match if no resources given', () => {
            (0, utils_1.assertLeft)((0, index_1.default)({
                resources: [],
                input: {
                    method: (0, utils_2.pickOneHttpMethod)(),
                    url: {
                        baseUrl: '/',
                        path: '/',
                    },
                },
            }), error => expect(error).toEqual(__1.ProblemJsonError.fromTemplate(errors_1.NO_RESOURCE_PROVIDED_ERROR)));
        });
        describe('given a resource', () => {
            test('should match even if no server defined', () => {
                const method = (0, utils_2.pickOneHttpMethod)();
                const path = (0, utils_2.randomPath)();
                return expect((0, Either_1.isRight)((0, index_1.default)({
                    resources: [createResource(method, path, [])],
                    input: {
                        method,
                        url: {
                            baseUrl: '',
                            path,
                        },
                    },
                }))).toBeTruthy();
            });
            test('given a concrete matching server and unmatched methods should not match', () => {
                const url = faker.internet.url();
                const [resourceMethod, requestMethod] = (0, utils_2.pickSetOfHttpMethods)(2);
                (0, utils_1.assertLeft)((0, index_1.default)({
                    resources: [
                        createResource(resourceMethod, (0, utils_2.randomPath)(), [
                            {
                                id: faker.random.word(),
                                url,
                            },
                        ]),
                    ],
                    input: {
                        method: requestMethod,
                        url: {
                            baseUrl: url,
                            path: '/',
                        },
                    },
                }), error => expect(error).toEqual(__1.ProblemJsonError.fromTemplate(errors_1.NO_PATH_MATCHED_ERROR)));
            });
            describe('given matched methods', () => {
                const method = (0, utils_2.pickOneHttpMethod)();
                test('given a concrete matching server unmatched path should not match', () => {
                    const url = faker.internet.url();
                    const path = (0, utils_2.randomPath)({ trailingSlash: false });
                    (0, utils_1.assertLeft)((0, index_1.default)({
                        resources: [
                            createResource(method, path, [
                                {
                                    id: faker.random.word(),
                                    url,
                                },
                            ]),
                        ],
                        input: {
                            method,
                            url: {
                                baseUrl: url,
                                path: `${path}${(0, utils_2.randomPath)()}`,
                            },
                        },
                    }), error => expect(error).toEqual(__1.ProblemJsonError.fromTemplate(errors_1.NO_PATH_MATCHED_ERROR)));
                });
                test('given a concrete matching server and matched concrete path should match', () => {
                    const url = faker.internet.url();
                    const path = (0, utils_2.randomPath)({ includeTemplates: false });
                    const expectedResource = createResource(method, path, [
                        {
                            id: faker.random.word(),
                            url,
                        },
                    ]);
                    (0, utils_1.assertRight)((0, index_1.default)({
                        resources: [expectedResource],
                        input: {
                            method,
                            url: {
                                baseUrl: url,
                                path,
                            },
                        },
                    }), resource => expect(resource).toBe(expectedResource));
                });
                describe('given two resources with different servers when routing to third server with path matching of one of the resources', () => {
                    it('throws an error', () => (0, utils_1.assertLeft)((0, index_1.default)({
                        resources: [
                            createResource(method, '/pet', [{ id: faker.random.word(), url: 'http://example.com/api' }]),
                            createResource(method, '/owner', [{ id: faker.random.word(), url: 'http://stg.example.com/api/v2' }]),
                        ],
                        input: {
                            method,
                            url: {
                                baseUrl: 'http://oopsy.com',
                                path: '/owner',
                            },
                        },
                    }), error => expect(error).toEqual(__1.ProblemJsonError.fromTemplate(errors_1.NO_SERVER_MATCHED_ERROR))));
                });
                test('given a templated matching server and matched concrete path should match', () => {
                    const url = 'http://{host}/v1';
                    const path = (0, utils_2.randomPath)({ includeTemplates: false });
                    const expectedResource = createResource(method, path, [
                        {
                            id: faker.random.word(),
                            url,
                            variables: {
                                host: {
                                    default: 'stoplight.io',
                                },
                            },
                        },
                    ]);
                    (0, utils_1.assertRight)((0, index_1.default)({
                        resources: [expectedResource],
                        input: {
                            method,
                            url: {
                                baseUrl: 'http://stoplight.io/v1',
                                path,
                            },
                        },
                    }), resource => expect(resource).toBe(expectedResource));
                });
                test('given a templated matching server and matched templated path should match', () => {
                    const url = 'http://{host}/v1';
                    const path = '/{x}/b';
                    const expectedResource = createResource(method, path, [
                        {
                            id: faker.random.word(),
                            url,
                            variables: {
                                host: {
                                    default: 'stoplight.io',
                                },
                            },
                        },
                    ]);
                    (0, utils_1.assertRight)((0, index_1.default)({
                        resources: [expectedResource],
                        input: {
                            method,
                            url: {
                                baseUrl: 'http://stoplight.io/v1',
                                path: '/a/b',
                            },
                        },
                    }), resource => expect(resource).toBe(expectedResource));
                });
                test('given a concrete matching server and matched templated path should match', () => {
                    const url = faker.internet.url();
                    const templatedPath = '/a/{b}/c';
                    const requestPath = '/a/x/c';
                    const expectedResource = createResource(method, templatedPath, [
                        {
                            id: faker.random.word(),
                            url,
                        },
                    ]);
                    (0, utils_1.assertRight)((0, index_1.default)({
                        resources: [expectedResource],
                        input: {
                            method,
                            url: {
                                baseUrl: url,
                                path: requestPath,
                            },
                        },
                    }), resource => expect(resource).toBe(expectedResource));
                });
                test('given a concrete matching server and unmatched templated path should not match', () => {
                    const url = faker.internet.url();
                    const templatedPath = '/a/{x}/c';
                    const requestPath = '/a/y/b';
                    const expectedResource = createResource(method, templatedPath, [
                        {
                            id: faker.random.word(),
                            url,
                        },
                    ]);
                    (0, utils_1.assertLeft)((0, index_1.default)({
                        resources: [expectedResource],
                        input: {
                            method,
                            url: {
                                baseUrl: url,
                                path: requestPath,
                            },
                        },
                    }), error => expect(error).toEqual(__1.ProblemJsonError.fromTemplate(errors_1.NO_PATH_MATCHED_ERROR)));
                });
                test('given a concrete servers and mixed paths should match concrete path', () => {
                    const templatedPath = '/{x}/y';
                    const concretePath = '/a/y';
                    const url = 'concrete.com';
                    const resourceWithConcretePath = createResource(method, concretePath, [{ id: faker.random.word(), url }]);
                    const resourceWithTemplatedPath = createResource(method, templatedPath, [{ id: faker.random.word(), url }]);
                    (0, utils_1.assertRight)((0, index_1.default)({
                        resources: [resourceWithTemplatedPath, resourceWithConcretePath],
                        input: {
                            method,
                            url: {
                                baseUrl: url,
                                path: concretePath,
                            },
                        },
                    }), resource => expect(resource).toBe(resourceWithConcretePath));
                });
                test('given a concrete servers and templated paths should match first resource', () => {
                    const templatedPathA = '/{x}/y';
                    const templatedPathB = '/a/{z}';
                    const url = 'concrete.com';
                    const firstResource = createResource(method, templatedPathA, [{ id: faker.random.word(), url }]);
                    const secondResource = createResource(method, templatedPathB, [{ id: faker.random.word(), url }]);
                    (0, utils_1.assertRight)((0, index_1.default)({
                        resources: [firstResource, secondResource],
                        input: {
                            method,
                            url: {
                                baseUrl: url,
                                path: '/a/y',
                            },
                        },
                    }), resource => expect(resource).toBe(firstResource));
                });
                test('given a concrete server and templated server should match concrete', () => {
                    const path = '/';
                    const url = 'concrete.com';
                    const resourceWithConcreteMatch = createResource(method, path, [
                        { id: faker.random.word(), url },
                        { id: faker.random.word(), url: '{template}', variables: { template: { default: url, enum: [url] } } },
                    ]);
                    const resourceWithTemplatedMatch = createResource(method, path, [
                        { id: faker.random.word(), url: '{template}', variables: { template: { default: url, enum: [url] } } },
                    ]);
                    (0, utils_1.assertRight)((0, index_1.default)({
                        resources: [resourceWithConcreteMatch, resourceWithTemplatedMatch],
                        input: {
                            method,
                            url: {
                                baseUrl: url,
                                path,
                            },
                        },
                    }), resource => expect(resource).toBe(resourceWithConcreteMatch));
                });
                test('given concrete servers should match by path', () => {
                    const matchingPath = '/a/b/c';
                    const nonMatchingPath = '/a/b/c/d';
                    const url = 'concrete.com';
                    const resourceWithMatchingPath = createResource(method, matchingPath, [{ id: faker.random.word(), url }]);
                    const resourceWithNonMatchingPath = createResource(method, nonMatchingPath, [
                        { id: faker.random.word(), url },
                    ]);
                    (0, utils_1.assertRight)((0, index_1.default)({
                        resources: [resourceWithNonMatchingPath, resourceWithMatchingPath],
                        input: {
                            method,
                            url: {
                                baseUrl: url,
                                path: matchingPath,
                            },
                        },
                    }), resource => expect(resource).toBe(resourceWithMatchingPath));
                });
                test('given empty baseUrl and concrete server it should match', () => {
                    const path = (0, utils_2.randomPath)({ includeTemplates: false });
                    const url = 'concrete.com';
                    const expectedResource = createResource(method, path, [{ id: faker.random.word(), url }]);
                    (0, utils_1.assertRight)((0, index_1.default)({
                        resources: [expectedResource],
                        input: {
                            method,
                            url: {
                                baseUrl: '',
                                path,
                            },
                        },
                    }), resource => expect(resource).toBe(expectedResource));
                });
                test('given baseUrl and concrete server and non-existing request baseUrl it should not match', () => {
                    const path = (0, utils_2.randomPath)({ includeTemplates: false });
                    const url = 'concrete.com';
                    (0, utils_1.assertLeft)((0, index_1.default)({
                        resources: [createResource(method, path, [{ id: faker.random.word(), url }])],
                        input: {
                            method,
                            url: {
                                baseUrl: 'solid.com',
                                path,
                            },
                        },
                    }), error => expect(error).toEqual(__1.ProblemJsonError.fromTemplate(errors_1.NO_SERVER_MATCHED_ERROR)));
                });
                test('given empty baseUrl and empty server url it should match', () => {
                    const path = (0, utils_2.randomPath)({ includeTemplates: false });
                    const url = '';
                    const expectedResource = createResource(method, path, [{ id: faker.random.word(), url }]);
                    (0, utils_1.assertRight)((0, index_1.default)({
                        resources: [expectedResource],
                        input: {
                            method,
                            url: {
                                baseUrl: '',
                                path,
                            },
                        },
                    }), resource => expect(resource).toBe(expectedResource));
                });
                test('given no baseUrl and a server url it should ignore servers and match by path', () => {
                    const path = (0, utils_2.randomPath)({ includeTemplates: false });
                    const expectedResource = createResource(method, path, [
                        { id: faker.random.word(), url: 'www.stoplight.io/v1' },
                    ]);
                    (0, utils_1.assertRight)((0, index_1.default)({
                        resources: [expectedResource],
                        input: {
                            method,
                            url: {
                                path,
                            },
                        },
                    }), resource => expect(resource).toBe(expectedResource));
                });
                test('given two methods, no baseUrl, a matching path and method it should match by path', () => {
                    const path = (0, utils_2.randomPath)({ includeTemplates: false });
                    const alternativeMethod = (0, utils_2.pickOneHttpMethod)();
                    const resources = [createResource(method, path, []), createResource(alternativeMethod, path, [])];
                    (0, utils_1.assertRight)((0, index_1.default)({
                        resources,
                        input: {
                            method: alternativeMethod,
                            url: {
                                path,
                            },
                        },
                    }), resource => expect(resource.method).toBe(alternativeMethod));
                });
                test('given encoded path should match to not encoded path', () => {
                    const method = (0, utils_2.pickOneHttpMethod)();
                    const url = faker.internet.url();
                    const path = (0, utils_2.randomPath)({ includeTemplates: false, includeSpaces: true });
                    const expectedResource = createResource(method, path, [
                        {
                            id: faker.random.word(),
                            url,
                        },
                    ]);
                    (0, utils_1.assertRight)((0, index_1.default)({
                        resources: [expectedResource],
                        input: {
                            method,
                            url: {
                                baseUrl: url,
                                path: encodeURI(path),
                            },
                        },
                    }), resource => expect(resource).toBe(expectedResource));
                });
                describe('given a concrete and a templated path', () => {
                    const path = '/test/fixed';
                    const templatedPath = '/test/{userId}';
                    const resources = [createResource(method, templatedPath, []), createResource(method, path, [])];
                    it('should prefer the concrete path when the concrete is asked', () => {
                        (0, utils_1.assertRight)((0, index_1.default)({
                            resources,
                            input: {
                                method,
                                url: {
                                    path: path,
                                },
                            },
                        }), resource => expect(resource).toBe(resources[1]));
                    });
                });
            });
            test('should not match when the method does not exist', () => {
                const method = 'get';
                const path = (0, utils_2.randomPath)({ includeTemplates: false });
                const url = 'concrete.com';
                (0, utils_1.assertLeft)((0, index_1.default)({
                    resources: [createResource(method, path, [{ id: faker.random.word(), url }])],
                    input: {
                        method: 'post',
                        url: {
                            baseUrl: url,
                            path,
                        },
                    },
                }), error => expect(error).toEqual(__1.ProblemJsonError.fromTemplate(errors_1.NO_METHOD_MATCHED_ERROR)));
            });
        });
    });
});
