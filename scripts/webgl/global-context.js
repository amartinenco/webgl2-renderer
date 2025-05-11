import { InputManager } from "./input-manager.js";

export class GlobalContext {
    static instance = null;

    constructor(canvas) {
        if (GlobalContext.instance) return GlobalContext.instance;
        GlobalContext.instance = this;
        
        this.canvas = canvas;
        this.inputManager = new InputManager();
    }

    static getInstance(canvas) {
        return GlobalContext.instance || new GlobalContext(canvas);
    }
};