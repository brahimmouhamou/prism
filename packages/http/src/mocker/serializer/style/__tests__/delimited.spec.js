"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const delimited_1 = require("../delimited");
describe('serializeWithPipeDelimitedStyle()', () => {
    describe('explode is not set', () => {
        it('serializes correctly', () => {
            expect((0, delimited_1.serializeWithPipeDelimitedStyle)('a', [1, 2, 3])).toEqual('a=1|2|3');
        });
    });
    describe('explode is set', () => {
        it('serializes correctly', () => {
            expect((0, delimited_1.serializeWithPipeDelimitedStyle)('a', [1, 2, 3], true)).toEqual('a=1&a=2&a=3');
        });
    });
});
describe('serializeWithSpaceDelimitedStyle()', () => {
    describe('explode is not set', () => {
        it('serializes correctly', () => {
            expect((0, delimited_1.serializeWithSpaceDelimitedStyle)('a', [1, 2, 3])).toEqual('a=1 2 3');
        });
    });
    describe('explode is set', () => {
        it('serializes correctly', () => {
            expect((0, delimited_1.serializeWithSpaceDelimitedStyle)('a', [1, 2, 3], true)).toEqual('a=1&a=2&a=3');
        });
    });
});
describe('serializeWithCommaDelimitedStyle()', () => {
    describe('explode is not set', () => {
        it('serializes correctly', () => {
            expect((0, delimited_1.serializeWithCommaDelimitedStyle)('a', [1, 2, 3])).toEqual('a=1,2,3');
        });
    });
    describe('explode is set', () => {
        it('serializes correctly', () => {
            expect((0, delimited_1.serializeWithCommaDelimitedStyle)('a', [1, 2, 3], true)).toEqual('a=1&a=2&a=3');
        });
    });
});
