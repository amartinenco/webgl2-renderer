import { TextRenderer } from "./text-renderer.js";

const LoadingStage = Object.freeze({
    BIOS: 0,
    LOADING: 1,
    TERMINAL: 2,
});

export class TerminalState {
    constructor() {
        this.prompt = "0x00@desktop:~$ ";
        this.input = "";
        this.cursorVisible = true;
        this.cursorTimer = 0;
        this.cursorBlinkRate = 1;
        this.textRenderer = new TextRenderer();

        this.bootStage = LoadingStage.BIOS; // 0 - bios 1 loader 2 main screen
        this.timer = 0;
        this.loadingTimer = 0;

        this.lines = [
            "x00 BIOS v1.3", 
            "Performing memory check........",
            "Detecting GPU..................",
            "Loading kernel.................", 
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
        ];

        this.loadingLines = [
            "Booting x00 System...", 
            "", 
            "[ ] 0%" 
        ];

        
        this.bootCompleteLines = [
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

        this.terminalInitialized = false;
    }

    update(dt) {
        this.timer += dt;
        if (this.bootStage === LoadingStage.BIOS) {
            

            if (this.timer > 0.5) this.lines[1] = "Performing memory check........ OK";
            if (this.timer > 1.0) this.lines[2] = "Detecting GPU.................. OK";
            if (this.timer > 1.5) this.lines[3] = "Loading kernel................. OK";

            if (this.timer > 2.0) {
                this.bootStage = LoadingStage.LOADING;
            }

            return;
        }

        if (this.bootStage === LoadingStage.LOADING) {
            this.loadingTimer += dt;
            this.lines = this.loadingLines;

            const progress = Math.min(1, this.loadingTimer / 3); // 3 seconds
            const bars = Math.floor(progress * 10);
            this.loadingLines[2] = `[${"#".repeat(bars)}${" ".repeat(10 - bars)}] ${Math.floor(progress * 100)}%`;

            if (progress >= 1) {
                this.loadingTimer = 0;
                this.bootStage = LoadingStage.TERMINAL;
            }
            return;   
        }

        if (this.bootStage === LoadingStage.TERMINAL) {
            this.cursorTimer += dt;

            if (!this.terminalInitialized) { 
                this.lines = this.bootCompleteLines;
                this.terminalInitialized = true; 
            }

            if (this.cursorTimer >= this.cursorBlinkRate) { 
               this.cursorVisible = !this.cursorVisible; 
               this.cursorTimer = 0; 
            }
            return;
        }
    }

    getCurrentLine() {
        return this.prompt + this.input.slice(0, this.maxInputLength) + (this.cursorVisible ? "_" : " "); // █ (U+2588)
    }

    getVisibleText() {
        const all = [...this.lines]; 
        if (this.bootStage === LoadingStage.TERMINAL) {
            all.push(this.getCurrentLine());
        }
        const start = Math.max(0, all.length - this.maxLines); 
        return all.slice(start).join("\n");
    }
}
