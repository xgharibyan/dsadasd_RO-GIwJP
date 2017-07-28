System.register(['rodin/core'], function (_export, _context) {
    "use strict";

    var RODIN;
    return {
        setters: [function (_rodinCore) {
            RODIN = _rodinCore;
        }],
        execute: function () {
            /**
             * Class for creating an avatar character with a head and hands 
             */
            class Character extends RODIN.Sculpt {
                constructor() {
                    super();

                    this.head = new RODIN.Sculpt('models/character/head.obj');
                    this.hands = {
                        left: new RODIN.Sculpt('models/character/hand_left.obj'),
                        right: new RODIN.Sculpt('models/character/hand_right.obj')
                    };

                    this.head.on(RODIN.CONST.READY, () => {
                        this.head._threeObject.children[0].material.transparent = true;
                        this.add(this.head);
                    });
                    this.hands.left.on(RODIN.CONST.READY, () => {
                        this.hands.left._threeObject.children[0].material.transparent = true;
                        this.add(this.hands.left);

                        this.hideObject(RODIN.GamePad.viveLeft.controllerModel);
                        this.hideObject(RODIN.GamePad.oculusTouchLeft.controllerModel);

                        RODIN.GamePad.viveLeft.sculpt.add(this.hands.left.clone());
                        RODIN.GamePad.oculusTouchLeft.sculpt.add(this.hands.left.clone());
                    });
                    this.hands.right.on(RODIN.CONST.READY, () => {
                        this.hands.right._threeObject.children[0].material.transparent = true;
                        this.add(this.hands.right);

                        this.hideObject(RODIN.GamePad.viveRight.controllerModel);
                        this.hideObject(RODIN.GamePad.oculusTouchRight.controllerModel);

                        RODIN.GamePad.viveRight.sculpt.add(this.hands.right.clone());
                        RODIN.GamePad.oculusTouchRight.sculpt.add(this.hands.right.clone());

                        RODIN.GamePad.viveRight.initRaycastingLine();
                    });

                    this.hideObject = object => {
                        if (object.isReady) {
                            object.visible = false;
                        } else {
                            object.on(RODIN.CONST.READY, () => {
                                object.visible = false;
                            });
                        }
                    };
                }
            }

            _export('Character', Character);
        }
    };
});