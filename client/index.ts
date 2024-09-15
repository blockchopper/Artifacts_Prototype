import Phaser from "phaser";
import { Client, Room } from "colyseus.js";
import {Part1Scene} from "./src/scenes/Part1Scene"

// game config
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#b6d53c',
    parent: 'phaser-example',
    physics: { default: "arcade" },
    pixelArt: true,
    scene: [ Part1Scene ],
};

// instantiate the game
const game = new Phaser.Game(config);