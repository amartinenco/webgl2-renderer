import { errorLog, setLogLevel } from './logger/logger.js';
import { initWebGL } from './webgl/webgl-core.js';
import { GameEngine } from './webgl/game-engine.js';
import { GameController } from './webgl/GameController.js';

async function main() {
    setLogLevel("DEBUG");
    const canvas = document.getElementById("canvas");
    
    const gl = initWebGL("canvas");
    if (!gl) {
        errorLog("Failed to initialize WebGL.");
        return;
    }
    const gameEngine = new GameEngine(gl, canvas);

    const gameController = new GameController(gameEngine);
    gameEngine.setController(gameController);
    await gameEngine.initialize();

    gameController.initialize();

    gameEngine.engineRun();
}

main();
