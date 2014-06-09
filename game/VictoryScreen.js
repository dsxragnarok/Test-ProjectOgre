OgrePrototype.VictoryScreen = function (game) {

	this.background = null;
	this.btn = null;
	this.titleText = null;
	this.victor;
	
	this.fighter;
	this.mage;
	this.scout;
	this.acolyte;
};

OgrePrototype.VictoryScreen.prototype = {
    preload : function () {
    },
    
    create : function () {
        var text, btn, bgwscale, bghscale;

        this.world.setBounds(0, 0, 1024, 768);

        //this.stage.backgroundColor = '#2255ff';
        this.stage.backgroundColor = '#112121';
        this.background = this.add.image(this.world.centerX, this.world.centerY, 'end-title-bg');
        //this.background = this.add.image(this.world.centerX, this.world.centerY, 'castle-victory');
        //bgwscale = 1 / (this.background.width / this.world.width);
        //bghscale = 1 / (this.background.height / this.world.height);
        //this.background.scale.setTo(bgwscale, bghscale);
        this.background.anchor.setTo(0.5, 0.5);
        
        this.victor = this.add.sprite(this.world.centerX, this.world.centerY - 160, 'arthur-victor');
        this.victor.animations.add('victorious', [0,1], 20000, false);//this.selectedIndicator.animations.add('idle', [0,1,2,1], 1000, true);
        this.victor.scale.setTo(2,2);
        this.victor.anchor.setTo(0.5,0.5);
        
        this.mage = this.add.sprite(200, this.world.centerY + 150, 'classes-standing', 0);
        this.acolyte = this.add.sprite(400, this.world.centerY + 130, 'classes-standing', 1);
        this.fighter = this.add.sprite(600, this.world.centerY + 120, 'classes-standing', 2);
        this.scout = this.add.sprite(800, this.world.centerY + 140, 'classes-standing', 3);
        
        this.mage.scale.setTo(2,2);
        this.mage.anchor.setTo(0.5,0.5);
        this.mage.scale.x *= -1;    // horizontal flip
        
        this.acolyte.scale.setTo(2,2);
        this.acolyte.anchor.setTo(0.5,0.5);
        this.acolyte.scale.x *= -1; // horizontal flip
        
        this.fighter.scale.setTo(2,2);
        this.fighter.anchor.setTo(0.5,0.5);
        
        this.scout.scale.setTo(2,2);
        this.scout.anchor.setTo(0.5,0.5);
        
        this.titleText = this.add.text(this.world.centerX, 48, 'VICTORY!\nYou have united Testlandia!', {font: 'bold 32pt Arial', fill: '#ff0', align: 'center'})
        this.titleText.anchor.setTo(0.5,0.5);
        
        text = this.add.text(0, 0, 'Title Menu', {font: 'bold 18px Arial', fill: '#f00', align: 'center'});
        text.anchor.setTo(0.5,0.5);
            
        this.btn = this.add.button(this.world.centerX, this.world.centerY, 'buttonhorizontal', this.menuButton, this, 0, 1, 0, 1);
        this.btn.scale.setTo(1,1);
        this.btn.anchor.setTo(0.5,0.5);
        this.btn.addChild(text);
        
        this.victor.animations.play('victorious', 1, false);
    },
    
    shutdown : function () {
        this.background.destroy();
        this.btn.destroy();
        this.titleText.destroy();
    },
    
    menuButton : function () {
        this.state.start('TitleMenu');
    }
};
