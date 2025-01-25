// Constants
const SETTINGS_STORAGE_KEY = 'virtuasino_settings';

class Settings {
    constructor() {
        this.settings = {
            performanceMode: 'high',
            animationSpeed: 1,
            particleDensity: 1,
            soundEnabled: true,
            musicEnabled: true,
            showEffects: true
        };
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('gameSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        this.applySettings();
    }

    saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
        this.applySettings();
    }

    applySettings() {
        // Apply performance mode class to body
        document.body.classList.remove('performance-low', 'performance-medium', 'performance-high');
        document.body.classList.add(`performance-${this.settings.performanceMode}`);

        // Dispatch event for games to update their settings
        window.dispatchEvent(new CustomEvent('settingsChanged', { detail: this.settings }));
    }

    setupUI() {
        const settingsToggle = document.createElement('button');
        settingsToggle.className = 'settings-toggle';
        settingsToggle.innerHTML = '<span>⚙️</span>';
        document.body.appendChild(settingsToggle);

        const settingsContainer = document.createElement('div');
        settingsContainer.className = 'settings-container';
        settingsContainer.innerHTML = `
            <div class="settings-panel">
                <h3>Settings</h3>
                <div class="settings-group">
                    <label>Performance Mode</label>
                    <select id="performanceMode">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div class="settings-group">
                    <label>Animation Speed</label>
                    <input type="range" id="animationSpeed" min="0.5" max="2" step="0.1" value="1">
                    <span class="value">1x</span>
                </div>
                <div class="settings-group">
                    <label>Particle Density</label>
                    <input type="range" id="particleDensity" min="0" max="1" step="0.1" value="1">
                    <span class="value">100%</span>
                </div>
                <div class="settings-group">
                    <label>Sound Effects</label>
                    <input type="checkbox" id="soundEnabled" checked>
                </div>
                <div class="settings-group">
                    <label>Background Music</label>
                    <input type="checkbox" id="musicEnabled" checked>
                </div>
                <div class="settings-group">
                    <label>Visual Effects</label>
                    <input type="checkbox" id="showEffects" checked>
                </div>
                <div class="settings-group metrics">
                    <div>FPS: <span id="fpsCounter">60</span></div>
                    <div>Frame Time: <span id="frameTime">16.67</span>ms</div>
                </div>
            </div>
        `;
        document.body.appendChild(settingsContainer);

        // Add CSS styles
        const style = document.createElement('style');
        style.textContent = `
            .settings-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 25px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                cursor: pointer;
                z-index: 1000;
                transition: all 0.3s ease;
            }

            .settings-toggle:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: rotate(90deg);
            }

            .settings-toggle span {
                font-size: 24px;
            }

            .settings-container {
                position: fixed;
                top: 0;
                right: -300px;
                width: 300px;
                height: 100%;
                background: var(--primary-bg);
                box-shadow: -5px 0 15px rgba(0, 0, 0, 0.3);
                transition: right 0.3s ease;
                z-index: 999;
            }

            .settings-container.active {
                right: 0;
            }

            .settings-panel {
                padding: 20px;
                color: #fff;
            }

            .settings-panel h3 {
                margin: 0 0 20px 0;
                font-size: 20px;
            }

            .settings-group {
                margin-bottom: 20px;
            }

            .settings-group label {
                display: block;
                margin-bottom: 8px;
                color: rgba(255, 255, 255, 0.7);
            }

            .settings-group select,
            .settings-group input[type="range"] {
                width: 100%;
                padding: 8px;
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                color: #fff;
            }

            .settings-group input[type="checkbox"] {
                width: 20px;
                height: 20px;
            }

            .settings-group.metrics {
                background: rgba(0, 0, 0, 0.2);
                padding: 10px;
                border-radius: 4px;
                font-family: monospace;
            }

            .settings-group .value {
                margin-left: 10px;
                color: rgba(255, 255, 255, 0.5);
            }
        `;
        document.head.appendChild(style);

        // Setup event listeners
        settingsToggle.addEventListener('click', () => {
            settingsContainer.classList.toggle('active');
        });

        // Performance mode
        const performanceMode = document.getElementById('performanceMode');
        performanceMode.value = this.settings.performanceMode;
        performanceMode.addEventListener('change', () => {
            this.settings.performanceMode = performanceMode.value;
            this.saveSettings();
        });

        // Animation speed
        const animationSpeed = document.getElementById('animationSpeed');
        const animationSpeedValue = animationSpeed.nextElementSibling;
        animationSpeed.value = this.settings.animationSpeed;
        animationSpeedValue.textContent = this.settings.animationSpeed + 'x';
        animationSpeed.addEventListener('input', () => {
            this.settings.animationSpeed = parseFloat(animationSpeed.value);
            animationSpeedValue.textContent = this.settings.animationSpeed + 'x';
            this.saveSettings();
        });

        // Particle density
        const particleDensity = document.getElementById('particleDensity');
        const particleDensityValue = particleDensity.nextElementSibling;
        particleDensity.value = this.settings.particleDensity;
        particleDensityValue.textContent = (this.settings.particleDensity * 100) + '%';
        particleDensity.addEventListener('input', () => {
            this.settings.particleDensity = parseFloat(particleDensity.value);
            particleDensityValue.textContent = (this.settings.particleDensity * 100) + '%';
            this.saveSettings();
        });

        // Sound effects
        const soundEnabled = document.getElementById('soundEnabled');
        soundEnabled.checked = this.settings.soundEnabled;
        soundEnabled.addEventListener('change', () => {
            this.settings.soundEnabled = soundEnabled.checked;
            this.saveSettings();
        });

        // Background music
        const musicEnabled = document.getElementById('musicEnabled');
        musicEnabled.checked = this.settings.musicEnabled;
        musicEnabled.addEventListener('change', () => {
            this.settings.musicEnabled = musicEnabled.checked;
            this.saveSettings();
        });

        // Visual effects
        const showEffects = document.getElementById('showEffects');
        showEffects.checked = this.settings.showEffects;
        showEffects.addEventListener('change', () => {
            this.settings.showEffects = showEffects.checked;
            this.saveSettings();
        });

        // Setup metrics update
        let lastTime = performance.now();
        let frames = 0;
        const fpsCounter = document.getElementById('fpsCounter');
        const frameTime = document.getElementById('frameTime');

        const updateMetrics = () => {
            const now = performance.now();
            frames++;

            if (now > lastTime + 1000) {
                fpsCounter.textContent = frames;
                frameTime.textContent = (1000 / frames).toFixed(2);
                frames = 0;
                lastTime = now;
            }

            requestAnimationFrame(updateMetrics);
        };

        updateMetrics();
    }
}

export const settings = new Settings(); 