/* global Phaser */

class State extends Phaser.State {
    init() {
        this.physics.startSystem(Phaser.Physics.ARCADE);
    }

    preload() {
        this.load.image("barrel", "assets/barrel.png");
        this.load.image("chest", "assets/chest.png");
        this.load.spritesheet("dude", "assets/dude.png", 64, 82);

        this.load.tilemap("map", "assets/maps/main.json", null, Phaser.Tilemap.TILED_JSON);
        this.load.image("tiles", "assets/tiles.png");
    }

    create() {
        this.map = this.add.tilemap("map");
        this.map.addTilesetImage("tiles", "tiles");
        this.ground = this.map.createLayer("ground");
        this.walls = this.map.createLayer("walls");
        this.map.setCollision([4,5,6], true, this.walls);

        this.stuff = this.add.group();
        this.stuff.enableBody = true;

        for (var i = 0; i < 12; i++) {
            const shit = this.stuff.create(
                Math.floor(Math.random() * 16) * 64,
                Math.floor(Math.random() * 16) * 64,
                (Math.random() > 0.5) ? "barrel" : "chest"
            );
        }

        const player = this.add.sprite(this.world.centerX, this.world.centerY, "dude");
        this.player = player;
        player.anchor.setTo(0.5);

        this.physics.arcade.enable(player);
        player.body.collideWorldBounds = true;
        player.body.setSize(64, 64, 0, 82 - 64);

        player.animations.add("left", [0, 1, 2, 3], 10, true);
        player.animations.add("up", [0, 1, 2, 3], 10, true);
        player.animations.add("right", [0, 1, 2, 3], 10, true);
        player.animations.add("down", [0, 1, 2, 3], 10, true);

        this.score = 0;
        this.scoreText = this.add.text(16, 16, "Score: 0", { fontSize: "32px", fill: "#fff" });
    }

    update() {
        const player = this.player;

        this.physics.arcade.collide(player, this.walls);
        this.physics.arcade.overlap(player, this.stuff, this.collectStuff.bind(this), null, this);


        const cursors = this.input.keyboard.createCursorKeys();

        player.body.velocity.setTo(0, 0);

        const speed = 250;
        if (cursors.left.isDown) {
            player.body.velocity.x = -speed;
            player.animations.play("left");
        } else if (cursors.right.isDown) {
            player.body.velocity.x = speed;
            player.animations.play("right");
        }
        if (cursors.up.isDown) {
            player.body.velocity.y = -speed;
            player.animations.play("up");
        } else if (cursors.down.isDown) {
            player.body.velocity.y = speed;
            player.animations.play("down");
        }

        if (player.body.velocity.x == 0 && player.body.velocity.y == 0){
            player.animations.stop();
            player.frame = 1;
        }
    }

    collectStuff(player, stuff) {
        stuff.kill();
        this.score += 10;
        this.scoreText.text = `Score: ${this.score}`;
    }
}
