import { TerminalState } from "./terminal-state.js";

export class GameController {
    constructor(engine) {
        this.engine = engine;
        this.terminal = new TerminalState();

        window.addEventListener("keydown", (e) => this.handleKey(e));
    }


    handleKey(e) {
        // Backspace
        if (e.key === "Backspace") {
            this.terminal.input = this.terminal.input.slice(0, -1);
            return;
        }

        // Enter
        if (e.key === "Enter") {
            this.terminal.input = "";
            return;
        }

        // Ignore special keys
        if (e.key.length > 1) return;

        // Add character
        this.terminal.input += e.key;
    }


    update(dt) {
        this.terminal.update(dt);
    }
}
