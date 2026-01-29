class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.createSounds();
    }
    
    createSounds() {
        // Create simple sound effects using Web Audio API
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Define sound types
        this.sounds = {
            shoot: { frequency: 800, duration: 0.1, type: 'square', volume: 0.3 },
            hit: { frequency: 200, duration: 0.2, type: 'sawtooth', volume: 0.4 },
            explosion: { frequency: 100, duration: 0.3, type: 'noise', volume: 0.5 },
            powerup: { frequency: 1200, duration: 0.15, type: 'sine', volume: 0.4 },
            playerHit: { frequency: 150, duration: 0.4, type: 'sawtooth', volume: 0.6 },
            gameover: { frequency: 80, duration: 0.8, type: 'sawtooth', volume: 0.7 },
            boss: { frequency: 50, duration: 0.5, type: 'square', volume: 0.8 }
        };
    }
    
    playSound(soundName) {
        if (!this.enabled || !this.audioContext || !this.sounds[soundName]) return;
        
        const sound = this.sounds[soundName];
        
        if (sound.type === 'noise') {
            // Create explosion sound using noise
            this.createNoiseSound(sound);
        } else {
            // Create regular tone
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = sound.type;
            oscillator.frequency.setValueAtTime(sound.frequency, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(sound.volume || 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + sound.duration);
        }
    }
    
    createNoiseSound(sound) {
        const bufferSize = this.audioContext.sampleRate * sound.duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        noise.buffer = buffer;
        noise.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        gainNode.gain.setValueAtTime(sound.volume || 0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
        
        noise.start(this.audioContext.currentTime);
    }
    
    toggleSound() {
        this.enabled = !this.enabled;
    }
}

// Initialize sound manager globally
window.soundManager = new SoundManager();