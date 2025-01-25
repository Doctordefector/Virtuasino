import { balanceManager, animate, random } from '../utils.js';

export class CrashGame {
    constructor() {
        this.container = document.getElementById('crash-game');
        this.isPlaying = false;
        this.currentMultiplier = 1;
        this.crashPoint = 1;
        this.lastTimestamp = 0;
        this.chartPoints = [];
        this.maxPoints = 300; // Increased for smoother line
        this.growthRate = 0.00005; // Base growth rate
        this.volatility = 0.0002; // Controls the size of fluctuations
        this.lastY = 0; // For smooth transitions
        this.setupGameUI();
        this.setupEventListeners();
    }

    setupGameUI() {
        this.container.innerHTML = `
            <div class="crash-game">
                <div class="crash-display">
                    <canvas class="crash-canvas"></canvas>
                    <div class="multiplier-display">
                        <span class="current-multiplier">1.00</span>x
                    </div>
                </div>
                <div class="game-controls">
                    <div class="bet-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" class="bet-amount" value="100" min="1" max="10000">
                        </div>
                        <div class="input-group">
                            <label>Auto Cashout</label>
                            <input type="number" class="auto-cashout" value="2" min="1.01" step="0.01">
                        </div>
                    </div>
                    <div class="action-buttons">
                        <button class="place-bet">Place Bet</button>
                        <button class="cashout" disabled>Cashout</button>
                    </div>
                </div>
                <div class="crash-history">
                    <h3>Recent Crashes</h3>
                    <div class="history-list"></div>
                </div>
            </div>
        `;

        // Cache DOM elements
        this.betAmount = this.container.querySelector('.bet-amount');
        this.autoCashout = this.container.querySelector('.auto-cashout');
        this.placeBetBtn = this.container.querySelector('.place-bet');
        this.cashoutBtn = this.container.querySelector('.cashout');
        this.multiplierDisplay = this.container.querySelector('.current-multiplier');
        this.historyList = this.container.querySelector('.history-list');
        this.canvas = this.container.querySelector('.crash-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Set up canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    setupEventListeners() {
        this.placeBetBtn.addEventListener('click', () => this.placeBet());
        this.cashoutBtn.addEventListener('click', () => this.cashout());
    }

    resizeCanvas() {
        const displayWidth = this.container.querySelector('.crash-display').clientWidth;
        const displayHeight = Math.min(window.innerHeight * 0.4, displayWidth * 0.6);
        
        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;
        
        this.drawChart();
    }

    drawChart() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set up chart area
        const padding = 40;
        const chartWidth = this.canvas.width - padding * 2;
        const chartHeight = this.canvas.height - padding * 2;
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let i = 0; i <= 10; i++) {
            const x = padding + (chartWidth * i / 10);
            this.ctx.beginPath();
            this.ctx.moveTo(x, padding);
            this.ctx.lineTo(x, this.canvas.height - padding);
            this.ctx.stroke();
        }
        
        // Horizontal grid lines and labels
        for (let i = 0; i <= 5; i++) {
            const y = this.canvas.height - padding - (chartHeight * i / 5);
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(this.canvas.width - padding, y);
            this.ctx.stroke();

            // Draw multiplier labels
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.font = '12px Inter';
            this.ctx.textAlign = 'right';
            this.ctx.fillText((i * 2) + 'x', padding - 5, y + 4);
        }

        if (this.chartPoints.length > 1) {
            // Create gradient for line
            const gradient = this.ctx.createLinearGradient(padding, 0, this.canvas.width - padding, 0);
            gradient.addColorStop(0, '#00ff4c');
            gradient.addColorStop(1, '#ff4242');
            
            // Draw line with gradient
            this.ctx.beginPath();
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 3;
            
            const startX = padding;
            const startY = this.canvas.height - padding;
            
            this.ctx.moveTo(startX, startY);
            
            // Draw smooth curve
            this.chartPoints.forEach((point, index) => {
                if (index === 0) return;
                
                const progress = index / (this.maxPoints - 1);
                const x = padding + (progress * chartWidth);
                const y = this.canvas.height - padding - (Math.min(point - 1, 9) * chartHeight / 9);
                
                // Use quadratic curves for smoother line
                if (index > 1) {
                    const prevProgress = (index - 1) / (this.maxPoints - 1);
                    const prevX = padding + (prevProgress * chartWidth);
                    const prevY = this.canvas.height - padding - (Math.min(this.chartPoints[index - 1] - 1, 9) * chartHeight / 9);
                    
                    const cpX = (prevX + x) / 2;
                    this.ctx.quadraticCurveTo(prevX, prevY, cpX, y);
                }
                
                if (index === this.chartPoints.length - 1) {
                    this.ctx.lineTo(x, y);
                }
            });
            
            // Line shadow
            this.ctx.shadowColor = 'rgba(0, 255, 76, 0.3)';
            this.ctx.shadowBlur = 10;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
            
            // Fill area under curve
            this.ctx.lineTo(this.canvas.width - padding, this.canvas.height - padding);
            this.ctx.lineTo(padding, this.canvas.height - padding);
            this.ctx.closePath();
            
            const fillGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            fillGradient.addColorStop(0, 'rgba(0, 255, 76, 0.1)');
            fillGradient.addColorStop(1, 'rgba(0, 255, 76, 0)');
            
            this.ctx.fillStyle = fillGradient;
            this.ctx.fill();
        }
    }

    generateCrashPoint() {
        const e = Math.E;
        const houseEdge = 0.97; // 3% house edge
        const randomValue = random.between(0, 1);
        return Math.max(1, Math.floor(100 * houseEdge * (e / (1 - randomValue))) / 100);
    }

    async placeBet() {
        const bet = parseFloat(this.betAmount.value);
        
        if (bet > balanceManager.balance) {
            animate.shake(this.betAmount);
            return;
        }

        this.isPlaying = true;
        this.currentMultiplier = 1;
        this.crashPoint = this.generateCrashPoint();
        this.chartPoints = [this.currentMultiplier];
        this.lastY = this.currentMultiplier;
        
        // Update UI
        this.placeBetBtn.disabled = true;
        this.cashoutBtn.disabled = false;
        balanceManager.updateBalance(-bet);
        
        // Start game loop
        this.lastTimestamp = performance.now();
        this.gameLoop();
    }

    gameLoop(timestamp = performance.now()) {
        if (!this.isPlaying) return;

        const elapsed = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;

        // Update multiplier with smooth growth
        const baseIncrease = Math.pow(Math.E, this.growthRate * elapsed) - 1;
        const fluctuation = (Math.random() - 0.5) * this.volatility * elapsed;
        const totalIncrease = baseIncrease + Math.max(fluctuation, -baseIncrease);
        
        this.currentMultiplier *= (1 + totalIncrease);

        // Smooth transition for chart points
        const targetY = this.currentMultiplier;
        const smoothing = 0.3;
        this.lastY = this.lastY + (targetY - this.lastY) * smoothing;
        
        // Update chart points
        this.chartPoints.push(this.lastY);
        if (this.chartPoints.length > this.maxPoints) {
            this.chartPoints.shift();
        }

        // Update display
        this.multiplierDisplay.textContent = this.currentMultiplier.toFixed(2);
        this.drawChart();

        // Check for auto cashout
        const autoCashoutValue = parseFloat(this.autoCashout.value);
        if (autoCashoutValue && this.currentMultiplier >= autoCashoutValue) {
            this.cashout();
            return;
        }

        // Check for crash
        if (this.currentMultiplier >= this.crashPoint) {
            this.crash();
            return;
        }

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    cashout() {
        if (!this.isPlaying) return;

        const bet = parseFloat(this.betAmount.value);
        const winAmount = bet * this.currentMultiplier;
        
        balanceManager.updateBalance(winAmount);
        animate.flash(this.multiplierDisplay.parentElement, '#00ff4c33');
        
        this.endGame();
    }

    crash() {
        this.multiplierDisplay.parentElement.style.color = '#ff4242';
        animate.flash(this.multiplierDisplay.parentElement, '#ff424233');
        
        this.endGame();
    }

    endGame() {
        this.isPlaying = false;
        this.placeBetBtn.disabled = false;
        this.cashoutBtn.disabled = true;

        // Add to history
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${this.currentMultiplier >= this.crashPoint ? 'loss' : 'win'}`;
        historyItem.textContent = this.currentMultiplier.toFixed(2) + 'x';
        
        this.historyList.insertBefore(historyItem, this.historyList.firstChild);
        
        // Keep only last 10 items
        while (this.historyList.children.length > 10) {
            this.historyList.removeChild(this.historyList.lastChild);
        }

        // Reset multiplier display color
        setTimeout(() => {
            this.multiplierDisplay.parentElement.style.color = '';
        }, 1000);
    }
}

// Initialize the game when the module is imported
window.CrashGame = CrashGame; 