import { errorLog, setLogLevel } from './logger/logger.js';
import { initWebGL } from './webgl/webgl-core.js';
import { GameEngine } from './webgl/game-engine.js';

async function main() {
    setLogLevel("DEBUG");
    const canvas = document.getElementById("canvas");
    
    const gl = initWebGL("canvas");
    if (!gl) {
        errorLog("Failed to initialize WebGL.");
        return;
    }
    const gameEngine = new GameEngine(gl, canvas);
    await gameEngine.initialize();
    gameEngine.engineRun();
}

main();
