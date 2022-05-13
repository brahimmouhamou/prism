"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSingleProcessPrism = exports.createMultiProcessPrism = void 0;
const prism_core_1 = require("@stoplight/prism-core");
const prism_http_server_1 = require("@stoplight/prism-http-server");
const chalk = require("chalk");
const cluster = require("cluster");
const E = require("fp-ts/Either");
const function_1 = require("fp-ts/function");
const signale = require("signale");
const split = require("split2");
const stream_1 = require("stream");
const options_1 = require("../const/options");
const paths_1 = require("./paths");
const colorizer_1 = require("./colorizer");
const operations_1 = require("../operations");
const extensions_1 = require("../extensions");
signale.config({ displayTimestamp: true });
const cliSpecificLoggerOptions = {
    customLevels: { start: 11 },
    level: 'start',
    formatters: {
        level: level => ({ level }),
    },
};
const createMultiProcessPrism = async (options) => {
    if (cluster.isMaster) {
        cluster.setupMaster({ silent: true });
        signale.await({ prefix: chalk.bgWhiteBright.black('[CLI]'), message: 'Starting Prism…' });
        const worker = cluster.fork();
        if (worker.process.stdout) {
            pipeOutputToSignale(worker.process.stdout);
        }
        return;
    }
    else {
        const logInstance = (0, prism_core_1.createLogger)('CLI', cliSpecificLoggerOptions);
        return createPrismServerWithLogger(options, logInstance).catch((e) => {
            logInstance.fatal(e.message);
            cluster.worker.kill();
            throw e;
        });
    }
};
exports.createMultiProcessPrism = createMultiProcessPrism;
const createSingleProcessPrism = options => {
    signale.await({ prefix: chalk.bgWhiteBright.black('[CLI]'), message: 'Starting Prism…' });
    const logStream = new stream_1.PassThrough();
    const logInstance = (0, prism_core_1.createLogger)('CLI', cliSpecificLoggerOptions, logStream);
    pipeOutputToSignale(logStream);
    return createPrismServerWithLogger(options, logInstance).catch((e) => {
        logInstance.fatal(e.message);
        throw e;
    });
};
exports.createSingleProcessPrism = createSingleProcessPrism;
async function createPrismServerWithLogger(options, logInstance) {
    const operations = await (0, operations_1.getHttpOperationsFromSpec)(options.document);
    await (0, extensions_1.configureExtensionsFromSpec)(options.document);
    if (operations.length === 0) {
        throw new Error('No operations found in the current file.');
    }
    const validateRequest = isProxyServerOptions(options) ? options.validateRequest : true;
    const shared = {
        validateRequest,
        validateResponse: true,
        checkSecurity: true,
        errors: false,
        upstreamProxy: undefined,
    };
    const config = isProxyServerOptions(options)
        ? {
            ...shared,
            mock: false,
            upstream: options.upstream,
            errors: options.errors,
            upstreamProxy: options.upstreamProxy,
        }
        : { ...shared, mock: { dynamic: options.dynamic }, errors: options.errors };
    const server = (0, prism_http_server_1.createServer)(operations, {
        cors: options.cors,
        config,
        components: { logger: logInstance.child({ name: 'HTTP SERVER' }) },
    });
    const address = await server.listen(options.port, options.host);
    operations.forEach(resource => {
        const path = (0, function_1.pipe)((0, paths_1.createExamplePath)(resource, colorizer_1.attachTagsToParamsValues), E.getOrElse(() => resource.path));
        logInstance.info(`${resource.method.toUpperCase().padEnd(10)} ${address}${(0, colorizer_1.transformPathParamsValues)(path, chalk.bold.cyan)}`);
    });
    logInstance.start(`Prism is listening on ${address}`);
    return server;
}
function pipeOutputToSignale(stream) {
    function constructPrefix(logLine) {
        const logOptions = options_1.LOG_COLOR_MAP[logLine.name];
        const prefix = '    '
            .repeat(logOptions.index + (logLine.offset || 0))
            .concat(logOptions.color.black(`[${logLine.name}]`));
        return logLine.input
            ? prefix.concat(' ' + chalk.bold.white(`${logLine.input.method} ${logLine.input.url.path}`))
            : prefix;
    }
    stream.pipe(split(JSON.parse)).on('data', (logLine) => {
        signale[logLine.level]({ prefix: constructPrefix(logLine), message: logLine.msg });
    });
}
function isProxyServerOptions(options) {
    return 'upstream' in options;
}
