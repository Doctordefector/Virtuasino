import { loadingManager } from './loading-manager.js';
import { settings } from './settings.js';
import { CrashGame } from './games/crash.js';
import { PlinkoGame } from './games/plinko.js';
import { MinesGame } from './games/mines.js';

class AppInitializer {
    constructor() {
        this.initializeComponents();
    }

    async initializeComponents() {
        try {
            // Show loading screen
            loadingManager.showLoading();

            // Initialize settings first
            await this.initializeSettings();
            loadingManager.completeTask('settings');

            // Initialize games
            await this.initializeGames();
            loadingManager.completeTask('games');

            // Setup navigation
            this.setupGameNavigation();
            loadingManager.completeTask('navigation');

            // Hide loading screen
            setTimeout(() => loadingManager.hideLoading(), 500);
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showErrorMessage('Failed to initialize the app. Please refresh the page.');
        }
    }

    async initializeSettings() {
        return new Promise(resolve => {
            settings.loadSettings();
            settings.setupUI();
            resolve();
        });
    }

    async initializeGames() {
        return new Promise(resolve => {
            // Create game instances
            window.crashGame = new CrashGame();
            window.plinkoGame = new PlinkoGame();
            window.minesGame = new MinesGame();

            // Hide all games initially
            document.querySelectorAll('.game').forEach(game => {
                game.style.display = 'none';
            });

            // Show the first game (Crash)
            document.getElementById('crash-game').style.display = 'block';
            resolve();
        });
    }

    setupGameNavigation() {
        const games = ['crash', 'plinko', 'mines'];
        const nav = document.querySelector('.game-nav');

        games.forEach(game => {
            const button = nav.querySelector(`[data-game="${game}"]`);
            if (button) {
                button.addEventListener('click', () => {
                    // Hide all games
                    document.querySelectorAll('.game').forEach(gameElement => {
                        gameElement.style.display = 'none';
                    });

                    // Show selected game
                    document.getElementById(`${game}-game`).style.display = 'block';

                    // Update active button
                    nav.querySelectorAll('button').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    button.classList.add('active');
                });
            }
        });

        // Set initial active button
        const crashButton = nav.querySelector('[data-game="crash"]');
        if (crashButton) {
            crashButton.classList.add('active');
        }
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AppInitializer();
}); 