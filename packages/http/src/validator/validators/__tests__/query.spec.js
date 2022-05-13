"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@stoplight/types");
const query_1 = require("../query");
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
        describe('query param is not present', () => {
            describe('spec defines it as required', () => {
                it('returns validation error', () => {
                    (0, utils_1.assertLeft)((0, query_1.validate)({}, [{ id: faker.random.word(), name: 'aParam', style: types_1.HttpParamStyles.Form, required: true }]), error => expect(error).toContainEqual(expect.objectContaining({ severity: types_1.DiagnosticSeverity.Error })));
                });
            });
        });
        describe('query param is present', () => {
            describe('schema is present', () => {
                describe('deserializer is available', () => {
                    describe('query param is valid', () => {
                        it('validates positively against schema', () => {
                            (0, utils_1.assertRight)((0, query_1.validate)({ param: 'abc' }, [
                                {
                                    id: faker.random.word(),
                                    name: 'param',
                                    style: types_1.HttpParamStyles.Form,
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
                    (0, utils_1.assertRight)((0, query_1.validate)({ param: 'abc' }, [
                        {
                            id: faker.random.word(),
                            name: 'param',
                            style: types_1.HttpParamStyles.Form,
                        },
                    ]));
                    expect(validateAgainstSchemaModule.validateAgainstSchema).toReturnWith(O.none);
                });
            });
            describe('deprecated flag is set', () => {
                it('returns deprecation warning', () => {
                    (0, utils_1.assertLeft)((0, query_1.validate)({ param: 'abc' }, [
                        {
                            id: faker.random.word(),
                            name: 'param',
                            deprecated: true,
                            style: types_1.HttpParamStyles.Form,
                        },
                    ]), error => expect(error).toContainEqual(expect.objectContaining({ severity: types_1.DiagnosticSeverity.Warning })));
                });
            });
        });
    });
});
