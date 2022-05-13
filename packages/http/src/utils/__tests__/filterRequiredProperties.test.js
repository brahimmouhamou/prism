"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filterRequiredProperties_1 = require("../filterRequiredProperties");
const utils_1 = require("@stoplight/prism-core/src/__tests__/utils");
describe('filterRequiredProperties', () => {
    it('strips writeOnly properties', () => {
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string' },
                description: { type: 'string', writeOnly: true },
                title: { type: 'string', readOnly: true },
            },
            required: ['name', 'description', 'title'],
        };
        (0, utils_1.assertSome)((0, filterRequiredProperties_1.stripWriteOnlyProperties)(schema), schema => {
            expect(schema.required).toEqual(['name', 'title']);
            expect(schema.properties).toEqual({
                name: expect.any(Object),
                title: expect.any(Object),
            });
        });
    });
    it('strips readOnly properties', () => {
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string' },
                description: { type: 'string', writeOnly: true },
                title: { type: 'string', readOnly: true },
            },
            required: ['name', 'description', 'title'],
        };
        (0, utils_1.assertSome)((0, filterRequiredProperties_1.stripReadOnlyProperties)(schema), schema => {
            expect(schema.required).toEqual(['name', 'description']);
            expect(schema.properties).toEqual({
                name: expect.any(Object),
                description: expect.any(Object),
            });
        });
    });
    it('strips nested writeOnly properties', () => {
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string' },
                title: { type: 'string', readOnly: true },
                author: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string' },
                        username: { type: 'string', writeOnly: true },
                    },
                    required: ['userId', 'username'],
                },
            },
            required: ['name', 'title', 'author'],
        };
        (0, utils_1.assertSome)((0, filterRequiredProperties_1.stripWriteOnlyProperties)(schema), schema => {
            expect(schema.required).toEqual(['name', 'title', 'author']);
            expect(schema.properties).toEqual({
                name: expect.any(Object),
                title: expect.any(Object),
                author: expect.objectContaining({
                    properties: {
                        userId: {
                            type: 'string',
                        },
                    },
                    required: ['userId'],
                }),
            });
        });
    });
    it('strips writeOnly properties and leaves boolean properties', () => {
        const schema = {
            type: 'object',
            properties: {
                name: true,
                description: { type: 'string', writeOnly: true },
                title: { type: 'string', readOnly: true },
            },
            required: ['name', 'description', 'title'],
        };
        (0, utils_1.assertSome)((0, filterRequiredProperties_1.stripWriteOnlyProperties)(schema), schema => {
            expect(schema.required).toEqual(['name', 'title']);
            expect(schema.properties).toEqual({
                name: true,
                title: { type: 'string', readOnly: true },
            });
        });
    });
    it('removes required properties that have been filtered', () => {
        const schema = {
            type: 'object',
            properties: {
                title: { type: 'string' },
                description: { type: 'string', writeOnly: true },
                priority: { type: 'number', default: 0 },
            },
            required: ['title', 'description'],
        };
        (0, utils_1.assertSome)((0, filterRequiredProperties_1.stripWriteOnlyProperties)(schema), schema => {
            expect(schema.required).toEqual(['title']);
            expect(schema.properties).toEqual({
                title: { type: 'string' },
                priority: { type: 'number', default: 0 },
            });
        });
    });
});
