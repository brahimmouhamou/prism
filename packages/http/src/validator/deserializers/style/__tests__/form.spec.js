"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const form_1 = require("../form");
const createObjectFromKeyValListModule = require("../utils");
describe('deserialize()', () => {
    describe('schema type is a primitive', () => {
        it('returns unmodified value', () => {
            expect((0, form_1.deserializeFormStyle)('key', { key: 'val' }, { type: 'string' })).toEqual('val');
        });
    });
    describe('schema type is an array', () => {
        describe('explode is set', () => {
            describe('query param is an array', () => {
                it('returns unmodified value', () => {
                    expect((0, form_1.deserializeFormStyle)('key', { key: ['val1', 'val2'] }, { type: 'array' }, true)).toEqual([
                        'val1',
                        'val2',
                    ]);
                });
            });
            describe('query param is a value', () => {
                it('returns single-value array', () => {
                    expect((0, form_1.deserializeFormStyle)('key', { key: 'val' }, { type: 'array' }, true)).toEqual(['val']);
                });
            });
        });
        describe('explode is not set', () => {
            describe('query param is an array', () => {
                it('splits last query param value', () => {
                    expect((0, form_1.deserializeFormStyle)('key', { key: ['a,b,c', 'd,e,f'] }, { type: 'array' }, false)).toEqual([
                        'd',
                        'e',
                        'f',
                    ]);
                });
            });
            describe('query param is a value', () => {
                it('splits query param value', () => {
                    expect((0, form_1.deserializeFormStyle)('key', { key: 'a,b,c' }, { type: 'array' }, false)).toEqual(['a', 'b', 'c']);
                });
            });
        });
    });
    describe('schema type is an object', () => {
        describe('explode is set', () => {
            it('returns object', () => {
                expect((0, form_1.deserializeFormStyle)('a', { a: 'b', c: 'd' }, { type: 'object', properties: { a: { type: 'string' } } }, true)).toEqual({ a: 'b' });
            });
            describe('schema properties are missing', () => {
                it('returns empty object', () => {
                    expect((0, form_1.deserializeFormStyle)('-', {}, { type: 'object' }, true)).toBeUndefined();
                });
            });
        });
        describe('explode is not set', () => {
            describe('query param is an array', () => {
                it('splits last query param value into object', () => {
                    jest.spyOn(createObjectFromKeyValListModule, 'createObjectFromKeyValList').mockImplementationOnce(list => {
                        expect(list).toEqual(['a', 'b', 'c', 'd']);
                        return { a: 'b', c: 'd' };
                    });
                    expect((0, form_1.deserializeFormStyle)('key', { key: ['e,f,g,h', 'a,b,c,d'] }, { type: 'object' }, false)).toEqual({
                        a: 'b',
                        c: 'd',
                    });
                    expect(createObjectFromKeyValListModule.createObjectFromKeyValList).toHaveBeenCalled();
                });
            });
            describe('query param is a value', () => {
                it('splits query param value into object', () => {
                    jest.spyOn(createObjectFromKeyValListModule, 'createObjectFromKeyValList').mockImplementationOnce(list => {
                        expect(list).toEqual(['a', 'b', 'c', 'd']);
                        return { a: 'b', c: 'd' };
                    });
                    expect((0, form_1.deserializeFormStyle)('key', { key: 'a,b,c,d' }, { type: 'object' }, false)).toEqual({
                        a: 'b',
                        c: 'd',
                    });
                    expect(createObjectFromKeyValListModule.createObjectFromKeyValList).toHaveBeenCalled();
                });
            });
        });
    });
});
