const LOG_LEVELS = {
    TRACE: 1,
    DEBUG: 2,
    INFO: 3,
    WARN: 4,
    ERROR: 5,
    FATAL: 6
};

let logLevel = 3; // INFO by default

function log(message, level = LOG_LEVELS.DEBUG) {
    if (level >= logLevel) {
        const levelStr = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level);

        if (level >= LOG_LEVELS.ERROR) {
            console.error(`[${levelStr}]: ${message}`);
        } else if (level === LOG_LEVELS.WARN) {
            console.warn(`[${levelStr}]: ${message}`);
        } else {
            console.log(`[${levelStr}]: ${message}`);
        }
    }
}

export function traceLog(message) {
    log(message, LOG_LEVELS.TRACE);
}

export function debugLog(message) {
    log(message, LOG_LEVELS.DEBUG);
}

export function infoLog(message) {
    log(message, LOG_LEVELS.INFO);
}

export function warnLog(message) {
    log(message, LOG_LEVELS.WARN);
}

export function errorLog(message) {
    log(message, LOG_LEVELS.ERROR);
}

export function fatalLog(message) {
    log(message, LOG_LEVELS.FATAL);
}

export function setLogLevel(level) {
    if (LOG_LEVELS[level]) {
        logLevel = LOG_LEVELS[level];
    } else {
        console.warn("Invalid log level:", level);
    }
}