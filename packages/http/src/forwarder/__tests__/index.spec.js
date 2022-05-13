"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const index_1 = require("../index");
const utils_1 = require("@stoplight/prism-core/src/__tests__/utils");
const lodash_1 = require("lodash");
const resources_1 = require("../resources");
const types_1 = require("@stoplight/types");
jest.mock('node-fetch');
function stubFetch({ json = {}, text = '', headers }) {
    node_fetch_1.default.mockResolvedValue({
        headers: { get: (n) => headers[n], raw: () => (0, lodash_1.mapValues)(headers, (h) => h.split(' ')) },
        json: jest.fn().mockResolvedValue(json),
        text: jest.fn().mockResolvedValue(text),
    });
}
describe('forward', () => {
    const logger = {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
    };
    describe('when POST method with json body', () => {
        it('forwards request to upstream', () => {
            stubFetch({
                headers: { 'content-type': 'application/json' },
            });
            return (0, utils_1.assertResolvesRight)((0, index_1.default)({
                validations: [],
                data: {
                    method: 'post',
                    body: { some: 'data' },
                    url: {
                        path: '/test',
                        query: {
                            x: ['1', 'a'],
                            y: '3',
                        },
                    },
                },
            }, 'http://example.com', undefined)(logger), () => {
                expect(node_fetch_1.default).toHaveBeenCalledWith('http://example.com/test?x=1&x=a&y=3', expect.objectContaining({ method: 'post', body: '{"some":"data"}' }));
            });
        });
    });
    describe('when POST method with circular json body', () => {
        it('will fail and blame you', () => {
            stubFetch({
                headers: { 'content-type': 'application/json' },
            });
            const body = { x: {} };
            body.x = { y: body };
            return (0, utils_1.assertResolvesLeft)((0, index_1.default)({
                validations: [],
                data: {
                    method: 'post',
                    body,
                    url: { path: '/test' },
                },
            }, 'http://example.com', undefined)(logger));
        });
    });
    describe('when POST method with string body', () => {
        it('forwards request to upstream', () => {
            const headers = { 'content-type': 'text/plain' };
            stubFetch({
                headers,
            });
            return (0, utils_1.assertResolvesRight)((0, index_1.default)({
                validations: [],
                data: {
                    method: 'post',
                    body: 'some body',
                    headers,
                    url: { path: '/test' },
                },
            }, 'http://example.com', undefined)(logger), () => {
                expect(node_fetch_1.default).toHaveBeenCalledWith('http://example.com/test', expect.objectContaining({ method: 'post', body: 'some body' }));
            });
        });
    });
    describe('when upstream return hop-by-hop headers', () => {
        it('forwarder strips them all', () => {
            const headers = (0, lodash_1.mapValues)((0, lodash_1.keyBy)(resources_1.hopByHopHeaders), () => 'n/a');
            stubFetch({
                headers,
            });
            return (0, utils_1.assertResolvesRight)((0, index_1.default)({ validations: [], data: { method: 'get', url: { path: '/test' } } }, 'http://example.com', undefined)(logger), r => resources_1.hopByHopHeaders.forEach(hopHeader => {
                var _a;
                expect((_a = r.headers) === null || _a === void 0 ? void 0 : _a[hopHeader]).toBeUndefined();
            }));
        });
    });
    describe('and there are input validation errors', () => {
        it('will refuse to forward and return an error', () => (0, utils_1.assertResolvesLeft)((0, index_1.default)({
            validations: [{ code: 1, message: 'Hello', severity: types_1.DiagnosticSeverity.Error }],
            data: {
                method: 'post',
                url: { path: '/test' },
            },
        }, 'http://example.com', undefined)(logger), e => expect(e).toHaveProperty('status', 422)));
    });
    describe('and operation is marked as deprecated', () => {
        it('will add "Deprecation" header if not present in response', () => {
            stubFetch({
                headers: { 'content-type': 'text/plain' },
            });
            (0, utils_1.assertResolvesRight)((0, index_1.default)({
                validations: [],
                data: {
                    method: 'post',
                    url: { path: '/test' },
                },
            }, 'http://example.com', undefined, {
                deprecated: true,
                method: 'post',
                path: '/test',
                responses: [],
                id: 'test',
            })(logger), e => expect(e.headers).toHaveProperty('deprecation', 'true'));
        });
        it('will omit "Deprecation" header if already defined in response', () => {
            stubFetch({ headers: { 'content-type': 'text/plain', deprecation: 'foo' } });
            (0, utils_1.assertResolvesRight)((0, index_1.default)({
                validations: [],
                data: {
                    method: 'post',
                    url: { path: '/test' },
                },
            }, 'http://example.com', undefined, {
                deprecated: true,
                method: 'post',
                path: '/test',
                responses: [],
                id: 'test',
            })(logger), e => expect(e.headers).toHaveProperty('deprecation', 'foo'));
        });
    });
});
