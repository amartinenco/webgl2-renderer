import { InputManager } from "./input-manager.js";

export class GlobalContext {
    static instance = null;

    constructor() {
        if (GlobalContext.instance) return GlobalContext.instance;
        GlobalContext.instance = this;
    
        this.inputManager = new InputManager();
    }

    static getInstance() {
        return GlobalContext.instance || new GlobalContext();
    }
};