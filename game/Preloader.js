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

        this.load.spritesheet('buttonhorizontal', 'assets/button-horizontal.png', 96, 64);
        this.load.spritesheet('flixelbutton', 'assets/flixel-button.png', 80, 20);
    
        this.load.tilemap('map', 'resources/test.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('tiles', 'assets/pogre-sample-tileset.png');
        //this.load.image('castle', '/tests/assets/CastleRed.png');
        
        this.load.spritesheet('castles', 'assets/castles.png', 64,64);
        this.load.spritesheet('icons-units', 'assets/scaled-ogre-battle-unit-icons.png', 32, 32);
        this.load.spritesheet('arthur-victor', 'assets/arthur-victorious.png', 56, 124);
        this.load.spritesheet('arthur-flag', 'assets/arthur-flag.png', 119, 113);
        this.load.spritesheet('classes-standing', 'assets/classes-stand.png', 56, 80);
        this.load.spritesheet('classes-standing-front', 'assets/classes-stand-front.png', 48, 110);
        
        this.load.spritesheet('down-arrow', 'assets/arrows.png', 23, 45);
        this.load.spritesheet('exclamations', 'assets/6494.png', 71, 39);
        
        this.load.image('main-title', 'assets/pogre-title.png', 659, 130);
        this.load.image('sub-title', 'assets/phaser-subtitle.png', 325, 45);
        
        this.load.image('main-title-bg', 'assets/title-bg.png', 1024, 768);
        this.load.image('end-title-bg', 'assets/title2-bg.png', 1024, 768);

        this.load.spritesheet('btn-units', 'assets/unit-buttons.png', 96, 64);

        this.load.spritesheet('btn-menu', 'assets/btn-menu-102x38.png', 102, 38);
        this.load.spritesheet('btn-castle', 'assets/btn-castle-102x38.png', 102, 38);
        this.load.spritesheet('btn-party', 'assets/btn-party-102x38.png', 102, 38);
        //this.load.spritesheet('icons-00', '/rtf-assets/icon-set-40x40.png', 40, 40);
        this.load.spritesheet('icons-00', 'assets/icon-sheet.png', 40, 40);
        this.load.image('hand-cursor', 'assets/dwarven_gauntlet_extra_8.png', 28, 32);
        
        this.load.spritesheet('flag', 'assets/flag.png', 16, 16);
        
        
        this.load.audio('title-music', ['assets/sounds/101-overture.mp3', '/tests/assets/sounds/101-overture.ogg']);
        this.load.audio('march', ['assets/sounds/102-unit-march.mp3', '/tests/assets/sounds/102-unit-march.ogg']);
        this.load.audio('fightitout', ['assets/sounds/fightitout.mp3', '/tests/assets/sounds/fightitout.ogg']);
        this.load.audio('liberated', ['assets/sounds/liberated.mp3', '/tests/assets/sounds/liberated.ogg']);
    },
    
    create : function () {
        this.game.ScreenTransition = new OgrePrototype.ScreenTransition(this.game, this.game.camera.screenView.width, this.game.camera.screenView.height);

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
