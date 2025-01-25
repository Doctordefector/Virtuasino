class LoadingManager {
    constructor() {
        this.loadingScreen = null;
        this.loadingText = null;
        this.progress = 0;
        this.isLoading = false;
        this.tasks = new Set();
        this.setupLoadingScreen();
    }

    setupLoadingScreen() {
        // Create loading screen if it doesn't exist
        if (!this.loadingScreen) {
            this.loadingScreen = document.createElement('div');
            this.loadingScreen.className = 'loading-screen';
            this.loadingScreen.innerHTML = `
                <div class="loading-content">
                    <div class="loading-animation">
                        <div class="loading-dice"></div>
                    </div>
                    <div class="loading-text">Loading...</div>
                </div>
            `;
            document.body.appendChild(this.loadingScreen);
            this.loadingText = this.loadingScreen.querySelector('.loading-text');
        }

        // Add loading screen styles
        const style = document.createElement('style');
        style.textContent = `
            .loading-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: var(--primary-bg);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                opacity: 1;
                transition: opacity 0.5s ease;
            }

            .loading-screen.hidden {
                opacity: 0;
                pointer-events: none;
            }

            .loading-content {
                text-align: center;
                color: #fff;
            }

            .loading-animation {
                margin-bottom: 20px;
            }

            .loading-dice {
                width: 40px;
                height: 40px;
                background: #4CAF50;
                border-radius: 8px;
                margin: 0 auto;
                animation: bounce 1s infinite;
            }

            .loading-text {
                font-size: 18px;
                color: rgba(255, 255, 255, 0.8);
            }

            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }

    showLoading() {
        this.isLoading = true;
        this.loadingScreen.classList.remove('hidden');
    }

    hideLoading() {
        this.isLoading = false;
        this.loadingScreen.classList.add('hidden');
        setTimeout(() => {
            if (!this.isLoading) {
                this.loadingScreen.style.display = 'none';
            }
        }, 500);
    }

    addTask(taskId) {
        this.tasks.add(taskId);
        this.updateProgress();
    }

    completeTask(taskId) {
        this.tasks.delete(taskId);
        this.updateProgress();
    }

    updateProgress() {
        const totalTasks = 3; // settings, games, navigation
        const completedTasks = totalTasks - this.tasks.size;
        this.progress = (completedTasks / totalTasks) * 100;
        
        if (this.loadingText) {
            this.loadingText.textContent = `Loading... ${Math.round(this.progress)}%`;
        }

        if (this.progress >= 100) {
            this.hideLoading();
        }
    }
}

export const loadingManager = new LoadingManager(); 