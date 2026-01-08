import { TextRenderer } from "./text-renderer.js";

export class TerminalState {
    constructor() {
        this.prompt = "0x00@desktop:~$ ";
        this.input = "";
        this.cursorVisible = true;
        this.cursorTimer = 0;
        this.cursorBlinkRate = 0.5;
        this.textRenderer = new TextRenderer();

        this.lines = [
            "               ____     ____",
            "              / __ \\   / __ \\",
            "      \\\\//   / / / /  / / / /  x00 TERMINAL v1.0",
            "      //\\\\  / /_/ /  / /_/ /   -----------------",
            "            \\____/   \\____/    Welcome, Andrei!",
            "",
            "System Info:",
            "  OS: Retro 0x00 Linux (x86_64)",
            "  GPU: Custom WebGL Renderer",
            "  Shell: bash (simulated)",
            "",
            " Type 'help' to list available commands",
            ""
        ];



        this.maxLines = 15;

        this.history = [];
        this.historyIndex = -1;
        
        this.maxInputLength = 34;
    }

    update(dt) {
        this.cursorTimer += dt;
        if (this.cursorTimer >= this.cursorBlinkRate) { 
            this.cursorVisible = !this.cursorVisible; 
            this.cursorTimer = 0; 
        }
    }

    getCurrentLine() {
        return this.prompt + this.input.slice(0, this.maxInputLength) + (this.cursorVisible ? "_" : " "); // █ (U+2588)
    }

    getVisibleText() {
        const all = [...this.lines, this.getCurrentLine()]; 
        const start = Math.max(0, all.length - this.maxLines); 
        return all.slice(start).join("\n");
    }


}
