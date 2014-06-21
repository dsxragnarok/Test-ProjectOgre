/**
 * Created by khung on 6/21/14.
 */

OgrePrototype.ScreenTransition = function (game, width, height) {
    "use strict";

    this.game = game;
    this.parent = parent;

    this.width = width || 1024;
    this.height = height || 768;

    this.bmd = game.add.bitmapData(this.width, this.height);
    this.bmd.context.fillStyle = 'rgb(0,0,0)';
    this.bmd.context.fillRect(0, 0, this.width, this.height);

    this.curtain = null;
    //this.curtain = game.add.sprite(0, 0, bmd);
    //this.curtain.fixedToCamera = true;

    this.tween = null;
};

OgrePrototype.ScreenTransition.prototype = {
    fadeOut : function (callback, callbackContext, callbackArgs) {
        "use strict";

        if (this.curtain) {
            this.curtain.destroy();
        }
        this.curtain = this.game.add.sprite(0, 0, this.bmd);
        this.curtain.alpha = 0;
        this.curtain.fixedToCamera = true;

        this.tween = this.game.add.tween(this.curtain).to({alpha: 1}, 3000, Phaser.Easing.Linear.None, true);
        this.tween.onComplete.addOnce(callback, callbackContext, callbackArgs);
        this.tween.onComplete.addOnce(this.cleanup, this);
    },

    fadeIn : function (callback, callbackContext, callbackArgs) {
        "use strict";

        if (this.curtain) {
            this.curtain.destroy();
        }
        this.curtain = this.game.add.sprite(0, 0, this.bmd);
        this.curtain.alpha = 1;

        this.tween = this.game.add.tween(this.curtain).to({alpha: 0}, 3000, Phaser.Easing.Linear.None, true);
        this.tween.onComplete.addOnce(callback, callbackContext, callbackArgs);
        this.tween.onComplete.addOnce(this.cleanup, this);
    },

    fade : function (from, to, duration, callback, callbackContext, callbackArgs) {
        "use strict";

        if (this.curtain) {
            this.curtain.destroy();
        }
        this.curtain = this.game.add.sprite(0, 0, this.bmd);
        this.curtain.alpha = from;
        this.curtain.fixedToCamera = true;

        this.tween = this.game.add.tween(this.curtain).to({alpha: to}, duration, Phaser.Easing.Linear.None, true);
        if (callback) {
            this.tween.onComplete.addOnce(callback, callbackContext, callbackArgs);
        }
        this.tween.onComplete.addOnce(this.cleanup, this);
    },

    cleanup : function () {
        "use strict";
        console.log('ScreenTransition.cleanup');
        this.tween.onComplete.removeAll();
    },

    destroy : function () {
        "use strict";

        this.tween.onComplete.removeAll();
        this.tween.stop();
        this.tween = null;

        this.curtain.destroy();
    }
};