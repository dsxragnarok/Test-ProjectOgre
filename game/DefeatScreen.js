OgrePrototype.DefeatScreen = function (game) {

	this.background = null;
	this.titleText = null;
	this.btn = null;
};

OgrePrototype.DefeatScreen.prototype = {
    preload : function () {
    },
    
    create : function () {
        var text, btn, bgwscale, bghscale;
        
        this.world.setBounds(0, 0, 1024, 768);

        //this.stage.backgroundColor = '#2255ff';
        this.stage.backgroundColor = '#112121';
        this.background = this.add.image(this.world.centerX, this.world.centerY, 'valkyrie-defeat');
        bgwscale = 1 / (this.background.width / this.world.width);
        bghscale = 1 / (this.background.height / this.world.height);
        this.background.scale.setTo(bgwscale, bghscale);
        this.background.anchor.setTo(0.5, 0.5);
        
        this.titleText = this.add.text(this.world.centerX, 48, 'DEFEAT!\nYour forces have been decimated.', {font: 'bold 32pt Arial ', fill: '#f90', align: 'center'})
        this.titleText.anchor.setTo(0.5,0.5);
        
        text = this.add.text(0, 0, 'Title Menu', {font: 'bold 18px Arial', fill: '#f00', align: 'center'});
        text.anchor.setTo(0.5,0.5);

        this.btn = this.add.button(this.world.centerX, this.world.centerY, 'buttonhorizontal', this.menuButton, this, 0, 1, 0, 1);
        this.btn.scale.setTo(1,1);
        this.btn.anchor.setTo(0.5,0.5);
        this.btn.addChild(text);
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
