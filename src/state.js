/* global Phaser */

class State extends Phaser.State {
    constructor() {
        super();
        this.safeTiles = [1,2,3];
        this.threshold = 3;
        this.gridSize = 64;
        this.direction = Phaser.NONE;
        this.lastCollision = new Phaser.Point();
        this.turning = {
            point: new Phaser.Point(),
            direction: Phaser.NONE,
        };
    }

    init() {
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.cursors = this.input.keyboard.createCursorKeys();
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
        this.layer = this.map.createLayer("layer");
        this.map.setCollision([4,5,6], true, this.layer);

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
        player.maxSpeed = 150;
        this.player = player;
        player.anchor.setTo(0.5);

        this.physics.arcade.enable(player);
        player.body.collideWorldBounds = true;
        player.body.setSize(60, 60, 2, 82 - 64);
        player.body.offset.x = 10;

        player.animations.add("left", [0, 1, 2, 3], 10, true);
        player.animations.add("up", [0, 1, 2, 3], 10, true);
        player.animations.add("right", [0, 1, 2, 3], 10, true);
        player.animations.add("down", [0, 1, 2, 3], 10, true);

        this.score = 0;
        this.scoreText = this.add.text(16, 16, "Score: 0", { fontSize: "32px", fill: "#fff" });
    }

    update() {
        const player = this.player;

        const collision = this.physics.arcade.collide(player, this.layer, this.saveWallCollision, null, this);
        this.physics.arcade.overlap(player, this.stuff, this.collectStuff, null, this);

        // player.body.velocity.setTo(0, 0);

        // this.marker.x = this.math.snapToFloor(Math.floor(player.x), this.gridSize) / this.gridSize;
        // this.marker.y = this.math.snapToFloor(Math.floor(player.y), this.gridSize) / this.gridSize;

        // this.directions[1] = this.map.getTileLeft(this.layer.index, this.marker.x, this.marker.y);
        // this.directions[2] = this.map.getTileRight(this.layer.index, this.marker.x, this.marker.y);
        // this.directions[3] = this.map.getTileAbove(this.layer.index, this.marker.x, this.marker.y);
        // this.directions[4] = this.map.getTileBelow(this.layer.index, this.marker.x, this.marker.y);
        this.checkKeys(collision);
    }

    saveWallCollision(player, wall) {
        this.lastCollision.x = wall.x;
        this.lastCollision.y = wall.y;
    }

    getDesiredDirection() {
        if (this.cursors.left.isDown)
            return Phaser.LEFT;
        if (this.cursors.right.isDown)
            return Phaser.RIGHT;
        if (this.cursors.up.isDown)
            return Phaser.UP;
        if (this.cursors.down.isDown)
            return Phaser.DOWN;
        return Phaser.NONE;
    }

    tryMove(direction) {
        const player = this.player;
        const speed = this.player.maxSpeed;
        player.body.velocity.setTo(0, 0);
        switch(direction) {
        case Phaser.LEFT:
            player.body.velocity.x = -speed;
            player.animations.play("left");
            break;
        case Phaser.RIGHT:
            player.body.velocity.x = +speed;
            player.animations.play("right");
            break;
        case Phaser.UP:
            player.body.velocity.y = -speed;
            player.animations.play("up");
            break;
        case Phaser.DOWN:
            player.body.velocity.y = +speed;
            player.animations.play("down");
            break;
        default:
            player.animations.stop();
            player.frame = 1;
        }
    }

    checkKeys(collision) {
        let direction = this.getDesiredDirection();
        if (this.direction != direction) {
            this.direction = direction;
            this.tryMove(direction);
        } else if (collision) {
            this.bypass();
        } else if (this.turning.direction != Phaser.NONE) {
            var cx = Math.floor(this.player.body.center.x);
            var cy = Math.floor(this.player.body.center.y);
            if (this.math.fuzzyEqual(cx, this.turning.point.x, this.threshold) &&
                this.math.fuzzyEqual(cy, this.turning.point.y, this.threshold)) {
                this.player.body.center.x = this.turning.point.x;
                this.player.body.center.y = this.turning.point.y;
                this.player.body.reset(this.turning.point.x, this.turning.point.y);
                this.tryMove(this.direction);
                this.turning.direction = Phaser.NONE;
            }
        }
    }

    bypass() {
        const player = this.player;
        const dy = this.lastCollision.y * this.gridSize - player.body.y;
        if (Math.abs(dy) < this.gridSize/4) {
            return;
        }
        const tile = (dy > 0)
              ? this.map.getTileAbove(this.layer.index, this.lastCollision.x, this.lastCollision.y)
              : this.map.getTileBelow(this.layer.index, this.lastCollision.x, this.lastCollision.y);
        this.turning.direction = Phaser.LEFT;
        this.turning.point.x = player.body.center.x;
        this.turning.point.y = tile.y * this.gridSize + this.gridSize/2;
        player.body.velocity.y = this.player.maxSpeed * (dy < 0 ? +1 : -1);
        player.body.velocity.x = 0;
    }

    render() {
        this.game.debug.geom(new Phaser.Rectangle(this.lastCollision.x * 64, this.lastCollision.y * 64, 64, 64), "rgba(0, 255, 0, 0.5)", true);
        this.game.debug.geom(new Phaser.Rectangle(this.player.body.x, this.player.body.y, 60, 60), "rgba(0, 0, 0, 0.5)", true);
        this.game.debug.geom(new Phaser.Point(this.turning.point.x, this.turning.point.y), '#ffff00');
        this.game.debug.geom(new Phaser.Point(this.player.body.center.x, this.player.body.center.y), '#ff00ff');
    }

    collectStuff(player, stuff) {
        stuff.kill();
        this.score += 10;
        this.scoreText.text = `Score: ${this.score}`;
    }
}
