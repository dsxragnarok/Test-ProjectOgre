'use strict';

OgrePrototype.TitleMenu = function (game) {
    this.background = null;
    this.title = null;
    this.subtitle = null;
    
    this.music = null;
    
    this.TitleScreen;
    this.InstructionScreen;
};

OgrePrototype.TitleMenu.prototype = {
    create : function () {
        var text, btn, bghscale, bgwscale, bmd, instrbg;
      
        this.music = this.add.audio('title-music');
        this.music.play();
        
        this.game.world.setBounds(0, 0, 1024, 768);
          
        this.background = this.add.image(this.world.centerX, this.world.centerY, 'main-title-bg');
        //this.background = this.add.image(this.world.centerX, this.world.centerY, 'valkyrie-title');
        //bgwscale = 1 / (this.background.width / this.world.width);
        //bghscale = 1 / (this.background.height / this.world.height);
        //this.background.scale.setTo(bgwscale, bghscale);
        this.background.anchor.setTo(0.5, 0.5);
        
        this.TitleScreen = this.add.group();
        
        this.title = this.add.image(this.world.centerX, 75, 'main-title');
        this.title.anchor.setTo(0.5, 0.5);
        this.subtitle = this.add.image(this.world.centerX, this.title.height, 'sub-title');
        
        this.TitleScreen.add(this.title);
        this.TitleScreen.add(this.subtitle);
        //text = this.add.text(this.world.centerX, 48, 'Project Ogre\nsimple prototype', {font: 'bold 32pt Arial', fill: '#c39', align: 'center'});
        //text.anchor.setTo(0.5,0.5);
        
        //this.TitleScreen.add(text);
        
        text = this.add.text(0, 0, 'PLAY', {font: 'bold 24px Arial', fill: '#f00', align: 'center'});
        text.anchor.setTo(0.5,0.5);
        btn = this.add.button(this.world.centerX, this.world.centerY, 'buttonhorizontal', this.playGame, this, 0, 1, 0, 1);
        btn.scale.setTo(1,1);
        btn.anchor.setTo(0.5,0.5);
        btn.addChild(text);
        
        this.TitleScreen.add(btn);

        text = this.add.text(0, 0, 'INSTRUCTIONS', {font: 'bold 12px Arial', fill: '#f00', align: 'center'});
        text.anchor.setTo(0.5,0.5);
        
        btn = this.add.button(this.world.centerX, this.world.centerY + 96, 'buttonhorizontal', this.openInstructions, this, 0, 1, 0, 1);
        btn.scale.setTo(1,1);
        btn.anchor.setTo(0.5,0.5);
        btn.addChild(text);
        
        this.TitleScreen.add(btn);
        
        this.InstructionScreen = this.add.group();
        bmd = this.add.bitmapData(this.world.width, this.world.height);
        bmd.context.fillStyle = 'rgba(50, 75, 175, 0.5)';
        bmd.context.fillRect(0, 0, this.world.width, this.world.height);
        
        instrbg = this.add.sprite(0, 0, bmd);
        this.InstructionScreen.add(instrbg);
        
        text = this.add.text(this.world.centerX, 48, 'INSTRUCTIONS', {font: 'bold 32pt Arial', fill: '#c39', align: 'center'});
        text.anchor.setTo(0.5,0.5);
        
        this.InstructionScreen.add(text);
        
        text = 'You may scroll map using arrow keys, or mouse/touch drag\n' +
            'Your own units are GOLD\nEnemy units are SILVER\nNeutral units are BLUE\n' +
            'Click on your unit to select it.\n' +
            'Clash with a neutral unit to recruit them\n' +
            'Clash with an enemy unit to battle:\n' +
                    '\t\t\t\t* fighter> acolyte\n' +
                    '\t\t\t\t* acolyte > scout\n' +
                    '\t\t\t\t* scout > mage\n' +
                    '\t\t\t\t* mage > fighter\n' +
                    '\t\t\t\t* fighter = scout : random\n' +
                    '\t\t\t\t* acolyte = mage : random\n' +
                    '\t\t\t\t* same classes : random\n' +
            'Defeat all enemies to win';
            
        text = this.add.text(32, 48 * 2, text, {font: 'bold 16pt Arial', fill: '#cc0', align: 'left'});
        this.InstructionScreen.add(text);
        
        text = this.add.text(0, 0, 'CLOSE', {font: 'bold 24px Arial', fill: '#f00', align: 'center'});
        text.anchor.setTo(0.5,0.5);
        
        btn = this.add.button(this.world.centerX, this.world.height - 96, 'buttonhorizontal', this.closeInstructions, this, 0, 1, 0, 1);
        btn.scale.setTo(1,1);
        btn.anchor.setTo(0.5,0.5);
        btn.addChild(text);
        
        this.InstructionScreen.add(btn);
        
        this.InstructionScreen.visible = false;
    },
    
    shutdown : function () {
        this.music.destroy(false);
        this.background.destroy();
        this.TitleScreen.destroy();
        this.InstructionScreen.destroy();
    },
    
    /* ********************************************************************** */
    
    playGame : function () {
        this.music.stop();
        this.state.start('Game');
    },
    
    openInstructions : function () {
        this.TitleScreen.visible = false;
        this.InstructionScreen.visible = true;
    },
    
    closeInstructions : function () {
        this.InstructionScreen.visible = false;
        this.TitleScreen.visible = true;
    }
};
