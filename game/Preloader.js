'use strict';

OgrePrototype.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;
};

OgrePrototype.Preloader.prototype = {
    preload : function () {
        this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloader');
        this.preloadBar.anchor.setTo(0.5,0.5);
        
        this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
        this.load.setPreloadSprite(this.preloadBar);

        this.load.spritesheet('buttonhorizontal', '/tests/phaser/phaser-example-assets/buttons/buttons-big/button-horizontal.png', 96, 64);
        this.load.spritesheet('flixelbutton', '/tests/phaser/phaser-example-assets/buttons/flixel-button.png', 80, 20);    
    
        this.load.tilemap('map', 'resources/test.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('tiles', '/tests/phaser/assets/pogre-sample-tileset.png');
        this.load.image('castle', '/tests/assets/CastleRed.png');
        
        this.load.spritesheet('icons-units', '/tests/assets/ogre-battle-unit-icons.png', 20, 20);
        
        
        this.load.spritesheet('down-arrow', '/tests/assets/arrows.png', 23, 45);
        this.load.spritesheet('exclamations', '/tests/assets/6494.png', 71, 39);
        
        this.load.image('main-title', '/tests/assets/pogre-title.png', 659, 130);
        this.load.image('sub-title', '/tests/assets/phaser-subtitle.png', 325, 45);
        this.load.image('valkyrie-title', '/tests/assets/valkyrie00.jpg', 640, 782);
        this.load.image('valkyrie-defeat', '/tests/assets/valkyrie01.jpg', 1024, 768);
        this.load.image('castle-victory', '/tests/assets/unconquered.jpg', 1280, 805);
        
        this.load.spritesheet('btn-menu', '/rtf-assets/btn-menu-102x38.png', 102, 38);
        this.load.spritesheet('btn-castle', '/rtf-assets/btn-castle-102x38.png', 102, 38);
        this.load.spritesheet('btn-party', '/rtf-assets/btn-party-102x38.png', 102, 38);
        //this.load.spritesheet('icons-00', '/rtf-assets/icon-set-40x40.png', 40, 40);
        this.load.spritesheet('icons-00', '/rtf-assets/icon-sheet.png', 40, 40);
        this.load.image('hand-cursor', '/rtf-assets/dwarven_gauntlet_extra_8.png', 28, 32);
        
        this.load.spritesheet('flag', '/rtf-assets/flag.png', 16, 16);
        
        
        this.load.audio('title-music', ['/tests/assets/sounds/101-overture.mp3', '/tests/assets/sounds/101-overture.ogg']);
        this.load.audio('march', ['/tests/assets/sounds/102-unit-march.mp3', '/tests/assets/sounds/102-unit-march.ogg']);
        this.load.audio('fightitout', ['/tests/assets/sounds/fightitout.mp3', '/tests/assets/sounds/fightitout.ogg']);
    },
    
    create : function () {
        this.preloadBar.cropEnabled = false;
    },
    
    update : function () {
        if (!!this.ready && this.game.cache.isSoundReady('title-music')) {
            this.state.start('TitleMenu');
        }
    },
    
    onLoadComplete : function () {
        this.ready = true;
    }
};
