# Bestia Browsergame Client

[![Build Status](https://travis-ci.org/tfelix/bestia-client.svg?branch=master)](https://travis-ci.org/tfelix/bestia-client)

This is the client implementation of the [Bestia Browsergame](https://bestia-game.net).

Currently its meant as a development platform and as an introduction game, thus no connection to the server is established and is solely a single user game.

Later it will use the server and create an innovative 2D MMORPG.

## Development

In order to build and run the client just do:

```
npm install && npm run dev
```

inside the main folder.

The game is build using an entity component system. The components are meant to be updated by the server in the future and are rendered during the update steps in the main loop.

The ActionRenderer are there to visualize entity based data which is not put into components like chat text or damage visualizations.

## Contributions

The art currently used in this game is from:

* [LPC Sprite Sheet Generator](http://gaurav.munjal.us/Universal-LPC-Spritesheet-Character-Generator/) (CC-BY-SA2)
* [Hyptosis Tilesheets](https://opengameart.org/content/lots-of-hyptosis-tiles-organized) (CC-BY 3.0)
