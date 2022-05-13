"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simple_1 = require("../simple");
const createObjectFromKeyValListModule = require("../utils");
describe('deserialize()', () => {
    describe('type is a primitive', () => {
        it('returns unmodified value', () => {
            expect((0, simple_1.deserializeSimpleStyle)('name', { name: 'value' }, { type: 'string' }, false)).toEqual('value');
        });
    });
    describe('type is an array', () => {
        describe('value is empty', () => {
            it('returns empty array', () => {
                expect((0, simple_1.deserializeSimpleStyle)('name', { name: '' }, { type: 'array' }, false)).toEqual([]);
            });
        });
        describe('value is comma separated', () => {
            it('returns exploded array', () => {
                expect((0, simple_1.deserializeSimpleStyle)('name', { name: 'a,b,c' }, { type: 'array' }, false)).toEqual(['a', 'b', 'c']);
            });
        });
        it('returns unmodified value', () => {
            expect((0, simple_1.deserializeSimpleStyle)('name', { name: 'value' }, { type: 'string' }, false)).toEqual('value');
        });
    });
    describe('type is an object', () => {
        describe('explode is not set', () => {
            it('splits by comma and returns object', () => {
                jest.spyOn(createObjectFromKeyValListModule, 'createObjectFromKeyValList').mockImplementationOnce(list => {
                    expect(list).toEqual(['a', 'b', 'c', 'd']);
                    return { a: 'b', c: 'd' };
                });
                expect((0, simple_1.deserializeSimpleStyle)('name', { name: 'a,b,c,d' }, { type: 'object' }, false)).toEqual({
                    a: 'b',
                    c: 'd',
                });
                expect(createObjectFromKeyValListModule.createObjectFromKeyValList).toHaveBeenCalled();
            });
        });
        describe('explode is set', () => {
            it('splits by comma and equality sign and returns object', () => {
                expect((0, simple_1.deserializeSimpleStyle)('name', { name: 'a=b,c=d' }, { type: 'object' }, true)).toEqual({
                    a: 'b',
                    c: 'd',
                });
            });
        });
    });
});
