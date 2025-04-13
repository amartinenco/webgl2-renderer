import { debugLog, errorLog, setLogLevel } from './logger/logger.js';
import { initWebGL } from './webgl/webgl-core.js';

async function main() {
    setLogLevel("DEBUG");
    const gl = initWebGL("canvas");
}

main();