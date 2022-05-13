"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@stoplight/types");
const convertAjvErrorsModule = require("../utils");
const utils_1 = require("../utils");
const utils_2 = require("@stoplight/prism-core/src/__tests__/utils");
describe('convertAjvErrors()', () => {
    const errorObjectFixture = {
        instancePath: '/a/b',
        keyword: 'required',
        message: 'c is required',
        schemaPath: '..',
        params: {},
    };
    describe('all fields defined', () => {
        it('converts properly', () => {
            expect((0, utils_1.convertAjvErrors)([errorObjectFixture], types_1.DiagnosticSeverity.Error)).toMatchSnapshot();
        });
    });
    describe('keyword field is missing', () => {
        it('converts properly', () => {
            expect((0, utils_1.convertAjvErrors)([Object.assign({}, errorObjectFixture, { keyword: undefined })], types_1.DiagnosticSeverity.Error)).toMatchSnapshot();
        });
    });
    describe('message field is missing', () => {
        it('converts properly', () => {
            expect((0, utils_1.convertAjvErrors)([Object.assign({}, errorObjectFixture, { message: undefined })], types_1.DiagnosticSeverity.Error)[0]).toHaveProperty('message', '');
        });
    });
});
describe('validateAgainstSchema()', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(convertAjvErrorsModule, 'convertAjvErrors');
    });
    describe('has no validation errors', () => {
        it('returns no validation errors', () => {
            (0, utils_2.assertNone)((0, utils_1.validateAgainstSchema)('test', { type: 'string' }, true, 'pfx'));
            expect(convertAjvErrorsModule.convertAjvErrors).not.toHaveBeenCalled();
        });
    });
    describe('has validation errors', () => {
        it('returns validation errors', () => {
            jest.spyOn(convertAjvErrorsModule, 'convertAjvErrors').mockImplementationOnce(() => [
                {
                    message: 'should be number',
                    code: '10',
                    path: [],
                    severity: types_1.DiagnosticSeverity.Error,
                    summary: 'should be number',
                },
            ]);
            (0, utils_2.assertSome)((0, utils_1.validateAgainstSchema)('test', { type: 'number' }, true, 'pfx'), error => expect(error).toContainEqual(expect.objectContaining({ message: 'should be number' })));
            expect(convertAjvErrorsModule.convertAjvErrors).toHaveBeenCalledWith([
                {
                    instancePath: '',
                    keyword: 'type',
                    message: 'must be number',
                    params: { type: 'number' },
                    schemaPath: '#/type',
                },
            ], types_1.DiagnosticSeverity.Error, 'pfx');
        });
        it('properly returns array based paths when meaningful', () => {
            const numberSchema = {
                type: 'number',
            };
            const rootArraySchema = {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['id'],
                    additionalProperties: false,
                    properties: {
                        id: numberSchema,
                        status: {
                            type: 'string',
                            enum: ['TODO', 'IN_PROGRESS', 'CANCELLED', 'DONE'],
                        },
                    },
                },
            };
            const nestedArraySchema = {
                type: 'object',
                properties: {
                    data: rootArraySchema,
                },
            };
            const evenMoreNestedArraySchema = {
                type: 'object',
                properties: {
                    value: nestedArraySchema,
                },
            };
            (0, utils_2.assertSome)((0, utils_1.validateAgainstSchema)('test', numberSchema, true, 'pfx'), error => {
                expect(error).toEqual([expect.objectContaining({ path: ['pfx'], message: 'must be number' })]);
            });
            const arr = [{ id: 11 }, { status: 'TODO' }];
            (0, utils_2.assertSome)((0, utils_1.validateAgainstSchema)(arr, rootArraySchema, true, 'pfx'), error => {
                expect(error).toEqual([
                    expect.objectContaining({ path: ['pfx', '1'], message: "must have required property 'id'" }),
                ]);
            });
            const obj = { data: arr };
            (0, utils_2.assertSome)((0, utils_1.validateAgainstSchema)(obj, nestedArraySchema, true, 'pfx'), error => {
                expect(error).toEqual([
                    expect.objectContaining({ path: ['pfx', 'data', '1'], message: "must have required property 'id'" }),
                ]);
            });
            const obj2 = { value: { data: arr } };
            (0, utils_2.assertSome)((0, utils_1.validateAgainstSchema)(obj2, evenMoreNestedArraySchema, true, 'pfx'), error => {
                expect(error).toEqual([
                    expect.objectContaining({
                        path: ['pfx', 'value', 'data', '1'],
                        message: "must have required property 'id'",
                    }),
                ]);
            });
            const arr2 = [{ id: [false] }];
            (0, utils_2.assertSome)((0, utils_1.validateAgainstSchema)(arr2, rootArraySchema, true, 'pfx'), error => {
                expect(error).toEqual([expect.objectContaining({ path: ['pfx', '0', 'id'], message: 'must be number' })]);
            });
            const arr3 = [{ id: 11 }, { status: 'TODONT' }];
            (0, utils_2.assertSome)((0, utils_1.validateAgainstSchema)(arr3, rootArraySchema, true, 'pfx'), error => {
                expect(error).toEqual([
                    expect.objectContaining({ path: ['pfx', '1'], message: "must have required property 'id'" }),
                    expect.objectContaining({
                        path: ['pfx', '1', 'status'],
                        message: 'must be equal to one of the allowed values: TODO, IN_PROGRESS, CANCELLED, DONE',
                    }),
                ]);
            });
            const arr4 = [{ id: 11 }, { id: 12, nope: false, neither: true }];
            (0, utils_2.assertSome)((0, utils_1.validateAgainstSchema)(arr4, rootArraySchema, true, 'pfx'), error => {
                expect(error).toEqual([
                    expect.objectContaining({
                        path: ['pfx', '1'],
                        message: "must NOT have additional properties; found 'nope'",
                    }),
                    expect.objectContaining({
                        path: ['pfx', '1'],
                        message: "must NOT have additional properties; found 'neither'",
                    }),
                ]);
            });
        });
    });
    describe('with coercing', () => {
        it('will not return error for convertible values', () => {
            (0, utils_2.assertNone)((0, utils_1.validateAgainstSchema)({ test: 10 }, { type: 'object', properties: { test: { type: 'string' } } }, true));
        });
    });
    describe('with no coercing', () => {
        it('will return error for convertible values', () => {
            (0, utils_2.assertSome)((0, utils_1.validateAgainstSchema)({ test: 10 }, { type: 'object', properties: { test: { type: 'string' } } }, false), error => expect(error).toContainEqual(expect.objectContaining({ message: 'must be string' })));
        });
    });
    describe('does not pollute the console with ajv "unknown format" warnings', () => {
        it.each([true, false])('with coerce = %s', (coerce) => {
            const spy = jest.spyOn(console, 'warn');
            (0, utils_2.assertNone)((0, utils_1.validateAgainstSchema)('test', { type: 'string', format: 'something' }, coerce));
            expect(spy).not.toHaveBeenCalled();
            spy.mockRestore();
        });
    });
});
