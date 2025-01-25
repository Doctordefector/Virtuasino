// Constants
export const STORAGE_KEY = 'virtuasino_balance';
export const DEFAULT_BALANCE = 10000;

class BalanceManager {
    constructor() {
        this.balance = DEFAULT_BALANCE;
        this.balanceDisplay = document.createElement('div');
        this.balanceDisplay.className = 'balance-display';
        document.querySelector('.main-content').insertBefore(this.balanceDisplay, document.querySelector('.game'));
        this.setupBalanceDisplay();
        this.loadBalance();
    }

    setupBalanceDisplay() {
        this.balanceDisplay.innerHTML = `
            <div class="balance-container">
                <div class="balance">
                    <span>Balance:</span>
                    <span class="amount">10,000.00</span>
                    <span class="currency">VCRED</span>
                </div>
                <button class="reset-balance">Reset Balance</button>
            </div>
        `;

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
        indicator.style.position = 'absolute';
        indicator.style.left = `${rect.left + rect.width / 2}px`;
        indicator.style.top = `${rect.top}px`;
        
        // Add CSS
        const style = document.createElement('style');
        style.textContent = `
            .balance-indicator {
                position: absolute;
                transform: translateX(-50%);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 600;
                color: var(--text-primary);
                animation: floatUp 1s ease-out forwards;
                pointer-events: none;
                z-index: 1000;
            }

            .balance-indicator.positive {
                background: var(--accent-green);
            }

            .balance-indicator.negative {
                background: var(--accent-red);
            }

            @keyframes floatUp {
                0% {
                    opacity: 1;
                    transform: translate(-50%, 0);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -20px);
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 1000);
    }
}

class AnimationUtils {
    shake(element) {
        element.classList.add('shake');
        setTimeout(() => element.classList.remove('shake'), 500);
    }

    flash(element, color) {
        element.classList.add('flash');
        setTimeout(() => element.classList.remove('flash'), 300);
    }
}

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
export const animate = new AnimationUtils();
export const random = new RandomUtils();

// Game Navigation
export class GameManager {
    constructor() {
        this.setupNavigation();
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => this.switchGame(item.dataset.game));
        });
    }

    switchGame(gameName) {
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

// Initialize managers
export const gameManager = new GameManager(); 