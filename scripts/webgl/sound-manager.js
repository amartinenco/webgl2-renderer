export class SoundManager {
    constructor() {
        this.sounds = new Map();
        this.context = new (window.AudioContext || window.webkitAudioContext)();

        this.lastKeySoundTime = 0; 
        this.keySoundCooldown = 120;
    }

    addSound(name, buffer) {
        this.sounds.set(name, buffer);
    }

    play(name, volume = 1.0) {
        const now = performance.now();
        if (now - this.lastKeySoundTime < this.keySoundCooldown) { 
            return; 
        }
        this.lastKeySoundTime = now;

        const buffer = this.sounds.get(name);
        if (!buffer) return;

        const source = this.context.createBufferSource();
        source.buffer = buffer;

        source.playbackRate.value = 1.0 + (Math.random() * 0.1 - 0.05);

        const gain = this.context.createGain();
        gain.gain.value = volume;

        source.connect(gain).connect(this.context.destination);
        source.start(0);
    }

    playLoop(name, volume = 1.0) {
        const buffer = this.sounds.get(name);
        if (!buffer) return;

        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const gain = this.context.createGain();
        gain.gain.value = volume;

        source.connect(gain).connect(this.context.destination);
        source.start(0);

        return source;
    }
}
