import { Client, Room } from "colyseus.js";
import fly01 from './../../assets/fly01.png';

// custom scene class
export class Part1Scene extends Phaser.Scene {
    // (...)



    client = new Client("ws://localhost:2567");
    room: Room;

    currentPlayer: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    playerEntities: { [sessionId: string]: Phaser.Types.Physics.Arcade.ImageWithDynamicBody } = {};

    localRef: Phaser.GameObjects.Rectangle;
    remoteRef: Phaser.GameObjects.Rectangle;

    debugFPS: Phaser.GameObjects.Text;
    cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

      // local input cache
    inputPayload = {
      left: false,
      right: false,
      up: false,
      down: false,
      tick: undefined
    };

    elapsedTime = 0
    fixedTimeStep = 1000/4

    currentTick: number = 0;




    //(...}

    preload() {
      // preload scene
      console.log(this.load.path)

      this.load.image('fly01', fly01);
      this.cursorKeys = this.input.keyboard.createCursorKeys();
      console.log("preloaded scene - ship", this.load.path);
      this.debugFPS = this.add.text(4,4, '', { color: '#ff0000',});
    }

    async create() {
      console.log("Joining room...");

      try {
        this.room = await this.client.joinOrCreate("my_room");
        console.log("Joined successfully!");

      } catch (e) {
        console.error(e);
      }
      //listen for new players
      this.room.state.players.onAdd((player, sessionId) => {
        const entity = this.physics.add.image(player.x, player.y, 'fly01');
        this.playerEntities[sessionId] = entity;
    
        if (sessionId === this.room.sessionId) {
            // this is the current player!
            // (we are going to treat it differently during the update loop)
            this.currentPlayer = entity;
    
            // remoteRef is being used for debug only
            this.localRef = this.add.rectangle(0, 0, entity.width, entity.height);
            this.localRef.setStrokeStyle(1, 0xff0000);
            this.remoteRef = this.add.rectangle(0, 0, entity.width, entity.height);
            this.remoteRef.setStrokeStyle(1, 0xff0000);
    
            player.onChange(() => {
                this.remoteRef.x = player.x;
                this.remoteRef.y = player.y;
            });
    
        } else {
            // all remote players are here!
            // (same as before, we are going to interpolate remote players)
            player.onChange(() => {
                entity.setData('serverX', player.x);
                entity.setData('serverY', player.y);
            });
        }
    });

      this.room.state.players.onRemove((player, sessionId) => {
        const entity = this.playerEntities[sessionId];
        if (entity) {
            // destroy entity
            entity.destroy();

            //clear local reference
            delete this.playerEntities[sessionId];
        }
      });
    }
    
    


    update(time: number, delta: number ): void {
      // skip loop if not connected with room yet.
      if (!this.currentPlayer) {return; }
    
      this.elapsedTime += delta;
      while (this.elapsedTime >= this.fixedTimeStep) {
        this.elapsedTime -= this.fixedTimeStep;
        this.fixedTick(time, this.fixedTimeStep);
      }
      this.debugFPS.text = `Frame rate: ${this.game.loop.actualFps}`;
    }

    fixedTick(time, delta) {
      this.currentTick++ //what does this do?
      // skip loop if not connected with room yet.

      if (!this.room) { return; }
    
      const velocity = 32;
      this.inputPayload.left = this.cursorKeys.left.isDown;
      this.inputPayload.right = this.cursorKeys.right.isDown;
      this.inputPayload.up = this.cursorKeys.up.isDown;
      this.inputPayload.down = this.cursorKeys.down.isDown;
      this.room.send(0, this.inputPayload);
      //console.log("sent input payload ", this.inputPayload);

      if (this.inputPayload.left){
          this.currentPlayer.x -= velocity;

      } else if (this.inputPayload.right) {
          this.currentPlayer.x += velocity;
      }

      if (this.inputPayload.up) {
          this.currentPlayer.y -= velocity;
      } else if (this.inputPayload.down) {
          this.currentPlayer.y += velocity;
      }

      this.localRef.x = this.currentPlayer.x;
      this.localRef.y = this.currentPlayer.y;

      for (let sessionId in this.playerEntities) {
        // do not interpolate the current player
        if (sessionId === this.room.sessionId) {
            continue;
        }

        //interpolate all other player entities
        const entity = this.playerEntities[sessionId];
        const { serverX, serverY } = entity.data.values;

        entity.x = Phaser.Math.Linear(entity.x, serverX, 1);
        entity.y = Phaser.Math.Linear(entity.y, serverY, 1);
      }
    }

}

