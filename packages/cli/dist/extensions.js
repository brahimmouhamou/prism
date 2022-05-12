"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureExtensionsFromSpec = void 0;
const json_schema_ref_parser_1 = require("json-schema-ref-parser");
const json_1 = require("@stoplight/json");
const lodash_1 = require("lodash");
const jsf = require("json-schema-faker");
async function configureExtensionsFromSpec(specFilePathOrObject) {
    const result = json_1.decycle(await json_schema_ref_parser_1.dereference(specFilePathOrObject));
    lodash_1.forOwn(lodash_1.get(result, 'x-json-schema-faker', {}), (value, option) => {
        if (option === 'locale') {
            return jsf.locate('faker').setLocale(value);
        }
        jsf.option(lodash_1.camelCase(option), value);
    });
}
exports.configureExtensionsFromSpec = configureExtensionsFromSpec;
