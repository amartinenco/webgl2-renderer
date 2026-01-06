import { TerminalState } from "./terminal-state.js";

export class GameController {
    constructor(engine) {
        this.engine = engine;
        this.terminal = new TerminalState();

        window.addEventListener("keydown", (e) => this.handleKey(e));
    }

    handleKey(e) {
        const t = this.terminal;

        if (e.key === "Enter") {
            const cmd = t.input.trim();

            t.lines.push(t.prompt + cmd);

            if (cmd) {
                t.history.push(cmd);
                t.historyIndex = -1;
            }

            const outputLines = this.runCommand(cmd);
            for (const line of outputLines) {
                t.lines.push(line);
            }

            t.input = "";

            if (t.lines.length > t.maxLines * 3) {
                t.lines = t.lines.slice(-t.maxLines * 2);
            }

            return;
        }

        // Backspace
        if (e.key === "Backspace") {
            t.input = t.input.slice(0, -1);
            return;
        }

        // History navigation
        if (e.key === "ArrowUp") {
            this.navigateHistory(-1);
            return;
        }
        if (e.key === "ArrowDown") {
            this.navigateHistory(1);
            return;
        }

        // Ignore non-printable
        if (e.key.length !== 1) return;

        // Append character
        t.input += e.key;
    }

    navigateHistory(direction) {
        const t = this.terminal;
        if (!t.history.length) return;

        if (direction < 0) { // up
            if (t.historyIndex === -1) {
                t.historyIndex = t.history.length - 1;
            } else if (t.historyIndex > 0) {
                t.historyIndex--;
            }
        } else { // down
            if (t.historyIndex === -1) return;
            if (t.historyIndex < t.history.length - 1) {
                t.historyIndex++;
            } else {
                t.historyIndex = -1;
                t.input = "";
                return;
            }
        }

        t.input = t.history[t.historyIndex] || "";
    }

    runCommand(cmd) {
        if (!cmd) return [];

        const [name, ...args] = cmd.split(/\s+/);

        switch (name) {
            case "ls":
                return ["-rw-r--r-- 3518 education.txt", "-rw-r--r-- 2880 experience.txt"];
            case "rm":
                return ["Must be a sudo user"];
            case "sudo":
                return ["Guest user. Not part of a sudo group"];
            case "clear":
                this.terminal.lines = [];
                return [];
            default:
                let command = name.length > 10 ? name.slice(0, 5) + "..." : name ;
                return [`bash: ${command}: command not found`];
        }
    }

    update(dt) {
        this.terminal.update(dt);
    }
}
