// Animation Engine
class AnimationEngine {
    constructor() {
        this.animations = new Set();
        this.isRunning = false;
        this.fpsCounter = new FPSCounter();
        this.performanceMode = 'high'; // high, medium, low
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.tick();
        }
    }

    stop() {
        this.isRunning = false;
    }

    tick(timestamp) {
        if (!this.isRunning) return;

        this.fpsCounter.update(timestamp);
        
        for (const animation of this.animations) {
            if (animation.isActive) {
                animation.update(timestamp);
            } else {
                this.animations.delete(animation);
            }
        }

        requestAnimationFrame((ts) => this.tick(ts));
    }

    add(animation) {
        this.animations.add(animation);
        if (!this.isRunning) this.start();
    }
}

// FPS Counter
class FPSCounter {
    constructor() {
        this.fps = 0;
        this.frames = 0;
        this.lastTime = performance.now();
    }

    update(timestamp) {
        this.frames++;
        const elapsed = timestamp - this.lastTime;

        if (elapsed >= 1000) {
            this.fps = Math.round((this.frames * 1000) / elapsed);
            this.frames = 0;
            this.lastTime = timestamp;
        }
    }
}

// Particle System
class ParticleSystem {
    constructor(ctx, options = {}) {
        this.ctx = ctx;
        this.particles = [];
        this.options = {
            maxParticles: options.maxParticles || 100,
            particleLife: options.particleLife || 1000,
            gravity: options.gravity || 0.1,
            drag: options.drag || 0.98,
            colors: options.colors || ['#00ff4c', '#ff4242'],
            size: options.size || { min: 2, max: 6 },
            spread: options.spread || { x: 50, y: 50 },
            initialVelocity: options.initialVelocity || { min: 2, max: 8 }
        };
    }

    emit(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.options.maxParticles) break;

            const angle = random.between(0, Math.PI * 2);
            const speed = random.between(
                this.options.initialVelocity.min,
                this.options.initialVelocity.max
            );

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color: this.options.colors[Math.floor(random.between(0, this.options.colors.length))],
                size: random.between(this.options.size.min, this.options.size.max)
            });
        }
    }

    update() {
        this.particles = this.particles.filter(p => p.life > 0);

        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= this.options.drag;
            p.vy *= this.options.drag;
            p.vy += this.options.gravity;
            p.life -= 1 / this.options.particleLife;
        }
    }

    draw() {
        for (const p of this.particles) {
            this.ctx.beginPath();
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
    }
}

// Spring Animation
class Spring {
    constructor(options = {}) {
        this.target = 0;
        this.current = 0;
        this.velocity = 0;
        this.stiffness = options.stiffness || 0.1;
        this.damping = options.damping || 0.8;
        this.precision = options.precision || 0.01;
    }

    update() {
        const force = (this.target - this.current) * this.stiffness;
        this.velocity = this.velocity * this.damping + force;
        this.current += this.velocity;

        return Math.abs(this.velocity) > this.precision || 
               Math.abs(this.target - this.current) > this.precision;
    }

    set(value) {
        this.target = value;
    }

    reset(value) {
        this.target = value;
        this.current = value;
        this.velocity = 0;
    }
}

// Screen Shake Effect
class ScreenShake {
    constructor(element, options = {}) {
        this.element = element;
        this.intensity = options.intensity || 5;
        this.decay = options.decay || 0.9;
        this.isShaking = false;
        this.offset = { x: 0, y: 0 };
    }

    start(intensity = this.intensity) {
        this.isShaking = true;
        this.currentIntensity = intensity;
        this.shake();
    }

    stop() {
        this.isShaking = false;
        this.element.style.transform = '';
    }

    shake() {
        if (!this.isShaking || this.currentIntensity < 0.1) {
            this.stop();
            return;
        }

        this.offset.x = random.between(-this.currentIntensity, this.currentIntensity);
        this.offset.y = random.between(-this.currentIntensity, this.currentIntensity);
        
        this.element.style.transform = `translate(${this.offset.x}px, ${this.offset.y}px)`;
        this.currentIntensity *= this.decay;

        requestAnimationFrame(() => this.shake());
    }
}

// Trail Effect
class Trail {
    constructor(ctx, options = {}) {
        this.ctx = ctx;
        this.points = [];
        this.maxPoints = options.maxPoints || 10;
        this.color = options.color || '#00ff4c';
        this.width = options.width || 3;
        this.fade = options.fade || 0.95;
    }

    addPoint(x, y) {
        this.points.push({ x, y, alpha: 1 });
        if (this.points.length > this.maxPoints) {
            this.points.shift();
        }
    }

    update() {
        this.points.forEach(point => {
            point.alpha *= this.fade;
        });
        this.points = this.points.filter(point => point.alpha > 0.01);
    }

    draw() {
        if (this.points.length < 2) return;

        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);

        for (let i = 1; i < this.points.length; i++) {
            const p0 = this.points[i - 1];
            const p1 = this.points[i];
            
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.width * p1.alpha;
            this.ctx.globalAlpha = p1.alpha;
            
            this.ctx.lineTo(p1.x, p1.y);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            frameTime: 0,
            particleCount: 0,
            animationCount: 0
        };
        this.lastTime = performance.now();
        this.frameCount = 0;
    }

    update(timestamp) {
        this.frameCount++;
        const elapsed = timestamp - this.lastTime;

        if (elapsed >= 1000) {
            this.metrics.fps = Math.round((this.frameCount * 1000) / elapsed);
            this.metrics.frameTime = elapsed / this.frameCount;
            this.frameCount = 0;
            this.lastTime = timestamp;
        }
    }

    getMetrics() {
        return this.metrics;
    }
}

// Export animation utilities
const animationEngine = new AnimationEngine();
const performanceMonitor = new PerformanceMonitor();

export {
    animationEngine,
    performanceMonitor,
    ParticleSystem,
    Spring,
    ScreenShake,
    Trail
}; 