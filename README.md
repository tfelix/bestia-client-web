# Bestia Browsergame Client

[![Build Status](https://travis-ci.org/tfelix/bestia-client.svg?branch=master)](https://travis-ci.org/tfelix/bestia-client)

This is the client implementation of the [Bestia Browsergame](https://bestia-game.net).

Currently its meant as a development platform and as an introduction game, thus no connection to the server is established and is solely a single user game.

Later it will use the server and create an innovative 2D MMORPG.

> The game is under active development but I can only do so much. If you want to help in coding feel free to fork this repo and open some pull requests. :)
> 
> Documentation and Game Design goals can be found here: [https://tfelix.github.io/bestia-docs](https://tfelix.github.io/bestia-docs)
>
> You can also get in touch via [Discord](https://discord.gg/zZW8M2S). 

## Development

In order to build and run the client just do:

```
npm install && npm run dev
```

inside the main folder.

The game is build using an entity component system. The components are meant to be updated by the server in the future and are rendered during the update steps in the main loop.

The ActionRenderer are there to visualize entity based data which is not put into components like chat text or damage visualizations.

## Contributions

The licences of all artwork content used can be found in the 
[ASSETS.md](ASSETS.md) file. Without this free artwork this game would not have been possible. Thank you! Check out their great work!
