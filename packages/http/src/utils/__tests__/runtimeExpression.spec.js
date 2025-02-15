"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runtimeExpression_1 = require("../runtimeExpression");
const utils_1 = require("@stoplight/prism-core/src/__tests__/utils");
describe('resolveRuntimeExpression', () => {
    it('resolves $method', () => {
        (0, utils_1.assertSome)((0, runtimeExpression_1.resolveRuntimeExpression)('$method', { method: 'get', url: { path: '' } }, { statusCode: 200 }), value => expect(value).toEqual('get'));
    });
    it.skip('resolves $url', () => {
        (0, utils_1.assertSome)((0, runtimeExpression_1.resolveRuntimeExpression)('$url', { method: 'get', url: { path: '/path/to', query: { a: 'a' } } }, { statusCode: 200 }), value => expect(value).toEqual('/path/to?a=a'));
    });
    it('resolves $statusCode', () => {
        (0, utils_1.assertSome)((0, runtimeExpression_1.resolveRuntimeExpression)('$statusCode', { method: 'get', url: { path: '' } }, { statusCode: 201 }), value => expect(value).toEqual('201'));
    });
    it('returns none if expression is not recognized', () => {
        (0, utils_1.assertNone)((0, runtimeExpression_1.resolveRuntimeExpression)('$unsupported', { method: 'get', url: { path: '' } }, { statusCode: 200 }));
    });
    describe('$request.*', () => {
        it('resolves $request.query.*', () => {
            (0, utils_1.assertSome)((0, runtimeExpression_1.resolveRuntimeExpression)('$request.query.param', { method: 'get', url: { path: '', query: { param: 'test' } } }, { statusCode: 200 }), value => expect(value).toEqual('test'));
        });
        it('resolves $request.header.*', () => {
            (0, utils_1.assertSome)((0, runtimeExpression_1.resolveRuntimeExpression)('$request.header.accept', { method: 'get', headers: { accept: 'oh/no' }, url: { path: '' } }, { statusCode: 200 }), value => expect(value).toEqual('oh/no'));
        });
        it.todo('resolves $request.path.*');
        describe('$request.body', () => {
            it('resolves $request.body#*', () => {
                (0, utils_1.assertSome)((0, runtimeExpression_1.resolveRuntimeExpression)('$request.body#/inner/value', { method: 'get', body: { inner: { value: 'test' } }, url: { path: '' } }, { statusCode: 200 }), value => expect(value).toEqual('test'));
            });
            it('resolves $request.body#* when body is not json', () => {
                (0, utils_1.assertNone)((0, runtimeExpression_1.resolveRuntimeExpression)('$request.body#/inner/value', { method: 'get', body: 'text body', url: { path: '' } }, { statusCode: 200 }));
            });
            it('not resolves $request.body#* when json pointer is invalid', () => {
                (0, utils_1.assertNone)((0, runtimeExpression_1.resolveRuntimeExpression)('$request.body#inner/value', { method: 'get', body: { inner: { value: 'test' } }, url: { path: '' } }, { statusCode: 200 }));
            });
        });
        it('returns none if request part is not recognized', () => {
            (0, utils_1.assertNone)((0, runtimeExpression_1.resolveRuntimeExpression)('$request.unsupported', { method: 'get', url: { path: '' } }, { statusCode: 200 }));
        });
    });
    describe('$response.*', () => {
        it('resolves $response.header.*', () => {
            (0, utils_1.assertSome)((0, runtimeExpression_1.resolveRuntimeExpression)('$response.header.forwarded', { method: 'get', url: { path: '' } }, { statusCode: 200, headers: { forwarded: 'by=prism' } }), value => expect(value).toEqual('by=prism'));
        });
        it('resolves $response.body#*', () => {
            (0, utils_1.assertSome)((0, runtimeExpression_1.resolveRuntimeExpression)('$response.body#/inner/value', { method: 'get', url: { path: '' } }, { statusCode: 200, body: { inner: { value: 'test' } } }), value => expect(value).toEqual('test'));
        });
        it('not resolves response.body#* when json pointer is invalid', () => {
            (0, utils_1.assertNone)((0, runtimeExpression_1.resolveRuntimeExpression)('$response.body#inner/value', { method: 'get', url: { path: '' } }, { statusCode: 200, body: { inner: { value: 'test' } } }));
        });
        it('returns none if response part is not recognized', () => {
            (0, utils_1.assertNone)((0, runtimeExpression_1.resolveRuntimeExpression)('$response.unsupported', { method: 'get', url: { path: '' } }, { statusCode: 200 }));
        });
    });
});
describe('resolveRuntimeExpressions', () => {
    it('resolves when notation is correct', () => {
        expect((0, runtimeExpression_1.resolveRuntimeExpressions)('http://{$request.body#/host}/notify', { method: 'get', body: { host: 'example.com' }, url: { path: '' } }, { statusCode: 200 })).toEqual('http://example.com/notify');
    });
    it('leaves blank when notation is not correct', () => {
        expect((0, runtimeExpression_1.resolveRuntimeExpressions)('http://{$request.body#host}/notify', { method: 'get', body: { host: 'example.com' }, url: { path: '' } }, { statusCode: 200 })).toEqual('http:///notify');
    });
    it('leaves blank when target data does not exists', () => {
        expect((0, runtimeExpression_1.resolveRuntimeExpressions)('http://{$request.body#host}/notify', { method: 'get', body: 'example.com', url: { path: '' } }, { statusCode: 200 })).toEqual('http:///notify');
    });
    it('resolves multiple runtime expressions', () => {
        expect((0, runtimeExpression_1.resolveRuntimeExpressions)('http://{$request.body#/host}/{$method}/{$statusCode}', { method: 'get', body: { host: 'example.com' }, url: { path: '' } }, { statusCode: 200 })).toEqual('http://example.com/get/200');
    });
});
