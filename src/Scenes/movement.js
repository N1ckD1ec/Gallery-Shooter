class MainGame extends Phaser.Scene {
    constructor() {
        super("mainGame");
        this.my = { sprite: {}, group: {} };
        this.playerSpeed = 5;
        this.laserSpeed = 7;
        this.health = 10;
        this.score = 0;
        this.maxHealth = 15;
        this.laserActive = false;
        this.wave = 1;
        this.consecutiveHits = 0;
        this.bossHits = 0;
        this.gameOver = false;
    }

    init() {
        //reset all dynamic game state
        this.health = 10;
        this.score = 0;
        this.wave = 1;
        this.consecutiveHits = 0;
        this.bossHits = 0;
        this.laserActive = false;
        this.gameOver = false;
      }
      

    preload() {
        this.load.setPath("./assets/");

        //Player and UI
        this.load.image("player", "playerShip1_orange.png");
        this.load.image("laser", "laserBlue09.png");
        this.load.image("hpIcon", "playerLife1_orange.png");

        //Enemies and projectiles
        this.load.image("ship1", "shipBeige_manned.png");
        this.load.image("monkey", "monkey.png");
        this.load.image("ship2", "shipBlue_manned.png");
        this.load.image("elephant", "elephant.png");
        this.load.image("ship3", "shipYellow_manned.png");

        //UI: score numbers and labels
        this.load.image("scoreLabel", "text_score_small.png");
        for (let i = 0; i <= 9; i++) {
            this.load.image(`num${i}`, `text_${i}_small.png`);
        }

        this.load.image("gameOver", "text_gameover.png");
    }

    create() {
        let my = this.my;

        //Player
        my.sprite.player = this.add.sprite(400, 550, "player");
        my.sprite.laser = this.add.sprite(-100, -100, "laser").setVisible(false);

        //Input
        this.AKey = this.input.keyboard.addKey('A');
        this.DKey = this.input.keyboard.addKey('D');
        this.SpaceKey = this.input.keyboard.addKey('SPACE');
        this.RKey = this.input.keyboard.addKey('R');

        //Groups
        my.group.enemies = this.add.group();
        my.group.projectiles = this.add.group();

        //UI
        this.hpIcons = [];
        for (let i = 0; i < this.maxHealth; i++) {
            let icon = this.add.image(20 + i * 20, 20, "hpIcon").setScale(0.7).setOrigin(0, 0);
            icon.setVisible(i < this.health);  // only show if within starting health
            this.hpIcons.push(icon);
        }

        this.scoreDigits = [];
        this.scoreLabel = this.add.image(740, 20, "scoreLabel");

        this.spawnWave();

        this.updateUI();
    }

    spawnWave() {
        let my = this.my;
        my.group.enemies.clear(true, true);
    
        //Wave indicator
        let labelText = this.wave < 3 
          ? `Wave ${this.wave}` 
          : "Boss Battle";
        let waveLabel = this.add.text(400, 50, labelText, {
            fontSize: "32px",
            fill: "#ffffff",
            fontFamily: "Arial",
            fontStyle: "bold"
        }).setOrigin(0.5);
    
        //disappear in 3 seconds
        this.time.delayedCall(3000, () => {
            waveLabel.destroy();
        });
    
        //Spawn the enemies for this wave
        if (this.wave === 1) {
            for (let i = 0; i < 5; i++) {
                let x = 100 + i * 120;
                let ship = this.add.sprite(x, 100, "ship1").setScale(0.6);
                ship.type = "monkey";
                ship.dir = 1;
                ship.speed = 2;
                my.group.enemies.add(ship);
            }
        } else if (this.wave === 2) {
            for (let i = 0; i < 4; i++) {
                let x = 150 + i * 140;
                let ship = this.add.sprite(x, 100, "ship2").setScale(0.6);
                ship.type = "elephant";
                ship.angleCounter = 0;
                my.group.enemies.add(ship);
            }
        } else if (this.wave === 3) {
            let boss = this.add.sprite(400, 120, "ship3").setScale(0.6);
            boss.type = "boss";
            boss.hp = 3;
            boss.dir = 1;
            my.group.enemies.add(boss);
        }
    }
    

    updateUI() {
        //Clear and re-add score digits
        this.scoreDigits.forEach(d => d.destroy());
        this.scoreDigits = [];
    
        let digits = String(this.score).padStart(4, '0');
        for (let i = 0; i < digits.length; i++) {
            let img = this.add.image(560 + i * 30, 20, `num${digits[i]}`);
            img.setScale(0.8);
            this.scoreDigits.push(img);
        }
    }
    
    
    

    fireLaser() {
        let laser = this.my.sprite.laser;
        let player = this.my.sprite.player;

        laser.x = player.x;
        laser.y = player.y - 30;
        laser.setVisible(true);
        this.laserActive = true;
    }

    update() {
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(this.RKey)) {
            this.scene.restart();
            return;
        }

        if (this.gameOver) return;

        let my = this.my;
        let player = my.sprite.player;
        let laser = my.sprite.laser;

        // Player movement
        if (this.AKey.isDown) player.x -= this.playerSpeed;
        if (this.DKey.isDown) player.x += this.playerSpeed;
        player.x = Phaser.Math.Clamp(player.x, 0, 800);

        //Fire laser
        if (Phaser.Input.Keyboard.JustDown(this.SpaceKey) && !this.laserActive) {
            this.fireLaser();
        }

        //Laser movement
        if (this.laserActive) {
            laser.y -= this.laserSpeed;
            if (laser.y < -32) {
                laser.setVisible(false);
                this.laserActive = false;
            }
        }

        //Enemy movement and firing
        my.group.enemies.getChildren().forEach(enemy => {
            if (enemy.type === "monkey") {
                enemy.x += enemy.speed * enemy.dir;
                if (enemy.x < 50 || enemy.x > 750) enemy.dir *= -1;
            
                //Fire monkey projectile
                if (Phaser.Math.Between(0, 100) < 1) {  // fire rate for monkey ships
                    let proj = this.add.sprite(enemy.x, enemy.y + 20, "monkey").setScale(0.1);
                    proj.type = "projectile";
                    proj.setData("speed", 2);
                    proj.setData("damage", 1);
                    this.my.group.projectiles.add(proj);
                }
            
            } else if (enemy.type === "elephant") {
                enemy.angleCounter += 0.03;
                enemy.x += Math.sin(enemy.angleCounter) * 2;
                enemy.y += Math.cos(enemy.angleCounter) * 0.5;
            
                //Fire elephant projectile
                if (Phaser.Math.Between(0, 100) < 0.5) {  // fire rate for elephant ships
                    let proj = this.add.sprite(enemy.x, enemy.y + 20, "elephant").setScale(0.2);
                    proj.type = "projectile";
                    proj.setData("speed", 1.5);
                    proj.setData("damage", 1);
                    this.my.group.projectiles.add(proj);
                }
            
            } else if (enemy.type === "boss") {
                enemy.x += 2 * enemy.dir;
                if (enemy.x < 100 || enemy.x > 700) enemy.dir *= -1;
            
                if (Phaser.Math.Between(0, 100) < 4) {
                    let type = Phaser.Math.Between(0, 1) === 0 ? "monkey" : "elephant";
                    let scale = type === "monkey" ? 0.1 : 0.2;
                    let speed = type === "monkey" ? 3 : 1.5;
                
                    let img = this.add.sprite(enemy.x, enemy.y + 30, type).setScale(scale);
                    img.type = "projectile";
                    img.setData("speed", speed);
                    img.setData("damage", 1);
                    this.my.group.projectiles.add(img);
                }
                
            }
            

            //Collision with laser
            if (this.laserActive && Phaser.Geom.Intersects.RectangleToRectangle(enemy.getBounds(), laser.getBounds())) {
                laser.setVisible(false);
                this.laserActive = false;

                if (enemy.type === "boss") {
                    enemy.hp -= 1;
                    if (enemy.hp <= 0) {
                        enemy.destroy();
                        this.score += 5;
                        this.nextWave();
                    }
                } else {
                    enemy.destroy();
                    this.score += enemy.type === "monkey" ? 2 : 3;
                    this.consecutiveHits += 1;
                    
                    //Award HP for streaks
                    let hpGained = 0;
                    if (this.consecutiveHits % 3 === 0) {
                        hpGained = 3;
                    } else if (this.consecutiveHits % 2 === 0) {
                        hpGained = 2;
                    }
                    
                    //Gaining HP
                    for (let i = 0; i < hpGained; i++) {
                        if (this.health < this.maxHealth) {
                            this.hpIcons[this.health].setVisible(true);
                            this.health++;
                        }
                    }
                    
                }

                this.updateUI();
            }
        });

        //Enemy projectile movement and collision
        my.group.projectiles.getChildren().forEach(proj => {
            proj.y += proj.getData("speed");
            if (proj.y > 600) proj.destroy();
          
            if (Phaser.Geom.Intersects.RectangleToRectangle(proj.getBounds(), player.getBounds())) {
                proj.destroy();
                this.consecutiveHits = 0;
            
                //Lose 1 point
                this.score = Math.max(0, this.score - 1);
            
                //Update the on‐screen score digits
                this.updateUI();
            
                //-HP
                this.health--;
            
                //Hide exactly that one icon
                if (this.health >= 0 && this.hpIcons[this.health]) {
                this.hpIcons[this.health].setVisible(false);
                }
            
                //If health hits zero, end the game
                if (this.health <= 0) {
                this.endGame();
                }
            }
        });

        //Wave clear
        if (my.group.enemies.countActive() === 0 && this.wave < 3) {
            this.wave++;
            this.spawnWave();
        }
    }

    nextWave() {
        if (this.wave < 3) {
            this.wave++;
            this.spawnWave();
        } else {
            this.endGame(true);
        }
    }

    endGame(victory = false) {
        this.gameOver = true;
      
        //Decide heading
        if (victory) {
          //Big “You Win!” text
          this.add.text(400, 250, "YOU WIN!", {
            fontSize: "48px",
            fill: "#00ff00",
            fontFamily: "Arial",
            fontStyle: "bold"
          }).setOrigin(0.5);
        } else {
          //Game Over graphic
          this.add.image(400, 250, "gameOver");
        }
      
        //Display the Final Score
        const labelY = victory ? 310 : 300;
        this.add.image(400, labelY, "scoreLabel").setOrigin(0.5);
      
        const scoreStr = String(this.score).padStart(4, "0");
        const digitY = labelY + 30;
        const digitWidth = 16, spacing = 8;
        const totalWidth = scoreStr.length * digitWidth + (scoreStr.length - 1) * spacing;
        const startX = 400 - totalWidth / 2 + digitWidth / 2;
      
        for (let i = 0; i < scoreStr.length; i++) {
          this.add
            .image(startX + i * (digitWidth + spacing), digitY, `num${scoreStr[i]}`)
            .setScale(0.8)
            .setOrigin(0.5);
        }
      
        //Restart prompt
        const restartText = this.add
          .text(400, digitY + 50, "Click to Restart", {
            fontSize: "24px",
            fill: "#ffffff",
            fontFamily: "Arial",
          })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });
      
        restartText.on("pointerup", () => this.scene.restart());
      }  
}   
