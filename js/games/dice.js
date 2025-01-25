import { balanceManager, animate, random } from '../utils.js';

export class DiceGame {
    constructor() {
        this.container = document.getElementById('dice-game');
        this.setupGameUI();
        this.setupEventListeners();
    }

    setupGameUI() {
        this.container.innerHTML = `
            <div class="dice-game">
                <div class="game-controls">
                    <div class="bet-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" class="bet-amount" value="100" min="1" max="10000">
                        </div>
                        <div class="input-group">
                            <label>Target Number</label>
                            <input type="number" class="target-number" value="50" min="1" max="98">
                        </div>
                        <div class="input-group">
                            <label>Win Chance</label>
                            <span class="win-chance">50.00%</span>
                        </div>
                        <div class="input-group">
                            <label>Multiplier</label>
                            <span class="multiplier">2.00x</span>
                        </div>
                    </div>
                    <div class="roll-controls">
                        <button class="roll-under">Roll Under</button>
                        <button class="roll-over">Roll Over</button>
                    </div>
                </div>
                <div class="dice-animation">
                    <div class="dice">
                        <span class="result">50</span>
                    </div>
                </div>
                <div class="game-history">
                    <h3>Recent Rolls</h3>
                    <div class="history-list"></div>
                </div>
            </div>
        `;

        // Cache DOM elements
        this.betAmount = this.container.querySelector('.bet-amount');
        this.targetNumber = this.container.querySelector('.target-number');
        this.winChance = this.container.querySelector('.win-chance');
        this.multiplier = this.container.querySelector('.multiplier');
        this.rollUnderBtn = this.container.querySelector('.roll-under');
        this.rollOverBtn = this.container.querySelector('.roll-over');
        this.diceElement = this.container.querySelector('.dice');
        this.resultElement = this.container.querySelector('.result');
        this.historyList = this.container.querySelector('.history-list');
    }

    setupEventListeners() {
        this.targetNumber.addEventListener('input', () => this.updateCalculations());
        this.betAmount.addEventListener('input', () => this.updateCalculations());
        this.rollUnderBtn.addEventListener('click', () => this.roll('under'));
        this.rollOverBtn.addEventListener('click', () => this.roll('over'));
    }

    updateCalculations() {
        const target = parseFloat(this.targetNumber.value);
        const winChance = target;
        const multiplier = (100 / winChance) * 0.97; // 3% house edge

        this.winChance.textContent = winChance.toFixed(2) + '%';
        this.multiplier.textContent = multiplier.toFixed(2) + 'x';
    }

    async roll(mode) {
        const bet = parseFloat(this.betAmount.value);
        const target = parseFloat(this.targetNumber.value);
        
        if (bet > balanceManager.balance) {
            animate.shake(this.betAmount);
            return;
        }

        // Disable controls
        this.setControlsState(false);
        balanceManager.updateBalance(-bet);

        // Generate result
        const result = random.secure(1, 100);
        
        // Determine win/loss
        const isWin = mode === 'under' ? result <= target : result >= target;
        const multiplier = parseFloat(this.multiplier.textContent);
        
        // Animate dice roll
        await this.animateRoll(result);

        // Update balance if won
        if (isWin) {
            const winAmount = bet * multiplier;
            balanceManager.updateBalance(winAmount);
            animate.flash(this.diceElement, '#00ff4c33');
        } else {
            animate.flash(this.diceElement, '#ff424233');
        }

        // Add to history
        this.addToHistory(result, mode, target, isWin);

        // Re-enable controls
        this.setControlsState(true);
    }

    async animateRoll(finalNumber) {
        const duration = 1000;
        const startTime = Date.now();
        
        return new Promise(resolve => {
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                if (progress < 1) {
                    const randomNum = Math.floor(Math.random() * 100) + 1;
                    this.resultElement.textContent = randomNum;
                    requestAnimationFrame(animate);
                } else {
                    this.resultElement.textContent = finalNumber;
                    resolve();
                }
            };
            
            animate();
        });
    }

    addToHistory(result, mode, target, isWin) {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${isWin ? 'win' : 'loss'}`;
        historyItem.innerHTML = `
            <span class="history-result">${result}</span>
            <span class="history-target">${mode.toUpperCase()} ${target}</span>
        `;
        
        this.historyList.insertBefore(historyItem, this.historyList.firstChild);
        
        // Keep only last 10 items
        while (this.historyList.children.length > 10) {
            this.historyList.removeChild(this.historyList.lastChild);
        }
    }

    setControlsState(enabled) {
        this.rollUnderBtn.disabled = !enabled;
        this.rollOverBtn.disabled = !enabled;
        this.betAmount.disabled = !enabled;
        this.targetNumber.disabled = !enabled;
    }
}

// Initialize the game when the module is imported
window.DiceGame = DiceGame; 