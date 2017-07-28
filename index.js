import * as RODIN from 'rodin/core';
import {screen} from './src/Screen.js';
import './src/Socket.js';

RODIN.start();
RODIN.Scene.add(new RODIN.Sculpt(new THREE.AmbientLight(0xffffff, 0.1)));

/**
 * Load our deck.obj model, when it will be ready add to the scene
 */
const deck = new RODIN.Sculpt('./models/deck/deck.obj');
deck.on(RODIN.CONST.READY, () => {
    RODIN.Scene.add(deck);
});

RODIN.Scene.add(screen);