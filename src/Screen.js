import * as RODIN from 'rodin/core';

export class Screen extends RODIN.Plane {
    constructor() {

        /**
         * Set screen width and height
         */
        const width = 7.528;
        const p = 1920 / 1020;
        const height = width / p;

        /**
         * Create a plane with given parameters
         */
        super(width, height, 1, 1);

        /**
         * Load slide images, add to slides array
         */
        this.slides = [
            RODIN.Loader.loadTexture('images/presentation/p1.jpg'),
            RODIN.Loader.loadTexture('images/presentation/p2.jpg'),
            RODIN.Loader.loadTexture('images/presentation/p3.jpg'),
            RODIN.Loader.loadTexture('images/presentation/p4.jpg'),
            RODIN.Loader.loadTexture('images/presentation/p5.jpg'),
            RODIN.Loader.loadTexture('images/presentation/p6.jpg'),
            RODIN.Loader.loadTexture('images/presentation/p7.jpg'),
            RODIN.Loader.loadTexture('images/presentation/p8.jpg'),
            RODIN.Loader.loadTexture('images/presentation/p9.jpg'),
            RODIN.Loader.loadTexture('images/presentation/p10.jpg'),
            RODIN.Loader.loadTexture('images/presentation/p11.jpg'),
            RODIN.Loader.loadTexture('images/presentation/p12.jpg'),
            RODIN.Loader.loadTexture('images/presentation/p13.jpg'),
            RODIN.Loader.loadTexture('images/presentation/p14.jpg'),
            RODIN.Loader.loadTexture('images/presentation/p15.jpg')
        ];

        this.currentIndex = 0;
        this._threeObject.material.map = this.slides[0];

        /**
         * Create prevButtonParams with given parameters.
         * Set local position.
         * Add to screen.
         */
        let prevButtonParams = {width: .25, height: .25};
        prevButtonParams.image = {
            url: "images/arrowButton.png",
            width: prevButtonParams.width,
            height: prevButtonParams.height,
            position: {v:50, h:50}
        };
        this.prevButton = new RODIN.Element(prevButtonParams);
        this.prevButton.on(RODIN.CONST.READY, () => {
            this.prevButton.position.set(-width / 2 + .25, 0, .1);
            this.add(this.prevButton);
        });

        /**
         * On prevButton hover, the scale will be set 1.2
         */
        this.prevButton.on(RODIN.CONST.GAMEPAD_HOVER, () => {
            this.prevButton.scale.set(1.2, 1.2, 1.2);
        });
        /**
         * On prevButton hover out, the scale will be set 1
         */
        this.prevButton.on(RODIN.CONST.GAMEPAD_HOVER_OUT, () => {
            this.prevButton.scale.set(1, 1, 1);
        });
        /**
         * Stops the key up or key down events from propagating to bottom layers.
         */
        this.prevButton.on([RODIN.CONST.GAMEPAD_BUTTON_DOWN, RODIN.CONST.GAMEPAD_BUTTON_UP], (evt) => {
            evt.stopPropagation();
        });
        /**
         * On prevButton key down, prev() will be called
         */
        this.prevButton.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, () => {
            this.prev();
        });


        /**
         * Create nextButtonParams with given parameters.
         * Set local position.
         * Add to screen.
         */
        let nextButtonParams = {width: .25, height: .25};
        nextButtonParams.image = {
            url: "images/arrowButton.png",
            width: nextButtonParams.width,
            height: nextButtonParams.height,
            position: {v:50, h:50}
        };
        this.nextButton = new RODIN.Element(nextButtonParams);
        this.nextButton.on(RODIN.CONST.READY, () => {
            this.nextButton.rotation.z = Math.PI;
            this.nextButton.position.set(width / 2 - .25, 0, .1);
            this.add(this.nextButton);
        });

        /**
         * On nextButton hover, the scale will be set 1.2
         */
        this.nextButton.on(RODIN.CONST.GAMEPAD_HOVER, () => {
            this.nextButton.scale.set(1.2, 1.2, 1.2);
        });
        /**
         * On nextButton hover out, the scale will be set 1
         */
        this.nextButton.on(RODIN.CONST.GAMEPAD_HOVER_OUT, () => {
            this.nextButton.scale.set(1, 1, 1);
        });
        /**
         * Stops the key up or key down events from propagating to bottom layers.
         */
        this.nextButton.on([RODIN.CONST.GAMEPAD_BUTTON_DOWN, RODIN.CONST.GAMEPAD_BUTTON_UP], (evt) => {
            evt.stopPropagation();
        });
        /**
         * On nextButton key down, next() will be called
         */
        this.nextButton.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, () => {
            this.next();
        });
            
        
        this.on(RODIN.CONST.UPDATE, () => {
            if (!this._threeObject.material.map){
                this._threeObject.material.map  = this.slides[0];
            console.log(this._threeObject.material.map);
            }
        });

        /**
         * On screen hover, the scale will be set 1.01
         */
        this.on(RODIN.CONST.GAMEPAD_HOVER, () => {
            this.scale.set(1.01, 1.01, 1.01);
        });
        /**
         * On screen hover out, the scale will be set 1
         */
        this.on(RODIN.CONST.GAMEPAD_HOVER_OUT, () => {
            this.scale.set(1, 1, 1);
        });
        /**
         * On screen key down, next() will be called
         */
        this.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, () => {
            this.next();
        });
    }

    /**
     * Change slide image according to the slide number.
     * @param sliderImageIndex {number}
     */
    show(sliderImageIndex) {
        // blocks the function call, if the previous call was less than 200ms ago
        if (RODIN.Time.now - this.lastChanged < 200) return;
        this.lastChanged = RODIN.Time.now;
        // check, if the new slide index equals to the current slide index.
        if (this.currentIndex === sliderImageIndex) return;
        this._threeObject.material.map = this.slides[sliderImageIndex];
        this.currentIndex = sliderImageIndex;
        this.emit('change', new RODIN.RodinEvent(this));
    }

    /**
     * Calls show() function with the next slide index
     */
    next() {
        // Check if current index is the last slide index.
        if (this.currentIndex < this.slides.length - 1) {
            this.show(this.currentIndex + 1);
        }
    }

    /**
     * Calls show() function with the previous slide index
     */
    prev() {
        //  Check if current index is the first slide index.
        if (this.currentIndex > 0) {
            this.show(this.currentIndex - 1);
        }
    }
}

/**
 * Create new screen instance from Screen class.
 * Set screen position and add it to the scene
 * @type {Screen}
 */
export const screen = new Screen();
screen.position.z = -6.251;
screen.position.y = 2.593;
