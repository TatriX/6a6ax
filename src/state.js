/* global Phaser */

class State extends Phaser.State {
    preload() {
        this.load.image("logo", "assets/logo.png");
        this.load.image("ground", "assets/ground.png");
        this.load.image("barrel", "assets/barrel.png");
        this.load.image("chest", "assets/chest.png");
        this.load.spritesheet("dude", "assets/dude.png", 64, 82);
    }

    create() {
        this.score = 0;
        this.scoreText = this.add.text(16, 16, "Score: 0", { fontSize: "32px", fill: "#fff" });

        this.logo = this.add.sprite(this.world.centerX, this.world.centerY, "logo");
        this.logo.anchor.setTo(0.5, 0.5);
        this.logo.alpha = 0.25;
        this.logo.Dalpha = 0.001;

        this.physics.startSystem(Phaser.Physics.ARCADE);

        this.stuff = this.add.group();
        this.stuff.enableBody = true;

        for (var i = 0; i < 12; i++) {
            const shit = this.stuff.create(i * 70, 0, (Math.random() > 0.5) ? "barrel" : "chest");
            shit.body.gravity.y = 300;
            shit.body.bounce.y = 0.7 + Math.random() * 0.2;
        }

        this.platforms = this.add.group();
        this.platforms.enableBody = true;

        const ground = this.platforms.create(0, this.world.height - 64, "ground");
        ground.scale.setTo(16, 1);
        ground.body.immovable = true;

        let ledge = this.platforms.create(400, 400, "ground");
        ledge.body.immovable = true;

        ledge = this.platforms.create(-150, 250, "ground");
        ledge.body.immovable = true;


        const player = this.add.sprite(this.world.centerX, this.world.centerY, "dude");
        this.player = player;
        player.anchor.setTo(0.5);

        this.physics.arcade.enable(player);

        player.body.bounce.y = 0.2;
        player.body.gravity.y = 400;
        player.body.collideWorldBounds = true;

        player.animations.add("left", [0, 1, 2, 3], 10, true);
        player.animations.add("right", [0, 1, 2, 3], 10, true);
    }

    update() {
        if (this.logo.alpha > 0.4 || this.logo.alpha < 0.2) {
            this.logo.Dalpha = - this.logo.Dalpha;
        }
        this.logo.alpha += this.logo.Dalpha;

        const player = this.player;

        this.physics.arcade.collide(this.stuff, this.platforms);
        this.physics.arcade.overlap(player, this.stuff, this.collectStuff.bind(this), null, this);

        const hitPlatform = this.physics.arcade.collide(this.player, this.platforms);

        const cursors = this.input.keyboard.createCursorKeys();
        player.body.velocity.x = 0;

        const speed = 150;
        if (cursors.left.isDown) {
            player.body.velocity.x = -speed;
            player.animations.play("left");
        } else if (cursors.right.isDown) {
            player.body.velocity.x = speed;
            player.animations.play("right");
        } else {
            player.animations.stop();
            player.frame = 1;
        }

        if (cursors.up.isDown && player.body.touching.down && hitPlatform) {
            player.body.velocity.y = -350;
        }
    }

    collectStuff(player, stuff) {
        stuff.kill();
        this.score += 10;
        this.scoreText = `Score: ${this.score}`;
    }
}
