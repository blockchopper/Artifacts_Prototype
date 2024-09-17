import Phaser from "phaser";
import { Client, Room } from "colyseus.js";
import {GameScene} from "./src/scenes/GameScene"

// game config
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    parent: 'phaser-example',
    physics: { default: "arcade" },
    pixelArt: true,
    scene: [ GameScene ],
    autoCenter: Phaser.Scale.CENTER_BOTH,
};

// instantiate the game
const game = new Phaser.Game(config);