import { Client, Room } from "colyseus.js";
import fly01 from '@assets/fly01.png';
import spritesheet from '@assets/spritesheet.png';
import tilemap from '@assets/maps/testmap16_1.json';
import playerSpritesheet from '@assets/characters/player/Player.png'

// custom scene class
export class GameScene1 extends Phaser.Scene {
    // (...)



    client = new Client("ws://localhost:2567");
    room: Room;

    currentPlayer: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
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
    fixedTimeStep = 1000/60 // 1000/4 is goal for rhythm movement

    currentTick: number = 0;

    constructor() {
      super({ key: "GameScene1" });
  }


    //(...}

    preload() {
      // preload scene
      console.log(this.load.path)

      this.load.image("tiles", spritesheet);
      this.load.image('fly01', fly01);
      this.load.spritesheet("playerSpritesheet", playerSpritesheet, {frameWidth: 32, frameHeight: 32,});
      this.load.tilemapTiledJSON('map', tilemap);
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
      // Load Map from Spritesheet, create Layers
      const map = this.make.tilemap ({ key: "map", tileWidth: 16, tileHeight: 16});
      const tileset = map.addTilesetImage('KenneyRPG', 'tiles')
      const groundLayer = map.createLayer('Ground', tileset,0,0);
      const rockLayer = map.createLayer('Rock', tileset,0,0);
      const dirtLayer = map.createLayer('Dirt', tileset,0,0);
      const clutterLayer = map.createLayer('Plants and Rocks', tileset,0,0);
      //const collisionLayer = map.createLayer('Collision', tileset,0,0);






      //listen for new players
      this.room.state.players.onAdd((player, sessionId) => {

        //player animation from sprites
        this.anims.create({
          key: 'idle',
          frames: this.anims.generateFrameNumbers("playerSpritesheet", {frames:[0,1,2,3,4,5]}),
          frameRate: 6,
          repeat: -1,
        })
        this.anims.create({
          key: 'idleX',
          frames: this.anims.generateFrameNumbers("playerSpritesheet", {frames:[6,7,8,9,10,11]}),
          frameRate: 6,
          repeat: -1,
        })
        this.anims.create({
          key: 'idleY',
          frames: this.anims.generateFrameNumbers("playerSpritesheet", {frames:[12,13,14,15,16,17]}),
          frameRate: 6,
          repeat: -1,
        })
        this.anims.create({
          key: 'walk',
          frames: this.anims.generateFrameNumbers("playerSpritesheet", {frames:[18,19,20,21,22,23]}),
          frameRate: 15,
          repeat: -1,
        })
        this.anims.create({
          key: 'walkX',
          frames: this.anims.generateFrameNumbers("playerSpritesheet", {frames:[24,25,26,27,28,29]}),
          frameRate: 15,
          repeat: -1,
        })
        this.anims.create({
          key: 'walkY',
          frames: this.anims.generateFrameNumbers("playerSpritesheet", {frames:[30,31,32,33,34,35]}),
          frameRate: 15,
          repeat: -1,
        })

        const entity = this.physics.add.sprite(player.x, player.y, "playerSpritesheet");
        entity.play("idle", true);

        //const entity = this.physics.add.image(player.x, player.y, 'fly01');
        this.playerEntities[sessionId] = entity;
    
        if (sessionId === this.room.sessionId) {
            // this is the current player!
            // (we are going to treat it differently during the update loop)
            this.currentPlayer = entity;
            this.cameras.main.startFollow(this.currentPlayer)
            this.cameras.main.setZoom(2);
            //this.physics.add.collider(this.currentPlayer, collisionLayer);
            //collisionLayer.setCollisionBetween(0,200)
    
            // remoteRef is being used for debug only
            this.localRef = this.add.rectangle(0, 0, entity.width, entity.height);
            this.localRef.setStrokeStyle(1, 0xff0000);
            this.remoteRef = this.add.rectangle(0, 0, entity.width, entity.height);
            this.remoteRef.setStrokeStyle(1, 0xff0000);
             // SERVER MOVEMENT DEBUG
    
            /*player.onChange(() => {
                this.remoteRef.x = player.x;
                this.remoteRef.y = player.y;
            }); */ //SERVER MOVEMENT DEBUG
    
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
    
    


    update(time: number, delta: number, ): void {
      // skip loop if not connected with room yet.
      if (!this.currentPlayer) {return; }
    
      this.elapsedTime += delta;
      while (this.elapsedTime >= this.fixedTimeStep) {
        this.elapsedTime -= this.fixedTimeStep;
        this.fixedTick(time, this.fixedTimeStep, );
      }
      this.debugFPS.text = `Frame rate: ${this.game.loop.actualFps}`;
    }

    fixedTick(time, delta,) {
      this.currentTick++ //what does this do?
      // skip loop if not connected with room yet.

      if (!this.room) { return; }
    
      const velocity = 2; //32 is goal, or rather, 1 tile per tick
      this.inputPayload.left = this.cursorKeys.left.isDown;
      this.inputPayload.right = this.cursorKeys.right.isDown;
      this.inputPayload.up = this.cursorKeys.up.isDown;
      this.inputPayload.down = this.cursorKeys.down.isDown;
      this.room.send(0, this.inputPayload);
      //console.log("sent input payload ", this.inputPayload);



      if (this.inputPayload.left){
          this.currentPlayer.x -= velocity;
          this.currentPlayer.setFlipX(true);
          this.currentPlayer.play("walkX", true);
          
      } else if (this.inputPayload.right) {
          this.currentPlayer.x += velocity;
          this.currentPlayer.setFlipX(false);
          this.currentPlayer.play("walkX", true);
      }

      if (this.inputPayload.up) {
          this.currentPlayer.y -= velocity;
          if (this.inputPayload.right) {
            this.currentPlayer.setFlipX(false);
            this.currentPlayer.play("walkX", true);
          } else if (this.inputPayload.left) {
            this.currentPlayer.setFlipX(true);
            this.currentPlayer.play("walkX", true);
          } else{
            this.currentPlayer.play("walkY", true);}

      } else if (this.inputPayload.down) {
          this.currentPlayer.y += velocity;
          if (this.inputPayload.right) {
            this.currentPlayer.setFlipX(false);
            this.currentPlayer.play("walkX", true);
          } else if (this.inputPayload.left) {
            this.currentPlayer.setFlipX(true);
            this.currentPlayer.play("walkX", true);
          } else{
            this.currentPlayer.play("walk", true);}
      }
      if (!this.inputPayload){
        this.currentPlayer.play("idle",true);
      }


      //this.localRef.x = this.currentPlayer.x;
      //this.localRef.y = this.currentPlayer.y;

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

