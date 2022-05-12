"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStatic = exports.sortSchemaAlphabetically = exports.generate = void 0;
const faker = require("faker");
const lodash_1 = require("lodash");
const jsf = require("json-schema-faker");
const sampler = require("@stoplight/json-schema-sampler");
const Either_1 = require("fp-ts/Either");
const function_1 = require("fp-ts/function");
const E = require("fp-ts/lib/Either");
const filterRequiredProperties_1 = require("../../utils/filterRequiredProperties");
jsf.extend('faker', () => faker);
jsf.option({
    failOnInvalidTypes: false,
    failOnInvalidFormat: false,
    alwaysFakeOptionals: true,
    optionalsProbability: 1,
    fixedProbabilities: true,
    ignoreMissingRefs: true,
    maxItems: 20,
    maxLength: 100,
});
function generate(bundle, source) {
    return function_1.pipe(filterRequiredProperties_1.stripWriteOnlyProperties(source), E.fromOption(() => Error('Cannot strip writeOnly properties')), E.chain(updatedSource => Either_1.tryCatch(() => sortSchemaAlphabetically(jsf.generate({ ...lodash_1.cloneDeep(updatedSource), __bundled__: bundle })), Either_1.toError)));
}
exports.generate = generate;
function sortSchemaAlphabetically(source) {
    if (source && Array.isArray(source)) {
        for (const i of source) {
            if (typeof source[i] === 'object') {
                source[i] = sortSchemaAlphabetically(source[i]);
            }
        }
        return source;
    }
    else if (source && typeof source === 'object') {
        Object.keys(source).forEach((key) => {
            if (typeof source[key] === 'object') {
                source[key] = sortSchemaAlphabetically(source[key]);
            }
        });
        return Object.fromEntries(Object.entries(source).sort());
    }
    return source;
}
exports.sortSchemaAlphabetically = sortSchemaAlphabetically;
function generateStatic(resource, source) {
    return Either_1.tryCatch(() => sampler.sample(source, {}, resource), Either_1.toError);
}
exports.generateStatic = generateStatic;
