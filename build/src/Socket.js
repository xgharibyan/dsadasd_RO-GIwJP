System.register(['rodin/core', './Character.js', './Screen.js', './initialPositions.js'], function (_export, _context) {
    "use strict";

    var RODIN, Character, screen, initialPositions;
    return {
        setters: [function (_rodinCore) {
            RODIN = _rodinCore;
        }, function (_CharacterJs) {
            Character = _CharacterJs.Character;
        }, function (_ScreenJs) {
            screen = _ScreenJs.screen;
        }, function (_initialPositionsJs) {
            initialPositions = _initialPositionsJs.initialPositions;
        }],
        execute: function () {

            /**
             * Creates an empty object for saving active users
             * @type {{}}
             */
            const activeUsers = {};

            /**
             * Creates a new character from Character class.
             * Adds it to activeUsers object by initial socketId, sets character in initial position, and adds to the scene
             * @param {RODIN.Vector3} position
             * @param {Number} socketId
             */
            function createNewCharacter(position, socketId) {
                const newCharacter = new Character();
                activeUsers[socketId] = newCharacter;

                newCharacter.position = position;
                RODIN.Scene.add(newCharacter);
            }

            /**
             * Create new Rodin socket
             * @type {RodinSocket}
             */
            const SS = new RodinSocket();

            SS.connect({});

            /**
             * On socket connection call getConnectedUsersList() function
             */
            SS.onConnected(data => SS.getConnectedUsersList());

            /**
             * On socket disconnected we need to remove initial avatar from our activeUsers object
             */
            SS.onMessage('socketDisconnected', data => RODIN.Scene.remove(activeUsers[data.socketId]));

            /**
             * This function checks connected users list and their data and broadcasts current user's position and socket id.
             * If there is no character with current positionIndex in data, it creates a new character with a new initial position and userId,
             * Synchronizes the presentation image state for first connection, and shows that image,
             * Creates an avatar as an empty Sculpt for easier controlling the active avatar and the gamepad transforms,
             * Finally, broadcasts own position and socketId as a renderPerson message.
             */
            SS.onMessage('getConnectedUsersList', data => {
                for (let i = 0; i < data.length; i++) {
                    if (!isNaN(data[i].positionIndex)) {
                        const socket = data[i].socketId;
                        initialPositions[data[i].positionIndex].id = data[i].socketId;
                        createNewCharacter(initialPositions[data[i].positionIndex], socket);
                    }
                }

                let findPresentaionImageState = data.find(user => user.imageIndex);
                if (findPresentaionImageState) {
                    screen.show(findPresentaionImageState.imageIndex);
                    SS.setData({ imageIndex: findPresentaionImageState.imageIndex });
                }

                let avatar = new RODIN.Sculpt();
                avatar.add(RODIN.Scene.active.avatar);
                avatar.add(RODIN.GamePad.viveLeft.sculpt);
                avatar.add(RODIN.GamePad.viveRight.sculpt);
                avatar.add(RODIN.GamePad.oculusTouchLeft.sculpt);
                avatar.add(RODIN.GamePad.oculusTouchRight.sculpt);
                avatar.add(RODIN.GamePad.daydream.sculpt);

                RODIN.Scene.add(avatar);

                let firstFreePosition = initialPositions.findIndex(position => !position.id);
                avatar.position.set(initialPositions[firstFreePosition].x, 0, initialPositions[firstFreePosition].z);

                SS.setData({ positionIndex: firstFreePosition });
                SS.broadcastToAll('renderPerson', { coordinateIndex: firstFreePosition, socketId: SS.Socket.id });
            });

            /**
             * This function sets character's head and hands positions and quaternions, and sends a socket message for changeUserCoordinates() to handle it.
             * If there is no character with the same socket id, it creates a new character with a new initial position and userId.
             * Data will be sent in every 100 milliseconds.
             * As a data we will send socket id, head's position and quaternion from RODIN.Avatar and
             * hands' position and quaternion from RODIN.GamePad
             */
            SS.onMessage('renderPerson', data => {
                if (data.socketId != SS.Socket.id) {
                    createNewCharacter(initialPositions[data.coordinateIndex], data.socketId);
                }

                let interval = setInterval(() => {
                    let leftHandPosition = null;
                    let leftHandQuaternion = null;

                    let rightHandPosition = null;
                    let rightHandQuaternion = null;

                    let gamePads = [];
                    if (navigator.getGamepads) gamePads = navigator.getGamepads();

                    for (let i = 0; i < gamePads.length; i++) {
                        const controller = gamePads[i];
                        if (controller && controller.id && controller.id.match(new RegExp('openvr', 'gi')) && controller.hand === 'left') {
                            leftHandPosition = RODIN.GamePad.viveLeft.sculpt.position.valueOf();
                            leftHandQuaternion = RODIN.GamePad.viveLeft.sculpt.quaternion.valueOf();
                        }
                        if (controller && controller.id && controller.id.match(new RegExp('openvr', 'gi')) && controller.hand === 'right') {
                            rightHandPosition = RODIN.GamePad.viveRight.sculpt.position.valueOf();
                            rightHandQuaternion = RODIN.GamePad.viveRight.sculpt.quaternion.valueOf();
                        }

                        if (controller && controller.id && controller.id.match(new RegExp('oculus', 'gi')) && controller.hand === 'left') {
                            leftHandPosition = RODIN.GamePad.oculusTouchLeft.sculpt.position.valueOf();
                            leftHandQuaternion = RODIN.GamePad.oculusTouchLeft.sculpt.quaternion.valueOf();
                        }
                        if (controller && controller.id && controller.id.match(new RegExp('oculus', 'gi')) && controller.hand === 'right') {
                            rightHandPosition = RODIN.GamePad.oculusTouchRight.sculpt.position.valueOf();
                            rightHandQuaternion = RODIN.GamePad.oculusTouchRight.sculpt.quaternion.valueOf();
                        }
                    }
                    SS.broadcastToAll('changeUserCoordinates', {
                        socketId: SS.Socket.id,

                        headPosition: RODIN.Avatar.trackingSculpt.position.valueOf(),
                        headQuaternion: RODIN.Avatar.trackingSculpt.quaternion.valueOf(),

                        leftHandPosition: leftHandPosition,
                        leftHandQuaternion: leftHandQuaternion,

                        rightHandPosition: rightHandPosition,
                        rightHandQuaternion: rightHandQuaternion
                    });
                }, 100);
            });

            /**
             * Sets avatar's head and hands (if there are hands) target positions and quaternions.
             * If device has no tracking gamepads (VR), avatar's hands will be hidden
             */
            SS.onMessage('changeUserCoordinates', data => {
                if (activeUsers[data.socketId] && activeUsers[data.socketId].head.isReady) {
                    activeUsers[data.socketId].head.targetPosition = new RODIN.Vector3().copy(data.headPosition);
                    activeUsers[data.socketId].head.targetQuaternion = new RODIN.Quaternion().copy(data.headQuaternion);

                    if (data.leftHandPosition && data.leftHandQuaternion && activeUsers[data.socketId].hands.left.isReady) {
                        const leftHand = activeUsers[data.socketId].hands.left;
                        leftHand.visible = true;
                        leftHand.targetPosition = new RODIN.Vector3().copy(data.leftHandPosition);
                        leftHand.targetQuaternion = new RODIN.Quaternion().copy(data.leftHandQuaternion);
                    } else if (activeUsers[data.socketId].hands.left.isReady) {
                        activeUsers[data.socketId].hands.left.visible = false;
                    }

                    if (data.rightHandPosition && data.rightHandQuaternion && activeUsers[data.socketId].hands.right.isReady) {
                        const rightHand = activeUsers[data.socketId].hands.right;
                        rightHand.visible = true;
                        rightHand.targetPosition = new RODIN.Vector3().copy(data.rightHandPosition);
                        rightHand.targetQuaternion = new RODIN.Quaternion().copy(data.rightHandQuaternion);
                    } else if (activeUsers[data.socketId].hands.right.isReady) {
                        activeUsers[data.socketId].hands.right.visible = false;
                    }
                }
            });

            /**
             * Updates active users' head and hands position and quaternion on messenger render start.
             */
            RODIN.messenger.on(RODIN.CONST.RENDER_START, () => {
                for (let i in activeUsers) {
                    if (activeUsers[i]) {
                        if (activeUsers[i].head.isReady && activeUsers[i].head.targetPosition && activeUsers[i].head.targetQuaternion) {
                            const head = activeUsers[i].head;
                            head.position.lerp(activeUsers[i].head.targetPosition, RODIN.Time.delta * 0.001 * 10);
                            head.quaternion.slerp(activeUsers[i].head.targetQuaternion, RODIN.Time.delta * 0.001 * 10);
                        }

                        if (activeUsers[i].hands.left.isReady && activeUsers[i].hands.left.targetPosition && activeUsers[i].hands.left.targetQuaternion) {
                            const leftHand = activeUsers[i].hands.left;
                            leftHand.position.lerp(activeUsers[i].hands.left.targetPosition, RODIN.Time.delta * 0.001 * 10);
                            leftHand.quaternion.slerp(activeUsers[i].hands.left.targetQuaternion, RODIN.Time.delta * 0.001 * 10);
                        }

                        if (activeUsers[i].hands.right.isReady && activeUsers[i].hands.right.targetPosition && activeUsers[i].hands.right.targetQuaternion) {
                            const rightHand = activeUsers[i].hands.right;
                            rightHand.position.lerp(activeUsers[i].hands.right.targetPosition, RODIN.Time.delta * 0.001 * 10);
                            rightHand.quaternion.slerp(activeUsers[i].hands.right.targetQuaternion, RODIN.Time.delta * 0.001 * 10);
                        }
                    }
                }
            });

            /**
             * When screen's image changes, it calls changeMainPicture() function
             * and sends current slide's index and user's socket ID.
             */
            screen.on('change', evt => {
                if (SS.Socket) {
                    SS.setData({ imageIndex: evt.target.currentIndex });
                    SS.broadcastToAll('changeMainPicture', { imageIndex: evt.target.currentIndex, socketId: SS.Socket.id });
                }
            });

            /**
             * Shows a new slide on the screen.
             */
            SS.onMessage('changeMainPicture', data => {
                if (data.socketId != SS.Socket.id) screen.show(data.imageIndex);
            });
        }
    };
});