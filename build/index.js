System.register(['rodin/core', './src/Screen.js', './src/Socket.js'], function (_export, _context) {
  "use strict";

  var RODIN, screen;
  return {
    setters: [function (_rodinCore) {
      RODIN = _rodinCore;
    }, function (_srcScreenJs) {
      screen = _srcScreenJs.screen;
    }, function (_srcSocketJs) {}],
    execute: function () {

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
    }
  };
});