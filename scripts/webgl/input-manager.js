import { debugLog } from "../logger/logger.js";

export class InputManager {
    
    constructor() {
        if (InputManager.instance) {
            return InputManager.instance;
        }
        InputManager.instance = this;

        this.keys = new Set();
        this.mouse = { x: 0, y: 0};
        this.gamepad = null;
        this.initEventListeners();
    }

    initEventListeners() {
        window.addEventListener("keydown", (event) => this.keys.add(event.key));
        window.addEventListener("keyup", (event) => this.keys.delete(event.key));
        window.addEventListener("mousemove", (event) => {
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;
        });
        window.addEventListener("mousedown", () => this.mouse.pressed = true);
        window.addEventListener("mouseup", () => this.mouse.pressed = false);

        window.addEventListener("gamepadconnected", (event) => {
            this.gamepad = event.gamepad;
            debugLog(`Gamepad connected: ${this.gamepad}`);
        });
        window.addEventListener("gamepaddisconnected", () => {
            this.gamepad = null;
            debugLog("Gamepad disconnected");
        });
    }

    isKeyPressed(key) {
        return this.keys.has(key);
    }

    getMousePosition() {
        return this.mouse;
    }

    getGamepadState() {
        if (!this.gamepad) return null;
        return navigator.getGamepads()[this.gamepad.index];
    }
};
