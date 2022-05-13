"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@stoplight/types");
const path_1 = require("../path");
const validateAgainstSchemaModule = require("../utils");
const utils_1 = require("@stoplight/prism-core/src/__tests__/utils");
const O = require("fp-ts/Option");
const faker = require("faker/locale/en");
describe('validate()', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(validateAgainstSchemaModule, 'validateAgainstSchema');
    });
    describe('spec is present', () => {
        describe('path param is not present', () => {
            describe('spec defines it as required', () => {
                it('returns validation error', () => {
                    (0, utils_1.assertLeft)((0, path_1.validate)({}, [{ id: faker.random.word(), name: 'aParam', style: types_1.HttpParamStyles.Simple, required: true }]), error => expect(error).toEqual([
                        {
                            code: 'required',
                            message: "must have required property 'aparam'",
                            path: ['path'],
                            severity: 0,
                        },
                    ]));
                });
            });
        });
        describe('path param is present', () => {
            describe('schema is present', () => {
                describe('deserializer is available', () => {
                    describe('path param is valid', () => {
                        it('validates positively against schema', () => {
                            (0, utils_1.assertRight)((0, path_1.validate)({ param: 'abc' }, [
                                {
                                    id: faker.random.word(),
                                    name: 'param',
                                    style: types_1.HttpParamStyles.Simple,
                                    schema: { type: 'string' },
                                },
                            ]));
                            expect(validateAgainstSchemaModule.validateAgainstSchema).toReturnWith(O.none);
                        });
                    });
                });
            });
            describe('schema was not provided', () => {
                it('omits schema validation', () => {
                    (0, utils_1.assertRight)((0, path_1.validate)({ param: 'abc' }, [
                        {
                            id: faker.random.word(),
                            name: 'param',
                            style: types_1.HttpParamStyles.Simple,
                        },
                    ]));
                    expect(validateAgainstSchemaModule.validateAgainstSchema).toReturnWith(O.none);
                });
            });
            describe('deprecated flag is set', () => {
                it('returns deprecation warning', () => {
                    (0, utils_1.assertLeft)((0, path_1.validate)({ param: 'abc' }, [
                        {
                            id: faker.random.word(),
                            name: 'param',
                            deprecated: true,
                            style: types_1.HttpParamStyles.Simple,
                        },
                    ]), error => expect(error).toEqual([
                        {
                            code: 'deprecated',
                            message: 'Path param param is deprecated',
                            path: ['path', 'param'],
                            severity: 1,
                        },
                    ]));
                });
            });
        });
    });
});
