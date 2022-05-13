"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deepObject_1 = require("../deepObject");
describe('serializeWithDeepObjectStyle()', () => {
    it('handles primitive values', () => {
        expect((0, deepObject_1.serializeWithDeepObjectStyle)('a', 'b')).toEqual('a=b');
    });
    it('handles arrays', () => {
        expect((0, deepObject_1.serializeWithDeepObjectStyle)('a', ['x', 'y', 'z'])).toEqual('a[]=x&a[]=y&a[]=z');
    });
    it('handles simple objects', () => {
        expect((0, deepObject_1.serializeWithDeepObjectStyle)('a', { aa: 1, ab: 2, ac: 3 })).toEqual('a[aa]=1&a[ab]=2&a[ac]=3');
    });
    it('handles nested objects', () => {
        expect((0, deepObject_1.serializeWithDeepObjectStyle)('a', { aa: { aaa: { aaaa: '1' } } })).toEqual('a[aa][aaa][aaaa]=1');
    });
    it('handles null objects', () => {
        expect((0, deepObject_1.serializeWithDeepObjectStyle)('a', { aa: null })).toEqual(null);
    });
    it('handles mixed objects and arrays', () => {
        expect((0, deepObject_1.serializeWithDeepObjectStyle)('a', { aa: { aaa: [{ aaaa: '1' }, { aaaa: '2' }] } })).toEqual('a[aa][aaa][][aaaa]=1&a[aa][aaa][][aaaa]=2');
    });
});
