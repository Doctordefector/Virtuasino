import { balanceManager, animate, random } from '../utils.js';

export class MinesGame {
    constructor() {
        this.container = document.getElementById('mines-game');
        this.size = 3;
        this.mineCount = 3;
        this.grid = [];
        this.revealed = new Set();
        this.isPlaying = false;
        this.setupGameUI();
        this.setupEventListeners();
    }

    setupGameUI() {
        this.container.innerHTML = `
            <div class="mines-game">
                <div class="mines-controls">
                    <div class="mines-inputs">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" class="bet-amount" value="100" min="1" max="10000">
                        </div>
                        <div class="input-group">
                            <label>Grid Size</label>
                            <select class="grid-size">
                                <option value="3">3×3</option>
                                <option value="4">4×4</option>
                                <option value="5">5×5</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Mines</label>
                            <select class="mines-count">
                                <option value="1">1 Mine</option>
                                <option value="2">2 Mines</option>
                                <option value="3" selected>3 Mines</option>
                                <option value="4">4 Mines</option>
                                <option value="5">5 Mines</option>
                            </select>
                        </div>
                    </div>
                    <div class="mines-actions">
                        <button class="start-game">Start Game</button>
                        <button class="cashout" disabled>Cashout (1.29x)</button>
                    </div>
                </div>
                <div class="mines-grid"></div>
                <div class="mines-history">
                    <h3>Recent Games</h3>
                    <div class="history-list"></div>
                </div>
            </div>
        `;

        // Cache DOM elements
        this.betAmount = this.container.querySelector('.bet-amount');
        this.gridSize = this.container.querySelector('.grid-size');
        this.mineSelect = this.container.querySelector('.mines-count');
        this.startButton = this.container.querySelector('.start-game');
        this.cashoutButton = this.container.querySelector('.cashout');
        this.minesGrid = this.container.querySelector('.mines-grid');
        this.historyList = this.container.querySelector('.history-list');

        // Add CSS styles
        const style = document.createElement('style');
        style.textContent = `
            .mines-game {
                padding: 20px;
                color: #fff;
                font-family: 'Inter', sans-serif;
            }

            .mines-controls {
                margin-bottom: 20px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 20px;
            }

            .mines-inputs {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 20px;
            }

            .input-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .input-group label {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.7);
            }

            .input-group input,
            .input-group select {
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: #fff;
                padding: 10px 15px;
                font-size: 16px;
                transition: all 0.2s ease;
            }

            .input-group input:hover,
            .input-group select:hover {
                border-color: rgba(255, 255, 255, 0.2);
            }

            .input-group input:focus,
            .input-group select:focus {
                border-color: #4CAF50;
                outline: none;
            }

            .mines-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
            }

            .mines-actions button {
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                border: none;
                cursor: pointer;
                transition: all 0.2s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                min-width: 160px;
            }

            .start-game {
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            }

            .start-game:hover {
                background: linear-gradient(135deg, #45a049, #3d8b40);
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
            }

            .cashout {
                background: linear-gradient(135deg, #2196F3, #1976D2);
                color: white;
                box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
            }

            .cashout:hover:not(:disabled) {
                background: linear-gradient(135deg, #1976D2, #1565C0);
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
            }

            .cashout:disabled {
                background: linear-gradient(135deg, #9E9E9E, #757575);
                cursor: not-allowed;
                opacity: 0.7;
            }

            .mines-grid {
                display: grid;
                gap: 10px;
                padding: 20px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                margin-bottom: 20px;
                perspective: 1000px;
            }

            .mine-tile {
                aspect-ratio: 1;
                background: rgba(0, 0, 0, 0.3);
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                transform-style: preserve-3d;
                overflow: hidden;
            }

            .mine-tile:hover {
                border-color: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }

            .mine-tile.revealed {
                pointer-events: none;
                transform: rotateY(180deg);
            }

            .mine-tile.revealed.safe {
                background: rgba(76, 175, 80, 0.1);
                border-color: #4CAF50;
                box-shadow: 0 0 20px rgba(76, 175, 80, 0.2);
            }

            .mine-tile.revealed.mine {
                background: rgba(244, 67, 54, 0.1);
                border-color: #f44336;
                box-shadow: 0 0 20px rgba(244, 67, 54, 0.2);
            }

            .mine-tile::before,
            .mine-tile::after {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                backface-visibility: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                transition: all 0.3s ease;
            }

            .mine-tile::before {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 6px;
            }

            .mine-tile::after {
                transform: rotateY(180deg);
            }

            .mine-tile.revealed.safe::after {
                content: '💎';
                animation: pop 0.3s ease-out;
            }

            .mine-tile.revealed.mine::after {
                content: '💣';
                animation: shake 0.3s ease-in-out;
            }

            @keyframes pop {
                0% { transform: rotateY(180deg) scale(0); }
                70% { transform: rotateY(180deg) scale(1.2); }
                100% { transform: rotateY(180deg) scale(1); }
            }

            @keyframes shake {
                0%, 100% { transform: rotateY(180deg) translateX(0); }
                25% { transform: rotateY(180deg) translateX(-5px); }
                75% { transform: rotateY(180deg) translateX(5px); }
            }

            .mines-history {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 20px;
            }

            .mines-history h3 {
                margin: 0 0 15px 0;
                font-size: 18px;
                color: rgba(255, 255, 255, 0.9);
            }

            .history-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .history-item {
                padding: 10px 15px;
                border-radius: 6px;
                background: rgba(0, 0, 0, 0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 14px;
            }

            .history-item.win {
                border-left: 3px solid #4CAF50;
            }

            .history-item.loss {
                border-left: 3px solid #f44336;
            }

            @media (max-width: 768px) {
                .mines-inputs {
                    grid-template-columns: 1fr;
                }

                .mines-actions {
                    flex-direction: column;
                }

                .mines-actions button {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);

        this.updateMineOptions();
        this.createGrid();
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.cashoutButton.addEventListener('click', () => this.cashout());
        this.gridSize.addEventListener('change', () => {
            this.size = parseInt(this.gridSize.value);
            this.updateMineOptions();
            this.createGrid();
        });
        this.mineSelect.addEventListener('change', () => {
            this.mineCount = parseInt(this.mineSelect.value);
            this.updateNextMultiplier();
        });
    }

    updateMineOptions() {
        const maxMines = Math.floor((this.size * this.size) * 0.8); // Max 80% of tiles can be mines
        this.mineSelect.innerHTML = '';
        
        for (let i = 1; i <= maxMines; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i + (i === 1 ? ' Mine' : ' Mines');
            this.mineSelect.appendChild(option);
        }
        
        this.mineCount = Math.min(this.mineCount, maxMines);
        this.mineSelect.value = this.mineCount;
        this.updateNextMultiplier();
    }

    createGrid() {
        this.minesGrid.innerHTML = '';
        this.minesGrid.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        
        for (let i = 0; i < this.size * this.size; i++) {
            const tile = document.createElement('div');
            tile.className = 'mine-tile';
            tile.dataset.index = i;
            tile.addEventListener('click', () => this.revealTile(i));
            this.minesGrid.appendChild(tile);
        }
    }

    generateGrid() {
        const totalTiles = this.size * this.size;
        const grid = new Array(totalTiles).fill(false);
        let minesToPlace = this.mineCount;
        
        while (minesToPlace > 0) {
            const index = random.secure(0, totalTiles - 1);
            if (!grid[index]) {
                grid[index] = true;
                minesToPlace--;
            }
        }
        
        return grid;
    }

    async revealTile(index) {
        if (!this.isPlaying || this.revealed.has(index)) return;
        
        const tile = this.minesGrid.children[index];
        tile.classList.add('revealing');
        
        // Wait for flip animation
        await new Promise(resolve => setTimeout(resolve, 250));
        
        this.revealed.add(index);
        
        if (this.grid[index]) {
            // Hit a mine
            tile.classList.add('revealed', 'mine');
            await this.revealAllMines();
            this.endGame(false);
        } else {
            // Safe tile
            tile.classList.add('revealed', 'safe');
            this.updateNextMultiplier();
            
            // Check if all safe tiles are revealed
            const safeTilesCount = this.size * this.size - this.mineCount;
            if (this.revealed.size === safeTilesCount) {
                this.cashout();
            }
        }
    }

    async revealAllMines() {
        const tiles = this.minesGrid.children;
        const revealDelay = 100;
        
        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i] && !this.revealed.has(i)) {
                const tile = tiles[i];
                tile.classList.add('revealing');
                await new Promise(resolve => setTimeout(resolve, revealDelay));
                tile.classList.add('revealed', 'mine');
            }
        }
    }

    updateNextMultiplier() {
        const totalTiles = this.size * this.size;
        const remainingTiles = totalTiles - this.revealed.size;
        const remainingMines = this.mineCount - this.revealed.size;
        
        if (remainingTiles === 0 || remainingMines === 0) {
            this.cashoutButton.textContent = 'Cashout (0.00x)';
            return;
        }

        // Calculate fair multiplier with house edge
        const probability = (remainingTiles - remainingMines) / remainingTiles;
        const multiplier = (1 / probability) * 0.97; // 3% house edge
        
        this.cashoutButton.textContent = `Cashout (${multiplier.toFixed(2)}x)`;
    }

    startGame() {
        const bet = parseFloat(this.betAmount.value);
        
        if (bet > balanceManager.balance) {
            animate.shake(this.betAmount);
            return;
        }

        this.isPlaying = true;
        this.revealed = new Set();
        this.grid = this.generateGrid();
        
        // Update UI
        this.startButton.disabled = true;
        this.cashoutButton.disabled = false;
        this.gridSize.disabled = true;
        this.mineSelect.disabled = true;
        balanceManager.updateBalance(-bet);
        
        // Reset tiles
        const tiles = this.minesGrid.children;
        for (let tile of tiles) {
            tile.className = 'mine-tile';
        }
    }

    cashout() {
        if (!this.isPlaying) return;

        const bet = parseFloat(this.betAmount.value);
        const multiplier = parseFloat(this.cashoutButton.textContent.split(' ')[1]);
        const winAmount = bet * multiplier;
        
        balanceManager.updateBalance(winAmount);
        this.endGame(true);
    }

    endGame(won) {
        this.isPlaying = false;
        this.startButton.disabled = false;
        this.cashoutButton.disabled = true;
        this.gridSize.disabled = false;
        this.mineSelect.disabled = false;

        // Add to history
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${won ? 'win' : 'loss'}`;
        historyItem.innerHTML = `
            <span>${this.size}x${this.size}</span>
            <span>${this.mineCount} Mines</span>
            <span>${this.revealed.size} Clicks</span>
        `;
        
        this.historyList.insertBefore(historyItem, this.historyList.firstChild);
        
        // Keep only last 10 items
        while (this.historyList.children.length > 10) {
            this.historyList.removeChild(this.historyList.lastChild);
        }
    }
}

// Initialize the game when the module is imported
window.MinesGame = MinesGame; 