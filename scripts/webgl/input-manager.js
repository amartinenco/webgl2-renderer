import { debugLog } from "../logger/logger.js";
import { GlobalContext } from './global-context.js';

export class InputManager {
    
    constructor(sensitivity = 5, cameraSpeed = 50) {
        if (InputManager.instance) {
            return InputManager.instance;
        }
        InputManager.instance = this;

        this.keys = new Set();
        this.prevKeys = new Set();

        //this.mouse = { x: 0, y: 0};
        this.mouse = { x: 0, y: 0, pressed: false };
        this.gamepad = null;
        this.yaw = -Math.PI / 2;
        this.pitch = 0;
        this.sensitivity = sensitivity;
        this.cameraSpeed = cameraSpeed;
        this.initEventListeners();

        this.offsetX = 0; // yaw offset
        this.offsetY = 0; // pitch offset
        this.maxAngle = 0.35; // ~20 degrees in radians
        this.spring = 5.0; // how fast it returns to center
        this.resistancePower = 2.0; // how strong resistance feels

        this.baseYaw = this.yaw; 
        this.basePitch = this.pitch;
    }

    initEventListeners() {
        window.addEventListener("keydown", (event) => this.keys.add(event.code));
        window.addEventListener("keyup", (event) => this.keys.delete(event.code));
        window.addEventListener("mousemove", (event) => {
            if (this.mouse.pressed) {
                this.mouse.x += event.movementX * Math.min(this.sensitivity, 8) * 0.01;
                this.mouse.y += event.movementY * Math.min(this.sensitivity, 8) * 0.01;
            }
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

    isKeyJustPressed(key) { 
        return this.keys.has(key) && !this.prevKeys.has(key);
    }
    
    isKeyJustReleased(key) { 
        return !this.keys.has(key) && this.prevKeys.has(key);
    }

    getMousePosition() {
        return this.mouse;
    }

    getGamepadState() {
        if (!this.gamepad) return null;
        return navigator.getGamepads()[this.gamepad.index];
    }

    update(deltaTime, inputEnabled = false) {

        // no clip
        if (inputEnabled) {
            this.yaw += this.mouse.x * this.sensitivity * deltaTime;
            this.pitch -= this.mouse.y * this.sensitivity * deltaTime;

            // Clamp pitch
            this.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.pitch));

            // Reset mouse deltas
            this.mouse.x = 0;
            this.mouse.y = 0;

            this.prevKeys = new Set(this.keys);
            return;
        }
    
        // cone
        if (this.mouse.pressed) {
            // Push inside cone
            const mag = Math.sqrt(this.offsetX*this.offsetX + this.offsetY*this.offsetY);
            const t = Math.min(mag / this.maxAngle, 1.0);
            const resistance = 1.0 - Math.pow(t, this.resistancePower);

            this.offsetX += this.mouse.x * this.sensitivity * deltaTime * resistance;
            this.offsetY -= this.mouse.y * this.sensitivity * deltaTime * resistance;

            // Clamp to cone
            const newMag = Math.sqrt(this.offsetX * this.offsetX + this.offsetY*this.offsetY);
            if (newMag > this.maxAngle) {
                const scale = this.maxAngle / newMag;
                this.offsetX *= scale;
                this.offsetY *= scale;
            }
        } 
        else {
            // Spring back when mouse NOT pressed
            this.offsetX -= this.offsetX * this.spring * deltaTime;
            this.offsetY -= this.offsetY * this.spring * deltaTime;
        }

        this.yaw = this.baseYaw + this.offsetX;
        this.pitch = this.basePitch + this.offsetY;

        // Reset mouse deltas
        this.mouse.x = 0;
        this.mouse.y = 0;

        this.prevKeys = new Set(this.keys);
    }
};
