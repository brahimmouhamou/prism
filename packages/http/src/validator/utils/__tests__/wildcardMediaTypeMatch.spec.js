"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wildcardMediaTypeMatch_1 = require("../wildcardMediaTypeMatch");
describe('wildcardMediaTypeMatch', () => {
    describe('matches', () => {
        it('exactly the same content types', () => {
            expect((0, wildcardMediaTypeMatch_1.wildcardMediaTypeMatch)('application/json', 'application/json')).toBe(true);
        });
        it.each([
            ['application/vnd1+json', 'application/json'],
            ['application/vnd1+json', 'application/vnd-2+json'],
        ])('with difference in suffix: %s - %s', (a, b) => {
            expect((0, wildcardMediaTypeMatch_1.wildcardMediaTypeMatch)(a, b)).toBe(true);
        });
        it.each([
            ['application/json; p1=1', 'application/json'],
            ['application/json; p1=1', 'application/json; p1=2'],
            ['application/vnd1+json; p1=1', 'application/json; p1=2'],
            ['application/json', 'application/json; p1=2'],
        ])('ignores parameters: %s - %s', (a, b) => {
            expect((0, wildcardMediaTypeMatch_1.wildcardMediaTypeMatch)(a, b)).toBe(true);
        });
    });
    describe('does not match', () => {
        it('with difference in type', () => {
            expect((0, wildcardMediaTypeMatch_1.wildcardMediaTypeMatch)('application/json', 'image/json')).toBe(false);
        });
        it('with difference in subtype', () => {
            expect((0, wildcardMediaTypeMatch_1.wildcardMediaTypeMatch)('application/json', 'application/csv')).toBe(false);
        });
        it('if one of media type is invalid', () => {
            expect((0, wildcardMediaTypeMatch_1.wildcardMediaTypeMatch)('invalid', 'application/csv')).toBe(false);
            expect((0, wildcardMediaTypeMatch_1.wildcardMediaTypeMatch)('application/csv', 'invalid')).toBe(false);
        });
    });
});
