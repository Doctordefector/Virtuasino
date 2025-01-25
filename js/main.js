// Import core modules
import { balanceManager, gameManager } from './utils.js';

class App {
    constructor() {
        this.games = {};
        this.init();
    }

    async init() {
        try {
            // Initialize core modules
            await this.initializeCore();
            
            // Initialize games
            await this.initializeGames();
            
            // Setup navigation
            this.setupNavigation();
            
            // Show first game
            document.getElementById('crash-game').classList.add('active');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize app. Please refresh the page.');
        }
    }

    async initializeCore() {
        // Initialize balance manager
        balanceManager.init();
        
        // Initialize game manager
        gameManager.init();
    }

    async initializeGames() {
        // Import game classes
        const { CrashGame } = await import('./games/crash.js');
        const { PlinkoGame } = await import('./games/plinko.js');
        const { MinesGame } = await import('./games/mines.js');

        // Initialize games
        this.games = {
            crash: new CrashGame(),
            plinko: new PlinkoGame(),
            mines: new MinesGame()
        };
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const gameName = item.dataset.game;
                
                // Update navigation
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Update game display
                document.querySelectorAll('.game').forEach(game => {
                    game.classList.remove('active');
                });
                document.getElementById(`${gameName}-game`).classList.add('active');
            });
        });
    }

    showError(message) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        document.body.appendChild(error);
        
        setTimeout(() => error.remove(), 5000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 