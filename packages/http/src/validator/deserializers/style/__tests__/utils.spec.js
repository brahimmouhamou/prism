"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
describe('createObjectFromKeyValList()', () => {
    it('works', () => {
        expect((0, utils_1.createObjectFromKeyValList)(['a', 'b', 'c', 'd'])).toEqual({ a: 'b', c: 'd' });
    });
});
