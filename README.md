# Simpxit
## A web app that lets users play _Dixit_ with screencaps from _The Simpsons_

Simpxit is a web app that uses Express and the Socket.IO library to facilitate a multiplayer game with the rules of [_Dixit_](https://boardgamegeek.com/boardgame/39856/dixit) and images from [_The Simpsons_](https://www.disneyplus.com/series/the-simpsons/3ZoBZ52QHb4x) provided by [Frinkiac](https://frinkiac.com)'s API. \
 The frontend is a React app, and the game is currently deployed at [https://simpxit.fly.dev/](https://simpxit.gregexp.com).

Players start a game by either creating a room or joining an existing room with a 4-letter code.
Once more than 3 players are in a room, the player who created the room can start the game by clicking the "Start Game" button. 

## Future Plans
- There is no data persistence currently. 
This does not impede the way the app functions currently because games are relatively short and no data needs to be persisted between plays, but it would be neat to move data about gameplay states out of server memory and into a database.
This would allow the app to be scaled out instead of only scaled up.
I'm currently considering Redis with the RedisJSON module.
Redis is an ideal choice because Socket.IO has an [adapter](https://socket.io/blog/socket-io-redis-streams-adapter/) that enables the same set of events to be broadcast from a pool of servers. Also, the lack of need for long-term, relational data storage makes a document database a fitting choice.  
Alternatively, Postgres could provide a Socket.IO [adapter](https://socket.io/docs/v4/postgres-adapter/), and it is generally easier to find cheap/free Postgres hosting than Redis hosting. Data can be modeled in a relational style, but it also looks like Postgres has support for the JSONB datatype with a number of document database-style operations.  
Any viable database must have a Socket.IO adapter--this feature is necessary for scaling out.
Without some form of synchronization between server events, players connected to two different servers would not be able to receive real-time updates from server-to-client.
- Whenever the server updates the client currently, it sends the entire game state.
It is nice that this takes care of potential desync issues--if a client misses a single update from the server, it will get the information baked into the next update--but is more outgoing data than necessary.
This can be mitigated by only sending clients the data they need to transform their game state into the current game state.
In the event of disconnection, the entire game state _can_ be sent to the client on reconnection to get them up-to-date, but we do not need to do so for every update.
Possible implementations that only send clients the data they need to transform their Room objects into the current game state could be defining a specific event type for every kind of update or (what I'm leaning toward) defining another event type called something like `partialUpdate` that just sends updates in [JSON Patch](https://jsonpatch.com/) format.
- Currently the site design is usable, but it is not exactly good-looking. I'd like to improve on the design as a way to increase my CSS skills. Perhaps changing card info to text on the back of cards and allowing them to be flipped in 3D space?
- Update favicon, icons, and manifest.
- Server-side image processing to rule out images that are all or mostly all one color would improve gameplay experience. Sometimes players receive images of the show credits or fade-in/out transition frames that are difficult to give clues for.

