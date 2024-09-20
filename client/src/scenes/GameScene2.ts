import { Client, Room } from "colyseus.js";
import spritesheet from './../../assets/spritesheet.png';
import tilemap from './../../assets/maps/testmap16_1.json';
import playerSpritesheet from './../../assets/characters/player/Player.png'
import GridEngine from "grid-engine";
import { LEFT } from "phaser";



export class GameScene2 extends Phaser.Scene {

    client = new Client("ws://localhost:2567");
    room: Room;

    //currentPlayer: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

    //playerEntities: { [sessionId: string]: Phaser.Types.Physics.Arcade.ImageWithDynamicBody } = {};

    //localRef: Phaser.GameObjects.Rectangle;
    //remoteRef: Phaser.GameObjects.Rectangle;

    debugFPS: Phaser.GameObjects.Text;

    cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    playerSprite;
    facingDirectionText;
    facingPositionText;

    elapsedTime = 0;
    fixedTimeStep = 1000/4;
    currentTick: number = 0;

    gridEngine: GridEngine;

      // local input cache for enqueueing, dequeueing
    /*inputPayload = {
      left: false,
      right: false,
      up: false,
      down: false,
      tick: undefined
    };*/

    /*elapsedTime = 0
    fixedTimeStep = 1000/60 // 1000/4 is goal for rhythm movement
    currentTick: number = 0;
    */

    constructor() {
      super({ key: "GameScene2" });
  }



    preload() {
      this.load.image("tiles", spritesheet);
      this.load.spritesheet("playerSpritesheet", playerSpritesheet, {frameWidth: 32, frameHeight: 32,});
      this.load.tilemapTiledJSON('map', tilemap);

      //this.cursorKeys = this.input.keyboard.createCursorKeys();
      console.log("preloaded scene", this.load.path);

    }

    async create() {
      /*console.log("Joining room...");

      try {
        this.room = await this.client.joinOrCreate("my_room");
        console.log("Joined successfully!");

      } catch (e) {
        console.error(e);
      }*/

      // Load Map from Spritesheet, create Layers
      const map = this.make.tilemap ({ key: "map", tileWidth: 16, tileHeight: 16});
      const tileset = map.addTilesetImage('KenneyRPG', 'tiles')
      const groundLayer = map.createLayer('Ground', tileset,0,0);
      const rockLayer = map.createLayer('Rock', tileset,0,0);
      const dirtLayer = map.createLayer('Dirt', tileset,0,0);
      const clutterLayer = map.createLayer('Plants and Rocks', tileset,0,0);
      const collisionLayer = map.createLayer('Collision', tileset,0,0);
      /*for (let i = 0; i < map.layers.length; i++) {
        const layer = map.createLayer(i, "mapLayer", 0, 0);
        layer.scale = 3;
      }
      */
      this.playerSprite = this.add.sprite(0,0, 'playerSpritesheet');

      this.facingDirectionText = this.add.text(10, 10, '');
      this.facingPositionText = this.add.text(10, 10, '');

      
      this.cameras.main.startFollow(this.playerSprite, true);
      this.cameras.main.setZoom(2);
      this. cameras.main.setFollowOffset(
        -this.playerSprite.width,
        -this.playerSprite.height,
      )



      this.debugFPS = this.add.text(4,4, '', { color: '#ff0000',});


      //gridEngine Setup
      const gridEngineConfig = {
        characters: [
          {
            id: 'player',
            sprite: this.playerSprite,
              //walkingAnimationMapping: 5,
            startPosition: {x: 40, y: 40},
          },
        ],
        numberOfDirections: 8,
        
      };

      this.gridEngine.create(
        map, //Phaser.Tilemaps.Tilemap
        gridEngineConfig,
      );
      /////////////////
      // Animations //
      ////////////////
      createPlayerAnimation.call(this, 'up', 30, 35,);
      createPlayerAnimation.call(this, 'right', 24, 29);
      createPlayerAnimation.call(this, 'down', 18, 23);
      createPlayerAnimation.call(this, 'left', 24, 29);
      createPlayerAnimation.call(this, 'up-left', 24, 29, 15);
      createPlayerAnimation.call(this, 'up-right', 24, 29, 15);
      createPlayerAnimation.call(this, 'down-right', 24, 29, 15);
      createPlayerAnimation.call(this, 'down-left', 24, 29, 15);

      this.anims.create({
        key: 'idle-down',
        frames: this.anims.generateFrameNumbers("playerSpritesheet", {frames:[0,1,2,3,4,5]}),
        frameRate: 6,
        repeat: -1,
      })
      this.anims.create({
        key: 'idle-right',
        frames: this.anims.generateFrameNumbers("playerSpritesheet", {frames:[6,7,8,9,10,11]}),
        frameRate: 6,
        repeat: -1,
      })
      this.anims.create({
        key: 'idle-up',
        frames: this.anims.generateFrameNumbers("playerSpritesheet", {frames:[12,13,14,15,16,17]}),
        frameRate: 6,
        repeat: -1,
      })


      this.gridEngine.movementStarted().subscribe(({ direction }) => {
        this.playerSprite.anims.play(direction);
      });
    
      this.gridEngine.movementStopped().subscribe(({ direction }) => {
        if (direction.includes('left')) {
          this.playerSprite.setFlipX(true)
          this.playerSprite.anims.play('idle-right')
        } else if (direction.includes('right')) {
          this.playerSprite.setFlipX(false)
          this.playerSprite.anims.play('idle-right')
        } else {
          this.playerSprite.anims.play(`idle-${direction}`)
        }
      
        //this.playerSprite.setFrame(getStopFrame(direction));
      });
    
      this.gridEngine.directionChanged().subscribe(({ direction }) => {
        this.playerSprite.setFrame(getStopFrame(direction));
        console.log('changed direction to ', direction)
      });
    }
      






      //listen for new players -> multiplayer stuff
      /*
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
    
            player.onChange(() => {
                this.remoteRef.x = player.x;
                this.remoteRef.y = player.y;
            });  //SERVER MOVEMENT DEBUG
    
        } else {
            // all remote players are here!
            // (same as before, we are going to interpolate remote players)
            player.onChange(() => {
                entity.setData('serverX', player.x);
                entity.setData('serverY', player.y);
            });
        }
      
    
    }); */

    /*
      this.room.state.players.onRemove((player, sessionId) => {
        const entity = this.playerEntities[sessionId];
        if (entity) {
            // destroy entity
            entity.destroy();

            //clear local reference
            delete this.playerEntities[sessionId];
        }
      }); */
    



    update(time: number, delta: number, ): void {
      // skip loop if not connected with room yet.
      /*if (!this.currentPlayer) {return; }
    
      this.elapsedTime += delta;
      while (this.elapsedTime >= this.fixedTimeStep) {
        this.elapsedTime -= this.fixedTimeStep;
        this.fixedTick(time, this.fixedTimeStep, );
      }*/

      this.elapsedTime += delta;
      while (this.elapsedTime >= this.fixedTimeStep) {
        this.elapsedTime -= this.fixedTimeStep;
        this.fixedTick(time, this.fixedTimeStep, );

      }
      this.debugFPS.text = `Frame rate: ${this.game.loop.actualFps}`;

      
    } 

    fixedTick(time, delta,) {
      this.currentTick++
      console.log('executed fixed tick number ', this.currentTick)
      const cursors = this.input.keyboard.createCursorKeys();
      if (cursors.left.isDown && cursors.up.isDown) {
        //@ts-ignore
        this.gridEngine.move("player", "up-left");
        this.playerSprite.setFlipX(true);
      } else if (cursors.left.isDown && cursors.down.isDown) {
        //@ts-ignore
        this.gridEngine.move("player", "down-left");
        this.playerSprite.setFlipX(true);
      } else if (cursors.right.isDown && cursors.up.isDown) {
        //@ts-ignore
        this.gridEngine.move("player", "up-right");
        this.playerSprite.setFlipX(false);
      } else if (cursors.right.isDown && cursors.down.isDown) {
        //@ts-ignore
        this.gridEngine.move("player", "down-right");
        this.playerSprite.setFlipX(false);
      } else if (cursors.left.isDown) {
        //@ts-ignore
        this.gridEngine.move("player", "left");
        this.playerSprite.setFlipX(true);
      } else if (cursors.right.isDown) {
        //@ts-ignore
        this.gridEngine.move("player", "right");
        this.playerSprite.setFlipX(false);
      } else if (cursors.up.isDown) {
        //@ts-ignore
        this.gridEngine.move("player", "up");
      } else if (cursors.down.isDown) {
        //@ts-ignore
        this.gridEngine.move("player", "down");
      };

      this.facingDirectionText.text = 'facingDirection: '
      + this.gridEngine.getFacingDirection('player');
      this.facingPositionText.text = 'facingPosition: ('
      + this.gridEngine.getFacingPosition('player').x + ', '
      + this.gridEngine.getFacingPosition('player').y + ')';

    }

    /*
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
    */

  
}

function createPlayerAnimation(
  name,
  startFrame,
  endFrame,
) {
  this.anims.create({
    key: name,
    frames: this.anims.generateFrameNumbers('playerSpritesheet', {
      start: startFrame,
      end: endFrame,
    }),
    frameRate: 10,
    repeat: -1,
    yoyo: false,
  });
}

function getStopFrame(direction) {
  switch (direction) {
    case 'up':
      return 12;
    case 'right':
      return 6;
    case 'down':
      return 0;
    case 'left':
      return 6;
  }
}