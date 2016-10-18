/* global Phaser, State */

let game = new Phaser.Game(800, 600, Phaser.AUTO, "");

main();

function main() {
    game.state.add("main", new State(), true);
}
