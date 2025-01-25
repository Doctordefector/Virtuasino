import { balanceManager, animate, random } from '../utils.js';

export class PlinkoGame {
    constructor() {
        this.container = document.getElementById('plinko-game');
        this.rows = 8;
        this.pins = [];
        this.balls = [];
        this.multipliers = [];
        this.isPlaying = false;
        this.gravity = 0.2;
        this.bounce = 0.6;
        this.friction = 0.99;
        this.ballRadius = 6;
        this.pinRadius = 3;
        this.setupGameUI();
        this.setupEventListeners();
        this.generatePins();
        this.updateMultipliers();
        this.lastTimestamp = performance.now();
        this.animate();
    }

    setupGameUI() {
        this.container.innerHTML = `
            <div class="plinko-game">
                <div class="plinko-controls">
                    <div class="plinko-inputs">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" class="bet-amount" value="100" min="1" max="10000">
                        </div>
                        <div class="input-group">
                            <label>Risk Level</label>
                            <select class="risk-level">
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                    <div class="plinko-actions">
                        <button class="drop-ball">Drop Ball</button>
                    </div>
                </div>
                <div class="plinko-board">
                    <canvas class="plinko-canvas"></canvas>
                    <div class="multipliers"></div>
                </div>
                <div class="plinko-history">
                    <h3>Recent Drops</h3>
                    <div class="history-list"></div>
                </div>
            </div>
        `;

        // Cache DOM elements
        this.betAmount = this.container.querySelector('.bet-amount');
        this.riskLevel = this.container.querySelector('.risk-level');
        this.dropButton = this.container.querySelector('.drop-ball');
        this.canvas = this.container.querySelector('.plinko-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.multiplierDisplay = this.container.querySelector('.multipliers');
        this.historyList = this.container.querySelector('.history-list');

        // Set up canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Add CSS styles
        const style = document.createElement('style');
        style.textContent = `
            .plinko-game {
                padding: 20px;
                color: #fff;
                font-family: 'Inter', sans-serif;
            }

            .plinko-controls {
                margin-bottom: 20px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 20px;
            }

            .plinko-inputs {
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

            .plinko-actions {
                display: flex;
                justify-content: center;
            }

            .drop-ball {
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
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            }

            .drop-ball:hover {
                background: linear-gradient(135deg, #45a049, #3d8b40);
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
            }

            .drop-ball:disabled {
                background: linear-gradient(135deg, #9E9E9E, #757575);
                cursor: not-allowed;
                opacity: 0.7;
            }

            .plinko-board {
                position: relative;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
            }

            .plinko-canvas {
                width: 100%;
                height: 600px;
                background: transparent;
            }

            .multipliers {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                display: flex;
                justify-content: space-around;
                padding: 10px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 0 0 12px 12px;
            }

            .multiplier {
                font-size: 14px;
                font-weight: 600;
                padding: 5px 10px;
                border-radius: 4px;
                background: rgba(255, 255, 255, 0.1);
            }

            .plinko-history {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 20px;
            }

            .plinko-history h3 {
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
        `;
        document.head.appendChild(style);
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.generatePins();
        this.updateMultipliers();
    }

    generatePins() {
        this.pins = [];
        const spacing = this.canvas.width / (this.rows + 2);
        const startY = spacing * 2;

        for (let row = 0; row < this.rows; row++) {
            const pins_in_row = row + 3;
            const row_width = (pins_in_row - 1) * spacing;
            const start_x = (this.canvas.width - row_width) / 2;

            for (let i = 0; i < pins_in_row; i++) {
                this.pins.push({
                    x: start_x + i * spacing,
                    y: startY + row * spacing,
                    radius: this.pinRadius
                });
            }
        }
    }

    updateMultipliers() {
        const multipliers = this.getMultipliers();
        this.multipliers = multipliers;
        
        this.multiplierDisplay.innerHTML = multipliers.map(m => 
            `<div class="multiplier">${m.toFixed(2)}x</div>`
        ).join('');
    }

    getMultipliers() {
        const risk = this.riskLevel.value;
        switch (risk) {
            case 'low':
                return [1.5, 1.3, 1.1, 1, 1, 1.1, 1.3, 1.5];
            case 'medium':
                return [3, 1.5, 1.2, 0.5, 0.5, 1.2, 1.5, 3];
            case 'high':
                return [5, 2, 0.3, 0.2, 0.2, 0.3, 2, 5];
            default:
                return [1, 1, 1, 1, 1, 1, 1, 1];
        }
    }

    dropBall() {
        const bet = parseFloat(this.betAmount.value);
        
        if (bet > balanceManager.balance) {
            animate.shake(this.betAmount);
            return;
        }

        balanceManager.updateBalance(-bet);
        this.dropButton.disabled = true;

        const ball = {
            x: this.canvas.width / 2,
            y: this.ballRadius,
            vx: 0,
            vy: 0,
            radius: this.ballRadius,
            bet: bet
        };

        this.balls.push(ball);
        setTimeout(() => {
            this.dropButton.disabled = false;
        }, 1000);
    }

    animate(timestamp = performance.now()) {
        const elapsed = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw pins
        this.ctx.fillStyle = '#fff';
        this.pins.forEach(pin => {
            this.ctx.beginPath();
            this.ctx.arc(pin.x, pin.y, pin.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Update and draw balls
        this.balls = this.balls.filter(ball => {
            // Apply gravity
            ball.vy += this.gravity;
            
            // Apply friction
            ball.vx *= this.friction;
            ball.vy *= this.friction;
            
            // Update position
            ball.x += ball.vx;
            ball.y += ball.vy;
            
            // Check pin collisions
            this.pins.forEach(pin => {
                const dx = ball.x - pin.x;
                const dy = ball.y - pin.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < ball.radius + pin.radius) {
                    // Calculate collision response
                    const angle = Math.atan2(dy, dx);
                    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
                    
                    ball.x = pin.x + (ball.radius + pin.radius) * Math.cos(angle);
                    ball.y = pin.y + (ball.radius + pin.radius) * Math.sin(angle);
                    
                    // Add random bounce direction
                    const bounceAngle = angle + (Math.random() - 0.5) * Math.PI / 2;
                    ball.vx = Math.cos(bounceAngle) * speed * this.bounce;
                    ball.vy = Math.sin(bounceAngle) * speed * this.bounce;
                }
            });
            
            // Check wall collisions
            if (ball.x < ball.radius) {
                ball.x = ball.radius;
                ball.vx *= -this.bounce;
            } else if (ball.x > this.canvas.width - ball.radius) {
                ball.x = this.canvas.width - ball.radius;
                ball.vx *= -this.bounce;
            }
            
            // Check if ball reached bottom
            if (ball.y > this.canvas.height - ball.radius) {
                // Calculate multiplier based on x position
                const section = Math.floor((ball.x / this.canvas.width) * this.multipliers.length);
                const multiplier = this.multipliers[Math.min(section, this.multipliers.length - 1)];
                
                // Add to history
                const winAmount = ball.bet * multiplier;
                const historyItem = document.createElement('div');
                historyItem.className = `history-item ${multiplier > 1 ? 'win' : 'loss'}`;
                historyItem.innerHTML = `
                    <span>${multiplier.toFixed(2)}x</span>
                    <span>${winAmount.toFixed(2)}</span>
                `;
                
                this.historyList.insertBefore(historyItem, this.historyList.firstChild);
                
                // Keep only last 10 items
                while (this.historyList.children.length > 10) {
                    this.historyList.removeChild(this.historyList.lastChild);
                }
                
                // Update balance
                balanceManager.updateBalance(winAmount);
                
                return false;
            }
            
            // Draw ball
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fill();
            
            return true;
        });

        requestAnimationFrame(ts => this.animate(ts));
    }

    setupEventListeners() {
        this.dropButton.addEventListener('click', () => this.dropBall());
        this.riskLevel.addEventListener('change', () => this.updateMultipliers());
    }
}

// Initialize the game when the module is imported
window.PlinkoGame = PlinkoGame; 