"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@stoplight/types");
const body_1 = require("../body");
const utils_1 = require("@stoplight/prism-core/src/__tests__/utils");
const types_2 = require("../types");
const faker = require("faker/locale/en");
describe('validate()', () => {
    describe('content specs are missing', () => {
        it('returns no validation errors', () => {
            (0, utils_1.assertRight)((0, body_1.validate)('test', [], types_2.ValidationContext.Input));
        });
    });
    describe('request media type is not provided', () => {
        it('returns no validation errors', () => {
            (0, utils_1.assertRight)((0, body_1.validate)('test', [{ id: faker.random.word(), mediaType: 'application/not-exists-son', examples: [], encodings: [] }], types_2.ValidationContext.Input));
        });
    });
    describe('request media type was not found in spec', () => {
        it('returns no validation errors', () => {
            (0, utils_1.assertRight)((0, body_1.validate)('test', [{ id: faker.random.word(), mediaType: 'application/not-exists-son', examples: [], encodings: [] }], types_2.ValidationContext.Input, 'application/json'));
        });
    });
    describe('body schema is provided', () => {
        it('return validation errors', () => {
            const mockSchema = { type: 'number' };
            (0, utils_1.assertLeft)((0, body_1.validate)('test', [{ id: faker.random.word(), mediaType: 'application/json', schema: mockSchema, examples: [], encodings: [] }], types_2.ValidationContext.Input, 'application/json'), error => expect(error).toContainEqual(expect.objectContaining({ code: 'type', message: 'must be number' })));
        });
    });
    describe('body is form-urlencoded with deep object style', () => {
        it('returns no validation errors', () => {
            (0, utils_1.assertRight)((0, body_1.validate)(encodeURI('key[a]=str'), [
                {
                    id: faker.random.word(),
                    mediaType: 'application/x-www-form-urlencoded',
                    encodings: [{ property: 'key', style: types_1.HttpParamStyles.DeepObject }],
                    schema: {
                        type: 'object',
                        properties: {
                            key: {
                                type: 'object',
                                properties: { a: { type: 'string' } },
                                required: ['a'],
                            },
                        },
                        required: ['key'],
                    },
                },
            ], types_2.ValidationContext.Input, 'application/x-www-form-urlencoded'));
        });
    });
    describe('body is form-urlencoded with deep object style and is not compatible with schema', () => {
        it('returns validation errors', () => {
            (0, utils_1.assertLeft)((0, body_1.validate)(encodeURI('key[a][ab]=str'), [
                {
                    id: faker.random.word(),
                    mediaType: 'application/x-www-form-urlencoded',
                    encodings: [{ property: 'key', style: types_1.HttpParamStyles.DeepObject }],
                    schema: {
                        type: 'object',
                        properties: {
                            key: {
                                type: 'object',
                                properties: {
                                    a: {
                                        type: 'object',
                                        properties: { aa: { type: 'string' } },
                                        required: ['aa'],
                                    },
                                },
                                required: ['a'],
                            },
                        },
                        required: ['key'],
                    },
                },
            ], types_2.ValidationContext.Input, 'application/x-www-form-urlencoded'), error => expect(error).toContainEqual(expect.objectContaining({
                code: 'required',
                message: "must have required property 'aa'",
            })));
        });
    });
    describe('readOnly writeOnly parameters', () => {
        const specs = [
            {
                id: faker.random.word(),
                mediaType: 'application/json',
                schema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                        },
                        description: {
                            type: 'string',
                            writeOnly: true,
                        },
                        title: {
                            type: 'string',
                            readOnly: true,
                        },
                    },
                    required: ['name', 'description', 'title'],
                },
            },
        ];
        it('requires writeOnly params from input', () => {
            (0, utils_1.assertLeft)((0, body_1.validate)({ name: 'Item One' }, specs, types_2.ValidationContext.Input, 'application/json'), error => {
                expect(error[0].message).toEqual("must have required property 'description'");
            });
        });
        it('succeed when writeOnly params are provided', () => {
            (0, utils_1.assertRight)((0, body_1.validate)({ name: 'Item One', description: 'some description' }, specs, types_2.ValidationContext.Input, 'application/json'));
        });
        it('requires readOnly params from output', () => {
            (0, utils_1.assertLeft)((0, body_1.validate)({ name: 'Item One' }, specs, types_2.ValidationContext.Output, 'application/json'), error => {
                expect(error[0].message).toEqual("must have required property 'title'");
            });
        });
        it('succeed when readOnly params are provided', () => {
            (0, utils_1.assertRight)((0, body_1.validate)({ name: 'Item One', title: 'title' }, specs, types_2.ValidationContext.Output, 'application/json'));
        });
    });
    describe('merge allOf', () => {
        it('nested below top-level', () => {
            const schemas = [
                {
                    id: faker.random.word(),
                    mediaType: 'application/json',
                    schema: {
                        type: 'object',
                        required: ['level1'],
                        properties: {
                            level1: {
                                type: 'object',
                                required: ['level2'],
                                properties: {
                                    level2: {
                                        allOf: [{ description: 'a description' }, { type: 'string' }],
                                    },
                                },
                            },
                        },
                    },
                },
            ];
            const actual = (0, body_1.validate)({ level1: { level2: 'abc' } }, schemas, types_2.ValidationContext.Output, 'application/json');
            (0, utils_1.assertRight)(actual);
        });
        it('does NOT require writeOnly params in output', () => {
            const schemas = [
                {
                    id: faker.random.word(),
                    mediaType: 'application/json',
                    schema: {
                        type: 'object',
                        required: ['name', 'writeOnlyProperty'],
                        properties: {
                            name: {
                                type: 'string',
                            },
                            writeOnlyProperty: {
                                allOf: [{ writeOnly: true }, { type: 'string' }],
                            },
                        },
                    },
                },
            ];
            const actual = (0, body_1.validate)({ name: 'Ann' }, schemas, types_2.ValidationContext.Output, 'application/json');
            (0, utils_1.assertRight)(actual);
        });
        it('does NOT require readOnly params in input', () => {
            const schemas = [
                {
                    id: faker.random.word(),
                    mediaType: 'application/json',
                    schema: {
                        type: 'object',
                        required: ['name', 'readOnlyProperty'],
                        properties: {
                            name: {
                                type: 'string',
                            },
                            readOnlyProperty: {
                                allOf: [{ readOnly: true }, { type: 'string' }],
                            },
                        },
                    },
                },
            ];
            const actual = (0, body_1.validate)({ name: 'Ann' }, schemas, types_2.ValidationContext.Input, 'application/json');
            (0, utils_1.assertRight)(actual);
        });
    });
});
describe('findContentByMediaTypeOrFirst()', () => {
    describe('when a spec has a content type', () => {
        const content = {
            id: faker.random.word(),
            mediaType: 'application/x-www-form-urlencoded',
        };
        describe('and I request for the content type with the charset', () => {
            const foundContent = (0, body_1.findContentByMediaTypeOrFirst)([content], 'application/x-www-form-urlencoded; charset=UTF-8');
            it('should return the generic content', () => (0, utils_1.assertSome)(foundContent));
        });
    });
});
