import Phaser from "phaser";

export class SceneSelector extends Phaser.Scene {

    versions = {
        '1': "interpolated other players, fixed Tickrate free movement 8dir",
        '2': "grid based movement 8dir",
    };

    constructor() {
        super({ key: "selector", active: true });
    }

    preload() {
        // update menu background color
        this.cameras.main.setBackgroundColor(0x000000);


    }

    create() {
        // automatically navigate to hash scene if provided
        if (window.location.hash) {
            this.runScene(window.location.hash.substring(1));
            return;
        }

        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            color: "#ff0000",
            fontSize: "32px",
            // fontSize: "24px",
            fontFamily: "Arial"
        };

        for (let ver in this.versions) {
            const index = parseInt(ver) - 1;
            const label = this.versions[ver];

            // this.add.text(32, 32 + 32 * index, `Part ${partNum}: ${label}`, textStyle)
            this.add.text(130, 150 + 70 * index, `GameScene ${ver}: ${label}`, textStyle)
                .setInteractive()
                .setPadding(6)
                .on("pointerdown", () => {
                    this.runScene(`GameScene${ver}`);
                    
                });
        }
    }

    runScene(key: string) {
        console.log(`running ${key}`)
        this.game.scene.switch("selector", key)
    }

}