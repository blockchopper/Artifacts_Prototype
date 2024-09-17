import { Room, Client } from "@colyseus/core";
import { InputData, MyRoomState, Player } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  fixedTimeStep = 1000/60 //1000/4 is goal

  
  onCreate (options: any) {
    this.setState(new MyRoomState());

    this.state.mapWidth = 800;
    this.state.mapHeight = 600

    // handle player input
    this.onMessage(0, (client, input) => {
      // get reference to the player who sent the message
      const player = this.state.players.get(client.sessionId);

      //enqueue input to user input buffer
      player.inputQueue.push(input);
  
    });

    let elapsedTime = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;

      while (elapsedTime >= this.fixedTimeStep) {
        elapsedTime -= this.fixedTimeStep;
        this.fixedTick(this.fixedTimeStep);
      }
    });
  }


  fixedTick(timeStep: number) {
    const velocity = 2; //32 is goal, or rather, 1 tile per tick

    this.state.players.forEach(player => {
      let input: InputData;

      // dequeue player inputs
      while (input = player.inputQueue.shift()) {
        if (input.left) {
          player.x -= velocity;

        } else if (input.right) {
          player.x += velocity;
        }

        if (input.up) {
          player.y -= velocity;

        } else if (input.down) {
          player.y += velocity;
        }

        player.tick = input.tick;
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    // create Player instance
    const player = new Player();

    //place Player at a random position
    player.x = (Math.random() * this.state.mapWidth)
    player.y = (Math.random() * this.state.mapHeight)
    console.log("placed player at x = ", player.x, ", y = ", player.y)

    //place player in the map of players by its sessionId
    // (client.sessionId is unique per connection!)
    this.state.players.set(client.sessionId, player)
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
  
}
