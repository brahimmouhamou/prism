"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@stoplight/prism-core/src/__tests__/utils");
const spec_1 = require("../spec");
const faker = require("faker/locale/en");
describe('findOperationResponse()', () => {
    describe('when response for given code exists', () => {
        it('returns found response', () => {
            (0, utils_1.assertSome)((0, spec_1.findOperationResponse)([
                { id: faker.random.word(), code: '2XX', contents: [], headers: [] },
                { id: faker.random.word(), code: '20X', contents: [], headers: [] },
                { id: faker.random.word(), code: 'default', contents: [], headers: [] },
                { id: faker.random.word(), code: '1XX', contents: [], headers: [] },
            ], 200), value => expect(value).toEqual({ id: expect.any(String), code: '20X', contents: [], headers: [] }));
        });
    });
    describe('when response for given code does not exists but there is a default response', () => {
        it('returns default response', () => {
            (0, utils_1.assertSome)((0, spec_1.findOperationResponse)([
                { id: faker.random.word(), code: '2XX', contents: [], headers: [] },
                { id: faker.random.word(), code: 'default', contents: [], headers: [] },
                { id: faker.random.word(), code: '1XX', contents: [], headers: [] },
            ], 422), value => expect(value).toEqual({ id: expect.any(String), code: 'default', contents: [], headers: [] }));
        });
    });
    describe('when response for given code does not exists and there is no default response', () => {
        it('returns nothing', () => {
            (0, utils_1.assertNone)((0, spec_1.findOperationResponse)([
                { id: faker.random.word(), code: '2XX', contents: [], headers: [] },
                { id: faker.random.word(), code: '1XX', contents: [], headers: [] },
            ], 500));
        });
    });
});
