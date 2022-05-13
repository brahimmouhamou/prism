"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@stoplight/prism-core/src/__tests__/utils");
const HttpParamGenerator_1 = require("../HttpParamGenerator");
const faker = require("faker/locale/en");
describe('HttpParamGenerator', () => {
    describe('generate()', () => {
        describe('example is present', () => {
            it('uses static example', () => {
                (0, utils_1.assertSome)((0, HttpParamGenerator_1.generate)({ id: faker.random.word(), examples: [{ id: faker.random.word(), key: 'foo', value: 'test' }] }), v => expect(v).toEqual('test'));
            });
        });
        describe('schema and example is present', () => {
            it('prefers static example', () => {
                (0, utils_1.assertSome)((0, HttpParamGenerator_1.generate)({
                    id: faker.random.word(),
                    schema: { type: 'string' },
                    examples: [{ id: faker.random.word(), key: 'foo', value: 'test' }],
                }), v => expect(v).toEqual('test'));
            });
        });
        describe('schema is present', () => {
            it('generates example from schema', () => {
                (0, utils_1.assertSome)((0, HttpParamGenerator_1.generate)({ id: faker.random.word(), schema: { type: 'string', format: 'email' } }), v => expect(v).toEqual(expect.stringMatching(/@/)));
            });
        });
        describe('no schema and no examples', () => {
            it('returns none', () => {
                (0, utils_1.assertNone)((0, HttpParamGenerator_1.generate)({ id: faker.random.word() }));
            });
        });
    });
    describe('improveSchema()', () => {
        describe.each(['number', 'integer'])('when feed with a %s', type => {
            const improvedSchema = (0, HttpParamGenerator_1.improveSchema)({ type });
            it('should have a minimum and a maximum', () => {
                expect(improvedSchema).toHaveProperty('minimum', 1);
                expect(improvedSchema).toHaveProperty('maximum', 1000);
            });
        });
        describe('when feed with string', () => {
            describe('no format and no enum', () => {
                const improvedSchema = (0, HttpParamGenerator_1.improveSchema)({ type: 'string' });
                it('should have the x-faker extension', () => {
                    expect(improvedSchema).toHaveProperty('x-faker', 'lorem.word');
                });
            });
            describe.each([
                ['format', { format: 'email' }],
                ['enum', { enum: [1, 2, 3] }],
                ['pattern', { pattern: '^[A-Z]+$' }],
            ])('when with %s', (_a, additional) => {
                const improvedSchema = (0, HttpParamGenerator_1.improveSchema)({ type: 'string', ...additional });
                it('should not have the x-faker extension', () => expect(improvedSchema).not.toHaveProperty('x-faker'));
            });
        });
        describe('when feed with object', () => {
            describe('no format and no enum', () => {
                const improvedSchema = (0, HttpParamGenerator_1.improveSchema)({
                    type: 'object',
                    properties: { a: { type: 'string' }, b: { type: 'number' } },
                });
                it('will recursively improve the schema', () => {
                    expect(improvedSchema).toHaveProperty('properties.a.x-faker', 'lorem.word');
                    expect(improvedSchema).toHaveProperty('properties.b.minimum', 1);
                    expect(improvedSchema).toHaveProperty('properties.b.maximum', 1000);
                });
            });
        });
        describe('when feed with array', () => {
            describe('a tuple and no format and no enum', () => {
                const improvedSchema = (0, HttpParamGenerator_1.improveSchema)({
                    type: 'array',
                    items: [
                        {
                            type: 'object',
                            properties: { a: { type: 'string' } },
                        },
                        {
                            type: 'object',
                            properties: { b: { type: 'string' } },
                        },
                    ],
                });
                it('will recursively improve the schema', () => {
                    expect(improvedSchema).toStrictEqual({
                        type: 'array',
                        items: [
                            {
                                type: 'object',
                                properties: { a: { type: 'string', 'x-faker': 'lorem.word' } },
                            },
                            {
                                type: 'object',
                                properties: { b: { type: 'string', 'x-faker': 'lorem.word' } },
                            },
                        ],
                    });
                });
            });
        });
    });
});
