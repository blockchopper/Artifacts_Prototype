import Phaser from "phaser";
import { Client, Room } from "colyseus.js";
import {SceneSelector} from "@scenes/SceneSelector"
import {GameScene1} from "@scenes/GameScene1"
import {GameScene2} from "@scenes/GameScene2"
import GridEngine from "grid-engine";

// game config
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    parent: 'phaser-example',
    physics: { default: "arcade" },
    pixelArt: true,
    scene: [ SceneSelector, GameScene1, GameScene2 ],
    autoCenter: Phaser.Scale.CENTER_BOTH,
    plugins: {
        scene: [
            {
                key: "gridEngine",
                plugin: GridEngine,
                mapping: "gridEngine",
            }
        ]
    }
};

// instantiate the game
const game = new Phaser.Game(config);