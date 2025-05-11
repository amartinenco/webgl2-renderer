import { debugLog } from "../logger/logger.js";
import { GlobalContext } from './global-context.js';

export class InputManager {
    
    constructor(sensitivity = 5, cameraSpeed = 50) {
        if (InputManager.instance) {
            return InputManager.instance;
        }
        InputManager.instance = this;

        this.keys = new Set();
        this.mouse = { x: 0, y: 0};
        this.gamepad = null;
        this.yaw = -Math.PI / 2;
        this.pitch = 0;
        this.sensitivity = sensitivity;
        this.cameraSpeed = cameraSpeed;
        this.initEventListeners();
    }

    initEventListeners() {
        window.addEventListener("keydown", (event) => this.keys.add(event.key));
        window.addEventListener("keyup", (event) => this.keys.delete(event.key));
        window.addEventListener("mousemove", (event) => {
            this.mouse.x = event.movementX * Math.min(this.sensitivity, 8) * 0.01;
            this.mouse.y = event.movementY * Math.min(this.sensitivity, 8) * 0.01;
        });
        window.addEventListener("mousedown", () => this.mouse.pressed = true);
        window.addEventListener("mouseup", () => this.mouse.pressed = false);
        window.addEventListener("contextmenu", (event) => event.preventDefault());
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

    update(deltaTime) {
        if (this.mouse.pressed) {
            this.yaw += this.mouse.x * this.sensitivity * deltaTime;
            this.pitch -= this.mouse.y * this.sensitivity * deltaTime;
            this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
            this.mouse.x = 0;
            this.mouse.y = 0;
        }
    }
};
