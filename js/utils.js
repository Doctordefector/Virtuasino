// Constants
export const STORAGE_KEY = 'virtuasino_balance';
export const DEFAULT_BALANCE = 10000;

// Balance Manager
class BalanceManager {
    constructor() {
        this.balance = DEFAULT_BALANCE;
        this.balanceDisplay = null;
    }

    init() {
        this.createBalanceDisplay();
        this.loadBalance();
    }

    createBalanceDisplay() {
        this.balanceDisplay = document.createElement('div');
        this.balanceDisplay.className = 'balance-display';
        this.balanceDisplay.innerHTML = `
            <div class="balance-container">
                <div class="balance">
                    <span>Balance:</span>
                    <span class="amount">0.00</span>
                    <span class="currency">VCRED</span>
                </div>
                <button class="reset-balance">Reset Balance</button>
            </div>
        `;

        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(this.balanceDisplay, mainContent.firstChild);

        // Add reset button listener
        this.balanceDisplay.querySelector('.reset-balance').addEventListener('click', () => {
            this.resetBalance();
        });
    }

    loadBalance() {
        const savedBalance = localStorage.getItem(STORAGE_KEY);
        if (savedBalance !== null) {
            this.balance = parseFloat(savedBalance);
        }
        this.updateDisplay();
    }

    saveBalance() {
        localStorage.setItem(STORAGE_KEY, this.balance.toString());
        this.updateDisplay();
    }

    updateBalance(amount) {
        this.balance += amount;
        this.saveBalance();
        this.createBalanceIndicator(amount);
    }

    resetBalance() {
        this.balance = DEFAULT_BALANCE;
        this.saveBalance();
    }

    updateDisplay() {
        const amountElement = this.balanceDisplay.querySelector('.amount');
        if (amountElement) {
            amountElement.textContent = this.formatNumber(this.balance);
        }
    }

    formatNumber(number) {
        return number.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    createBalanceIndicator(amount) {
        const indicator = document.createElement('div');
        indicator.className = `balance-indicator ${amount >= 0 ? 'positive' : 'negative'}`;
        indicator.textContent = `${amount >= 0 ? '+' : ''}${this.formatNumber(amount)}`;
        
        const rect = this.balanceDisplay.getBoundingClientRect();
        indicator.style.left = `${rect.left + rect.width / 2}px`;
        indicator.style.top = `${rect.top}px`;
        
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 1000);
    }
}

// Game Manager
class GameManager {
    constructor() {
        this.activeGame = null;
    }

    init() {
        this.setupNavigation();
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                this.switchGame(item.dataset.game);
            });
        });
    }

    switchGame(gameName) {
        this.activeGame = gameName;
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.game === gameName);
        });

        // Update game display
        document.querySelectorAll('.game').forEach(game => {
            game.classList.toggle('active', game.id === `${gameName}-game`);
        });
    }
}

// Animation Utilities
class AnimationUtils {
    shake(element) {
        element.classList.add('shake');
        setTimeout(() => element.classList.remove('shake'), 500);
    }

    flash(element) {
        element.classList.add('flash');
        setTimeout(() => element.classList.remove('flash'), 300);
    }
}

// Random Number Utilities
class RandomUtils {
    between(min, max) {
        return Math.random() * (max - min) + min;
    }

    secure(min, max) {
        const range = max - min + 1;
        const bytes = new Uint32Array(1);
        crypto.getRandomValues(bytes);
        const randomNumber = bytes[0] / (0xffffffff + 1);
        return Math.floor(randomNumber * range + min);
    }
}

// Export instances
export const balanceManager = new BalanceManager();
export const gameManager = new GameManager();
export const animate = new AnimationUtils();
export const random = new RandomUtils(); 