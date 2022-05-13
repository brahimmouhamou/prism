"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const JSONSchema_1 = require("../JSONSchema");
const utils_1 = require("@stoplight/prism-core/src/__tests__/utils");
describe('JSONSchema generator', () => {
    const ipRegExp = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
    const emailRegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const uuidRegExp = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/;
    describe('generate()', () => {
        describe('when used with a schema with a simple string property', () => {
            const schema = {
                type: 'object',
                properties: {
                    name: { type: 'string', minLength: 1 },
                },
                required: ['name'],
            };
            it('will have a string property not matching anything in particular', () => {
                (0, utils_1.assertRight)((0, JSONSchema_1.generate)({}, schema), instance => {
                    expect(instance).toHaveProperty('name');
                    const name = (0, lodash_1.get)(instance, 'name');
                    expect(ipRegExp.test(name)).toBeFalsy();
                    expect(emailRegExp.test(name)).toBeFalsy();
                });
            });
        });
        describe('when used with a schema with a string and email as format', () => {
            const schema = {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' },
                },
                required: ['email'],
            };
            it('will have a string property matching the email regex', () => {
                (0, utils_1.assertRight)((0, JSONSchema_1.generate)({}, schema), instance => {
                    expect(instance).toHaveProperty('email');
                    const email = (0, lodash_1.get)(instance, 'email');
                    expect(ipRegExp.test(email)).toBeFalsy();
                    expect(emailRegExp.test(email)).toBeTruthy();
                });
            });
        });
        describe('when used with a schema with a string and uuid as format', () => {
            const schema = {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
                required: ['id'],
            };
            it('will have a string property matching uuid regex', () => {
                (0, utils_1.assertRight)((0, JSONSchema_1.generate)({}, schema), instance => {
                    const id = (0, lodash_1.get)(instance, 'id');
                    expect(id).toMatch(uuidRegExp);
                });
            });
            it('will not be presented in the form of UUID as a URN', () => {
                (0, utils_1.assertRight)((0, JSONSchema_1.generate)({}, schema), instance => {
                    const id = (0, lodash_1.get)(instance, 'id');
                    expect(uuidRegExp.test(id)).not.toContainEqual('urn:uuid');
                });
            });
        });
        describe('when used with a schema with a string property and x-faker property', () => {
            const schema = {
                type: 'object',
                properties: {
                    ip: { type: 'string', format: 'ip', 'x-faker': 'internet.ip' },
                },
                required: ['ip'],
            };
            it('will have a string property matching the ip regex', () => {
                (0, utils_1.assertRight)((0, JSONSchema_1.generate)({}, schema), instance => {
                    expect(instance).toHaveProperty('ip');
                    const ip = (0, lodash_1.get)(instance, 'ip');
                    expect(ipRegExp.test(ip)).toBeTruthy();
                    expect(emailRegExp.test(ip)).toBeFalsy();
                });
            });
        });
        describe('when faker is configured per-property', () => {
            it('with named parameters', () => {
                const schema = {
                    type: 'object',
                    properties: {
                        meaning: {
                            type: 'number',
                            'x-faker': {
                                'random.number': {
                                    min: 42,
                                    max: 42,
                                },
                            },
                        },
                    },
                    required: ['meaning'],
                };
                (0, utils_1.assertRight)((0, JSONSchema_1.generate)({}, schema), instance => {
                    expect(instance).toHaveProperty('meaning');
                    const actual = (0, lodash_1.get)(instance, 'meaning');
                    expect(actual).toStrictEqual(42);
                });
            });
            it('with positional parameters', () => {
                const schema = {
                    type: 'object',
                    properties: {
                        slug: {
                            type: 'string',
                            'x-faker': {
                                'helpers.slugify': ['two words'],
                            },
                        },
                    },
                    required: ['slug'],
                };
                (0, utils_1.assertRight)((0, JSONSchema_1.generate)({}, schema), instance => {
                    expect(instance).toHaveProperty('slug');
                    const actual = (0, lodash_1.get)(instance, 'slug');
                    expect(actual).toStrictEqual('two-words');
                });
            });
        });
        describe('when used with a schema that is not valid', () => {
            const schema = {
                type: 'object',
                properties: {
                    _embedded: {
                        $ref: '#/definitions/supermodelIoAdidasApiHAL',
                    },
                },
            };
            it('will return a left', () => (0, utils_1.assertLeft)((0, JSONSchema_1.generate)({}, schema)));
        });
        describe('when writeOnly properties are provided', () => {
            const schema = {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    title: { type: 'string', writeOnly: true },
                },
                required: ['id', 'title'],
            };
            it('removes writeOnly properties', () => {
                (0, utils_1.assertRight)((0, JSONSchema_1.generate)({}, schema), instance => {
                    expect(instance).toEqual({
                        id: expect.any(String),
                    });
                });
            });
        });
        it('operates on sealed schema objects', () => {
            const schema = {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                },
                required: ['name'],
            };
            Object.defineProperty(schema.properties, 'name', { writable: false });
            return expect((0, JSONSchema_1.generate)({}, schema)).toBeTruthy();
        });
    });
    describe('sortSchemaAlphabetically()', () => {
        it('should handle nulls', () => {
            const source = null;
            expect((0, JSONSchema_1.sortSchemaAlphabetically)(source)).toEqual(null);
        });
        it('should leave source untouched if not array or object', () => {
            const source = 'string';
            expect((0, JSONSchema_1.sortSchemaAlphabetically)(source)).toEqual('string');
        });
        it('should leave source untouched if array of non-objects', () => {
            const source = ['string'];
            expect((0, JSONSchema_1.sortSchemaAlphabetically)(source)).toEqual(['string']);
        });
        it('should alphabetize properties of objects in array', () => {
            const source = ['string', { d: 'd value', a: 'a value', b: 'b value', c: 'c value' }];
            expect((0, JSONSchema_1.sortSchemaAlphabetically)(source)).toEqual([
                'string',
                { a: 'a value', b: 'b value', c: 'c value', d: 'd value' },
            ]);
        });
        it('should alphabetize properties of object', () => {
            const source = { d: 'd value', a: 'a value', b: 'b value', c: 'c value' };
            expect((0, JSONSchema_1.sortSchemaAlphabetically)(source)).toEqual({ a: 'a value', b: 'b value', c: 'c value', d: 'd value' });
        });
        it('should alphabetize properties of nested objects', () => {
            const source = {
                d: { d3: 'd3 value', d1: 'd1 value', d4: 'd4 value', d2: 'd2 value' },
                a: 'a value',
                b: { b2: 'b2 value', b1: 'b1 value', b3: 'b3 value' },
                c: 'c value',
            };
            expect((0, JSONSchema_1.sortSchemaAlphabetically)(source)).toEqual({
                a: 'a value',
                b: { b1: 'b1 value', b2: 'b2 value', b3: 'b3 value' },
                c: 'c value',
                d: { d1: 'd1 value', d2: 'd2 value', d3: 'd3 value', d4: 'd4 value' },
            });
        });
    });
});
