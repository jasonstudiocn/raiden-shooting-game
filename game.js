class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.gameState = 'menu'; // menu, playing, paused, gameover, stageclear
        this.score = 0;
        this.highScore = localStorage.getItem('raidenHighScore') || 0;
        this.lives = 3;
        this.stage = 1;
        this.stageScore = 0;
        
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.powerUps = [];
        this.particles = [];
        this.explosions = [];
        
        this.keys = {};
        this.isShooting = false;
        this.lastShootTime = 0;
        this.shootCooldown = 100;
        
        // Scrolling background
        this.backgroundOffset = 0;
        this.backgroundSpeed = 2;
        this.stars = [];
        
        // Enemy spawning
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 60;
        this.bossActive = false;
        this.stageEnemiesDestroyed = 0;
        this.stageEnemyTarget = 20;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createStars();
        this.loadStage(this.stage);
        this.gameLoop();
        this.updateUI();
    }
    
    createStars() {
        this.stars = [];
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2,
                speed: Math.random() * 2 + 1,
                brightness: Math.random()
            });
        }
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ') {
                e.preventDefault();
                this.isShooting = true;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            if (e.key === ' ') {
                this.isShooting = false;
            }
        });
        
        // Button controls
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('menuStartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('nextStageBtn').addEventListener('click', () => this.nextStage());
        
        // Mobile controls
        const dpadButtons = document.querySelectorAll('.dpad-btn');
        dpadButtons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.handleMobileControl(direction, true);
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.handleMobileControl(direction, false);
            });
            
            btn.addEventListener('mousedown', (e) => {
                const direction = btn.dataset.direction;
                this.handleMobileControl(direction, true);
            });
            
            btn.addEventListener('mouseup', (e) => {
                const direction = btn.dataset.direction;
                this.handleMobileControl(direction, false);
            });
        });
        
        document.getElementById('fireBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isShooting = true;
        });
        
        document.getElementById('fireBtn').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isShooting = false;
        });
        
        document.getElementById('fireBtn').addEventListener('mousedown', () => {
            this.isShooting = true;
        });
        
        document.getElementById('fireBtn').addEventListener('mouseup', () => {
            this.isShooting = false;
        });
    }
    
    handleMobileControl(direction, pressed) {
        switch(direction) {
            case 'up':
                this.keys['ArrowUp'] = pressed;
                break;
            case 'down':
                this.keys['ArrowDown'] = pressed;
                break;
            case 'left':
                this.keys['ArrowLeft'] = pressed;
                break;
            case 'right':
                this.keys['ArrowRight'] = pressed;
                break;
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('gameMenu').style.display = 'none';
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('stageClear').style.display = 'none';
        this.resetGame();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }
    
    restartGame() {
        this.resetGame();
        this.gameState = 'playing';
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('stageClear').style.display = 'none';
    }
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.stage = 1;
        this.stageScore = 0;
        this.stageEnemiesDestroyed = 0;
        this.bullets = [];
        this.enemies = [];
        this.powerUps = [];
        this.particles = [];
        this.explosions = [];
        this.bossActive = false;
        this.loadStage(this.stage);
        this.updateUI();
    }
    
    loadStage(stageNumber) {
        this.enemies = [];
        this.bullets = [];
        this.powerUps = [];
        this.particles = [];
        this.explosions = [];
        this.stageEnemiesDestroyed = 0;
        this.bossActive = false;
        this.stageEnemyTarget = 20 + (stageNumber * 5);
        
        // Create player
        this.player = new PlayerFighter(this.width / 2, this.height - 80);
        
        // Adjust difficulty based on stage
        this.enemySpawnInterval = Math.max(30, 60 - (stageNumber * 5));
    }
    
    nextStage() {
        this.stage++;
        this.stageScore = 0;
        this.stageEnemiesDestroyed = 0;
        this.loadStage(this.stage);
        this.gameState = 'playing';
        document.getElementById('stageClear').style.display = 'none';
        window.soundManager.playSound('powerup');
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Handle player input
        this.handlePlayerInput();
        
        // Update scrolling background
        this.updateBackground();
        
        // Update player
        if (this.player) {
            this.player.update();
            
            // Auto-shoot
            if (this.isShooting) {
                this.playerShoot();
            }
        }
        
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            
            // Check collision with enemies
            if (bullet.owner === 'player') {
                for (let i = this.enemies.length - 1; i >= 0; i--) {
                    if (this.checkCollision(bullet, this.enemies[i])) {
                        const enemy = this.enemies[i];
                        enemy.health -= bullet.damage;
                        
                        if (enemy.health <= 0) {
                            this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                            this.enemies.splice(i, 1);
                            this.score += enemy.points;
                            this.stageScore += enemy.points;
                            this.stageEnemiesDestroyed++;
                            
                            // Chance to drop power-up
                            if (Math.random() < 0.2) {
                                this.createPowerUp(enemy.x, enemy.y);
                            }
                            
                            window.soundManager.playSound('explosion');
                        } else {
                            window.soundManager.playSound('hit');
                        }
                        
                        return false; // Remove bullet
                    }
                }
            } else {
                // Check collision with player
                if (this.player && this.checkCollision(bullet, this.player)) {
                    this.playerHit();
                    return false; // Remove bullet
                }
            }
            
            // Remove bullets that go off screen
            return bullet.y > -10 && bullet.y < this.height + 10 &&
                   bullet.x > -10 && bullet.x < this.width + 10;
        });
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(this.player, this.bullets);
        });
        
        // Spawn enemies
        this.spawnEnemies();
        
        // Update power-ups
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.update();
            
            // Check collection by player
            if (this.player && this.checkCollision(powerUp, this.player)) {
                this.player.collectPowerUp(powerUp);
                this.score += 500;
                this.stageScore += 500;
                window.soundManager.playSound('powerup');
                return false;
            }
            
            return powerUp.y < this.height + 20;
        });
        
        // Update particles and explosions
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });
        
        this.explosions = this.explosions.filter(explosion => {
            explosion.update();
            return explosion.life > 0;
        });
        
        // Check stage completion
        if (this.stageEnemiesDestroyed >= this.stageEnemyTarget && !this.bossActive && this.enemies.length === 0) {
            this.spawnBoss();
        }
        
        // Check boss defeat
        if (this.bossActive && this.enemies.length === 0) {
            this.stageClear();
        }
        
        this.updateUI();
    }
    
    updateBackground() {
        this.backgroundOffset += this.backgroundSpeed;
        
        // Update stars
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.height) {
                star.y = -10;
                star.x = Math.random() * this.width;
            }
        });
    }
    
    handlePlayerInput() {
        if (!this.player) return;
        
        if (this.keys['ArrowUp'] && this.player.y > 20) {
            this.player.y -= this.player.speed;
        }
        if (this.keys['ArrowDown'] && this.player.y < this.height - this.player.height - 20) {
            this.player.y += this.player.speed;
        }
        if (this.keys['ArrowLeft'] && this.player.x > 20) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.width - this.player.width - 20) {
            this.player.x += this.player.speed;
        }
    }
    
    playerShoot() {
        const now = Date.now();
        if (now - this.lastShootTime > this.shootCooldown) {
            const bullets = this.player.shoot();
            if (bullets.length > 0) {
                this.bullets.push(...bullets);
                this.lastShootTime = now;
                window.soundManager.playSound('shoot');
            }
        }
    }
    
    spawnEnemies() {
        this.enemySpawnTimer++;
        
        if (this.enemySpawnTimer >= this.enemySpawnInterval && !this.bossActive) {
            this.enemySpawnTimer = 0;
            
            const enemyType = Math.random() < 0.7 ? 'basic' : 'advanced';
            const x = Math.random() * (this.width - 40) + 20;
            const enemy = new Enemy(x, -50, enemyType, this.stage);
            this.enemies.push(enemy);
        }
    }
    
    spawnBoss() {
        this.bossActive = true;
        const boss = new Boss(this.width / 2 - 60, -100, this.stage);
        this.enemies.push(boss);
        window.soundManager.playSound('boss');
    }
    
    createPowerUp(x, y) {
        const types = ['vulcan', 'laser', 'plasma', 'missile'];
        const type = types[Math.floor(Math.random() * types.length)];
        this.powerUps.push(new PowerUp(x, y, type));
    }
    
    createExplosion(x, y) {
        this.explosions.push(new Explosion(x, y));
        
        // Create particles
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(x, y));
        }
    }
    
    playerHit() {
        this.lives--;
        this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
        window.soundManager.playSound('playerHit');
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Respawn player
            this.player = new PlayerFighter(this.width / 2, this.height - 80);
        }
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    stageClear() {
        this.gameState = 'stageclear';
        document.getElementById('stageClear').style.display = 'flex';
        document.getElementById('stageScore').textContent = `Stage Score: ${this.stageScore}`;
        
        if (this.stageScore > this.highScore) {
            this.highScore = this.stageScore;
            localStorage.setItem('raidenHighScore', this.highScore);
        }
    }
    
    gameOver() {
        this.gameState = 'gameover';
        document.getElementById('gameOver').style.display = 'flex';
        document.getElementById('finalScore').textContent = `Final Score: ${this.score}`;
        document.getElementById('highScoreDisplay').textContent = `High Score: ${this.highScore}`;
        window.soundManager.playSound('gameover');
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('stage').textContent = this.stage;
        
        if (this.player) {
            document.getElementById('weaponType').textContent = this.player.weaponType.toUpperCase();
            document.getElementById('powerLevel').textContent = this.player.powerLevel;
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw stars
        this.ctx.fillStyle = '#ffffff';
        this.stars.forEach(star => {
            this.ctx.globalAlpha = star.brightness;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        this.ctx.globalAlpha = 1;
        
        // Draw power-ups
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));
        
        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        
        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        
        // Draw player
        if (this.player) {
            this.player.draw(this.ctx);
        }
        
        // Draw particles and explosions
        this.particles.forEach(particle => particle.draw(this.ctx));
        this.explosions.forEach(explosion => explosion.draw(this.ctx));
        
        // Draw pause overlay
        if (this.gameState === 'paused') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = 'bold 32px Orbitron';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Player Fighter Jet Class
class PlayerFighter {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.speed = 5;
        this.weaponType = 'vulcan';
        this.powerLevel = 1;
        this.shootCooldown = 100;
    }
    
    update() {
        // Player movement is handled in game class
    }
    
    shoot() {
        const bullets = [];
        const centerX = this.x + this.width / 2;
        const topY = this.y;
        
        switch(this.weaponType) {
            case 'vulcan':
                bullets.push(new Bullet(centerX - 2, topY, 0, -10, 'player', 'vulcan', this.powerLevel));
                if (this.powerLevel >= 2) {
                    bullets.push(new Bullet(centerX - 8, topY + 5, -1, -10, 'player', 'vulcan', this.powerLevel));
                    bullets.push(new Bullet(centerX + 8, topY + 5, 1, -10, 'player', 'vulcan', this.powerLevel));
                }
                break;
                
            case 'laser':
                bullets.push(new Bullet(centerX, topY, 0, -15, 'player', 'laser', this.powerLevel));
                break;
                
            case 'plasma':
                bullets.push(new Bullet(centerX - 5, topY, -2, -8, 'player', 'plasma', this.powerLevel));
                bullets.push(new Bullet(centerX + 5, topY, 2, -8, 'player', 'plasma', this.powerLevel));
                if (this.powerLevel >= 2) {
                    bullets.push(new Bullet(centerX, topY, 0, -12, 'player', 'plasma', this.powerLevel));
                }
                break;
                
            case 'missile':
                bullets.push(new Bullet(centerX - 10, topY, -2, -6, 'player', 'missile', this.powerLevel));
                bullets.push(new Bullet(centerX + 10, topY, 2, -6, 'player', 'missile', this.powerLevel));
                break;
        }
        
        return bullets;
    }
    
    collectPowerUp(powerUp) {
        this.weaponType = powerUp.type;
        if (this.powerLevel < 3) {
            this.powerLevel++;
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Draw fighter jet body
        ctx.fillStyle = '#4a90e2';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // Draw cockpit
        ctx.fillStyle = '#2c5aa0';
        ctx.fillRect(this.x + this.width/2 - 5, this.y + 10, 10, 15);
        
        // Draw wings
        ctx.fillStyle = '#357abd';
        ctx.fillRect(this.x - 5, this.y + 20, this.width + 10, 8);
        
        // Draw engine glow
        ctx.fillStyle = '#ff6b00';
        ctx.globalAlpha = 0.8;
        ctx.fillRect(this.x + 5, this.y + this.height - 5, 5, 8);
        ctx.fillRect(this.x + this.width - 10, this.y + this.height - 5, 5, 8);
        
        ctx.restore();
    }
}

// Bullet Class
class Bullet {
    constructor(x, y, dx, dy, owner, type, power = 1) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.width = 4;
        this.height = 8;
        this.owner = owner;
        this.type = type;
        this.power = power;
        this.damage = power * 10;
    }
    
    update() {
        this.x += this.dx;
        this.y += this.dy;
    }
    
    draw(ctx) {
        ctx.save();
        
        switch(this.type) {
            case 'vulcan':
                ctx.fillStyle = '#ffff00';
                ctx.shadowColor = '#ffff00';
                break;
            case 'laser':
                ctx.fillStyle = '#ff00ff';
                ctx.shadowColor = '#ff00ff';
                this.width = 2;
                this.height = 20;
                break;
            case 'plasma':
                ctx.fillStyle = '#00ffff';
                ctx.shadowColor = '#00ffff';
                this.width = 6;
                this.height = 6;
                break;
            case 'missile':
                ctx.fillStyle = '#ff6600';
                ctx.shadowColor = '#ff6600';
                this.width = 8;
                this.height = 12;
                break;
            default:
                ctx.fillStyle = '#ff0000';
                ctx.shadowColor = '#ff0000';
        }
        
        ctx.shadowBlur = 10;
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        ctx.restore();
    }
}

// Enemy Class
class Enemy {
    constructor(x, y, type, stage) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.stage = stage;
        
        if (type === 'basic') {
            this.width = 25;
            this.height = 25;
            this.health = 10;
            this.points = 100;
            this.speed = 1 + (stage * 0.2);
            this.color = '#ff3333';
        } else {
            this.width = 35;
            this.height = 35;
            this.health = 20;
            this.points = 200;
            this.speed = 1.5 + (stage * 0.3);
            this.color = '#ff9933';
        }
        
        this.shootTimer = 0;
        this.shootInterval = 60 + Math.random() * 60;
        this.movePattern = Math.random() < 0.5 ? 'straight' : 'zigzag';
        this.zigzagPhase = Math.random() * Math.PI * 2;
    }
    
    update(player, bullets) {
        // Movement patterns
        if (this.movePattern === 'straight') {
            this.y += this.speed;
        } else {
            this.y += this.speed;
            this.x += Math.sin(this.zigzagPhase) * 2;
            this.zigzagPhase += 0.1;
        }
        
        // Shooting
        this.shootTimer++;
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            if (player && Math.random() < 0.3) {
                const bullet = new Bullet(
                    this.x + this.width/2,
                    this.y + this.height,
                    0,
                    5,
                    'enemy',
                    'enemy'
                );
                bullets.push(bullet);
            }
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Draw enemy ship
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y + this.height);
        ctx.lineTo(this.x, this.y);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.closePath();
        ctx.fill();
        
        // Draw details
        ctx.fillStyle = '#660000';
        ctx.fillRect(this.x + this.width/2 - 4, this.y + 8, 8, 8);
        
        ctx.restore();
    }
}

// Boss Class
class Boss {
    constructor(x, y, stage) {
        this.x = x;
        this.y = y;
        this.width = 120;
        this.height = 80;
        this.health = 100 + (stage * 50);
        this.maxHealth = this.health;
        this.points = 1000;
        this.speed = 0.5;
        this.stage = stage;
        this.shootTimer = 0;
        this.movePhase = 0;
        this.phase = 1;
    }
    
    update(player, bullets) {
        // Movement
        this.y += this.speed;
        if (this.y > 100) {
            this.y = 100;
            this.x += Math.sin(this.movePhase) * 2;
            this.movePhase += 0.05;
        }
        
        // Phase transitions
        if (this.health < this.maxHealth * 0.5) {
            this.phase = 2;
        }
        
        // Shooting patterns
        this.shootTimer++;
        const shootRate = this.phase === 2 ? 20 : 40;
        
        if (this.shootTimer >= shootRate && player) {
            this.shootTimer = 0;
            
            if (this.phase === 1) {
                // Spread shot
                for (let i = -2; i <= 2; i++) {
                    const bullet = new Bullet(
                        this.x + this.width/2 + i * 15,
                        this.y + this.height,
                        i * 2,
                        5,
                        'enemy',
                        'enemy'
                    );
                    bullets.push(bullet);
                }
            } else {
                // Rapid fire
                const bullet = new Bullet(
                    this.x + this.width/2,
                    this.y + this.height,
                    0,
                    8,
                    'enemy',
                    'enemy'
                );
                bullets.push(bullet);
            }
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Draw boss ship
        ctx.fillStyle = '#9900cc';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw details
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(this.x + 10, this.y + 10, this.width - 20, 20);
        
        // Draw cannons
        ctx.fillStyle = '#663399';
        ctx.fillRect(this.x + 20, this.y + this.height - 10, 15, 15);
        ctx.fillRect(this.x + this.width - 35, this.y + this.height - 10, 15, 15);
        
        // Draw health bar
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y - 10, this.width, 5);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y - 10, this.width * healthPercent, 5);
        
        ctx.restore();
    }
}

// PowerUp Class
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type;
        this.speed = 2;
        this.floatPhase = 0;
        
        this.colors = {
            vulcan: '#ffff00',
            laser: '#ff00ff',
            plasma: '#00ffff',
            missile: '#ff6600'
        };
    }
    
    update() {
        this.y += this.speed;
        this.floatPhase += 0.1;
        this.x += Math.sin(this.floatPhase) * 0.5;
    }
    
    draw(ctx) {
        ctx.save();
        
        ctx.fillStyle = this.colors[this.type];
        ctx.shadowColor = this.colors[this.type];
        ctx.shadowBlur = 15;
        
        // Draw power-up box
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw symbol
        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.type[0].toUpperCase(), this.x + this.width/2, this.y + this.height/2 + 3);
        
        ctx.restore();
    }
}

// Particle Class
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dx = (Math.random() - 0.5) * 8;
        this.dy = (Math.random() - 0.5) * 8;
        this.life = 30;
        this.color = `hsl(${Math.random() * 60}, 100%, 50%)`;
    }
    
    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.dx *= 0.98;
        this.dy *= 0.98;
        this.life--;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life / 30;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
        ctx.restore();
    }
}

// Explosion Class
class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 20;
        this.maxLife = 20;
        this.radius = 10;
    }
    
    update() {
        this.life--;
        this.radius = 10 + (20 - this.life) * 2;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        
        // Draw explosion circle
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#ffff00');
        gradient.addColorStop(1, '#ff0000');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new Game();
});