"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.findContentByMediaTypeOrFirst = exports.decodeUriEntities = exports.splitUriParams = exports.deserializeFormBody = void 0;
const types_1 = require("@stoplight/types");
const A = require("fp-ts/Array");
const E = require("fp-ts/Either");
const O = require("fp-ts/Option");
const NEA = require("fp-ts/NonEmptyArray");
const function_1 = require("fp-ts/function");
const lodash_1 = require("lodash");
const type_is_1 = require("type-is");
const deserializers_1 = require("../deserializers");
const utils_1 = require("./utils");
const types_2 = require("./types");
const mergeAllOf = require("@stoplight/json-schema-merge-allof");
const filterRequiredProperties_1 = require("../../utils/filterRequiredProperties");
const wildcardMediaTypeMatch_1 = require("../utils/wildcardMediaTypeMatch");
function deserializeFormBody(schema, encodings, decodedUriParams) {
    if (!schema.properties) {
        return decodedUriParams;
    }
    return (0, function_1.pipe)(Object.keys(schema.properties), A.reduce({}, (deserialized, property) => {
        var _a;
        deserialized[property] = decodedUriParams[property];
        const encoding = encodings.find(enc => enc.property === property);
        if (encoding && encoding.style) {
            const deserializer = deserializers_1.body[encoding.style];
            const propertySchema = (_a = schema.properties) === null || _a === void 0 ? void 0 : _a[property];
            if (propertySchema && typeof propertySchema !== 'boolean')
                deserialized[property] = deserializer(property, decodedUriParams, propertySchema);
        }
        return deserialized;
    }));
}
exports.deserializeFormBody = deserializeFormBody;
function splitUriParams(target) {
    return target.split('&').reduce((result, pair) => {
        const [key, ...rest] = pair.split('=');
        result[key] = rest.join('=');
        return result;
    }, {});
}
exports.splitUriParams = splitUriParams;
function decodeUriEntities(target) {
    return Object.entries(target).reduce((result, [k, v]) => {
        result[decodeURIComponent(k)] = decodeURIComponent(v);
        return result;
    }, {});
}
exports.decodeUriEntities = decodeUriEntities;
function findContentByMediaTypeOrFirst(specs, mediaType) {
    return (0, function_1.pipe)(specs, A.findFirst(spec => (0, wildcardMediaTypeMatch_1.wildcardMediaTypeMatch)(mediaType, spec.mediaType)), O.alt(() => A.head(specs)), O.map(content => ({ mediaType, content })));
}
exports.findContentByMediaTypeOrFirst = findContentByMediaTypeOrFirst;
function deserializeAndValidate(content, schema, target, bundle) {
    const encodings = (0, lodash_1.get)(content, 'encodings', []);
    const encodedUriParams = splitUriParams(target);
    return (0, function_1.pipe)(validateAgainstReservedCharacters(encodedUriParams, encodings), E.map(decodeUriEntities), E.map(decodedUriEntities => deserializeFormBody(schema, encodings, decodedUriEntities)), E.chain(deserialised => (0, function_1.pipe)((0, utils_1.validateAgainstSchema)(deserialised, schema, true, undefined, bundle), E.fromOption(() => deserialised), E.swap)));
}
function withoutAllOf(s) {
    try {
        return mergeAllOf(s, {
            deep: true,
            ignoreAdditionalProperties: true,
        });
    }
    catch (_a) {
        return s;
    }
}
function memoizeSchemaNormalizer(normalizer) {
    const cache = new WeakMap();
    return (schema) => {
        const cached = cache.get(schema);
        if (!cached) {
            const after = withoutAllOf(schema);
            const newSchema = normalizer(after);
            cache.set(schema, newSchema);
            return newSchema;
        }
        return cached;
    };
}
const normalizeSchemaProcessorMap = {
    [types_2.ValidationContext.Input]: memoizeSchemaNormalizer(filterRequiredProperties_1.stripReadOnlyProperties),
    [types_2.ValidationContext.Output]: memoizeSchemaNormalizer(filterRequiredProperties_1.stripWriteOnlyProperties),
};
const validate = (target, specs, context, mediaType, bundle) => {
    const findContentByMediaType = (0, function_1.pipe)(O.Do, O.bind('mediaType', () => O.fromNullable(mediaType)), O.bind('contentResult', ({ mediaType }) => findContentByMediaTypeOrFirst(specs, mediaType)), O.alt(() => O.some({ contentResult: { content: specs[0] || {}, mediaType: 'random' } })), O.bind('schema', ({ contentResult }) => (0, function_1.pipe)(O.fromNullable(contentResult.content.schema), O.chain(normalizeSchemaProcessorMap[context]))));
    return (0, function_1.pipe)(findContentByMediaType, O.fold(() => E.right(target), ({ contentResult: { content, mediaType: mt }, schema }) => (0, function_1.pipe)(mt, O.fromPredicate(mediaType => !!(0, type_is_1.is)(mediaType, ['application/x-www-form-urlencoded'])), O.fold(() => (0, function_1.pipe)((0, utils_1.validateAgainstSchema)(target, schema, false, undefined, bundle), E.fromOption(() => target), E.swap), () => (0, function_1.pipe)(target, E.fromPredicate((target) => typeof target === 'string', () => [{ message: 'Target is not a string', code: '422', severity: types_1.DiagnosticSeverity.Error }]), E.chain(target => deserializeAndValidate(content, schema, target)))), E.mapLeft(diagnostics => applyPrefix('body', diagnostics)))));
};
exports.validate = validate;
function applyPrefix(prefix, diagnostics) {
    return (0, function_1.pipe)(diagnostics, NEA.map(d => ({ ...d, path: [prefix, ...(d.path || [])] })));
}
function validateAgainstReservedCharacters(encodedUriParams, encodings) {
    return (0, function_1.pipe)(encodings, A.reduce([], (diagnostics, encoding) => {
        const allowReserved = (0, lodash_1.get)(encoding, 'allowReserved', false);
        const property = encoding.property;
        const value = encodedUriParams[property];
        if (!allowReserved && /[/?#[\]@!$&'()*+,;=]/.test(value)) {
            diagnostics.push({
                path: [property],
                message: 'Reserved characters used in request body',
                severity: types_1.DiagnosticSeverity.Error,
            });
        }
        return diagnostics;
    }), diagnostics => (A.isNonEmpty(diagnostics) ? E.left(diagnostics) : E.right(encodedUriParams)));
}
