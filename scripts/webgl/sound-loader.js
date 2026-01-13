import { debugLog } from "../logger/logger.js";

export class SoundLoader {

    constructor(soundManager) {
        this.soundManager = soundManager;
    }

    async loadSounds() {
    
        const sounds = [
            { name: "hum", src: "resources/sounds/computer-hum.mp3" },
            { name: "kbclick", src: "resources/sounds/keyboard-click.mp3" },
            { name: "kbclick2", src: "resources/sounds/mech-keyboard.mp3" },
            { name: "spacebar", src: "resources/sounds/spacebar-click-keyboard.mp3" }
        ];

        await Promise.all(
            sounds.map(s => 
                this.loadSound(s.name, s.src)
            )
        );
        debugLog("Finished loading sounds.");
    }

    async loadSound(name, url) { 
        const response = await fetch(url); 
        const arrayBuffer = await response.arrayBuffer(); 
        const audioBuffer = await this.soundManager.context.decodeAudioData(arrayBuffer); 
        this.soundManager.addSound(name, audioBuffer); 
    }
};