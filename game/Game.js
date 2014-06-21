'use strict';

OgrePrototype.Game = function (game) {
    this.music = null;
    
    this.se = {};
    
    this.map = null;
    this.layer_terrain = null;
    this.cursors = null;

    this.castleGroup = null;
    
    this.foeParties = null;
    this.playerParties = null;
    this.neutralParties = null;
    
    this.playerPartySelected = null;
    this.playerCastleSelected = null;
    
    this.selectedPartyMenu = null;
    this.selectedCastleMenu = null;
    this.mainMenu = null;
    this.castleStatus = null;
    
    this.selectedIndicator = null;
    this.HUD = null;
    
    this.battleMessage = null;
    
    this.mytweens = [];
    this.exclamations = [];
    
    this.nightOverlay = null;
    this.day = null;
    this.month = null;
    this.year = null;
    
    // ----
    this.castlesOwned = 0;  // should probably be in the Player class
    this.player = null;
};

OgrePrototype.Game.prototype = {
    create : function () {
        var canvas = window.document.getElementsByTagName('canvas')[0],
            prevX = 0,
            prevY = 0,
            mouseDown = false;
            
        this.stage.backgroundColor = '#787878';
        
        this.music = this.add.audio('march');
        this.music.play('',0,0.3,true);
        
        this.se.fightitout = this.add.audio('fightitout');
        this.se.liberated = this.add.audio('liberated');
        
        this.map = this.game.add.tilemap('map');
        this.map.addTilesetImage('pogre-sample-tileset', 'tiles');
        this.layer_terrain = this.map.createLayer('terrain');
        //this.layer_locations = this.map.createLayer('locations');
        
        this.cursors = this.game.input.keyboard.createCursorKeys();
        
        this.layer_terrain.resizeWorld();
        //this.layer_locations.resizeWorld();
        
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        
        this.castleGroup = this.game.add.group();
        this.foeParties = this.game.add.group();
        this.neutralParties = this.game.add.group();
        this.playerParties = this.game.add.group();
        
        this.castleGroup.enableBody = true;
        
        this.foeParties.enableBody = true;
        this.neutralParties.enableBody = true;
        this.playerParties.enableBody = true;
        
        this.map.createFromObjects('Object Layer 1', 15, 'castles', 0, true, false, this.castleGroup, OgrePrototype.Castle);
        /* test creating castle sprites */
        //this.map.forEach(this.maybeCreateCastle, this, 0, 0, this.map.width, this.map.height, 'locations');
        this.castleGroup.forEach(function (castle) {
            castle.setProperties({});
            castle.events.onCastleSelected.add(this.handleCastleSelect, this);
        }, this);
        
        this.player = new OgrePrototype.Player(this.game);
        
        this.givePlayerCastle();
        this.spawnParties();
        
        this.startTimeTracker();
        this.createNightOverlay();
        
        this.selectedIndicator = this.game.add.sprite(0, 0, 'down-arrow');
        //this.selectedIndicator.scale.setTo(0.5,0.5);
        this.selectedIndicator.anchor.setTo(0.5,0.5);
        this.selectedIndicator.visible = false;
        this.selectedIndicator.animations.add('idle', [0,1,2,1], 1000, true);
        
        //this.exclamations = this.game.add.sprite(0, 0, 'exclamations');
        this.exclamations[0] = this.game.add.sprite(0, 0, 'exclamations');
        this.exclamations[0].visible = false;
        /*
        this.fightitout = this.game.add.sprite(0, 0, 'exclamations', 1);
        this.fightitout.visible = false;
        
        this.liberation = this.game.add.sprite(0, 0, 'exclamations', 4);
        this.liberation.visible = false;
        */

        this.createOneCastleStatusScreen();        
        this.createHUD();
        
        //this.selectedPartyMenu = this.createOnePartyMenu();
        this.createMainMenu();
        this.createOneCastleMenu();
        this.createOnePartyMenu();
        this.createRecruitMenu();
        
        /* ** Handle Scrolling of the map via mouse & touch drag ** */
        // http://www.html5gamedevs.com/topic/6351-dragging-a-tilesprite/#entry37979
        // http://www.html5gamedevs.com/topic/2410-drag-the-camera/
        // http://jsfiddle.net/luckylooke/YHj24/12/
        var that = this;
        canvas.addEventListener('touchstart', function (e) {
            prevX = e.changedTouches[0].screenX;
            prevY = e.changedTouches[0].screenY;
        });
        
        canvas.addEventListener('mousedown', function (e) {
            mouseDown = true;
            prevX = e.screenX;
            prevY = e.screenY;
        });
        
        canvas.addEventListener('touchmove', function (e) {
            if (!that.dragWorldDisabled) {
                e.preventDefault();
                that.game.camera.x += prevX - e.changedTouches[0].screenX;
                prevX = e.changedTouches[0].screenX;
                that.game.camera.y += prevY - e.changedTouches[0].screenY;
                prevY = e.changedTouches[0].screenY;
            }
        });
        
        canvas.addEventListener('mousemove', function (e) {
            if (mouseDown && !that.dragWorldDisabled) {
                e.preventDefault();
                that.game.camera.x += prevX - e.screenX;
                prevX = e.screenX;
                that.game.camera.y += prevY - e.screenY;
                prevY = e.screenY;
            }
        });
        
        canvas.addEventListener('mouseup', function (e) {
            mouseDown = false;
        });
        
        canvas.addEventListener('mouseleave', function (e) {
            mouseDown = false;
        });
        
        /* *************************************************** */
    },
    
    update : function () {
        if (this.cursors.left.isDown) {
            this.game.camera.x -= 24;
        } else if (this.cursors.right.isDown) {
            this.game.camera.x += 24;
        } 
        
        if (this.cursors.up.isDown) {
            this.game.camera.y -= 24;
        } else if (this.cursors.down.isDown) {
            this.game.camera.y += 24;
        }
        
        this.game.physics.arcade.overlap(this.foeParties, this.neutralParties, this.partiesCollide, null, this);
        this.game.physics.arcade.overlap(this.playerParties, this.neutralParties, this.partiesCollide, null, this);
        this.game.physics.arcade.overlap(this.playerParties, this.foeParties, this.partiesCollide, null, this);
        
        if (this.playerParties.countLiving() === 0) {
            this.endGameTransition('DefeatScreen');
        }
        
        if (this.castlesOwned >= this.castleGroup.length) {
            this.endGameTransition('VictoryScreen');
        }
        
        // update HUD -- 
        this.gold.setText('GOLD: ' + this.player.gold);
    },
    
    // this is run while this.paused === true
    pauseUpdate : function () {
    
    },
    
    render : function () {
        if (OgrePrototype.debug) {
            this.game.debug.pointer(this.game.input.activePointer);
            this.game.debug.cameraInfo(this.game.camera, 32, 32);
            this.game.debug.text('Time until next day: ' + this.game.time.events.duration, 8, 40);

            if (this.playerPartySelected) {
                this.game.debug.text('Selected Party: ' + 
                    OgrePrototype.factions[this.playerPartySelected.properties.faction] + '-' + 
                    OgrePrototype.jobs[this.playerPartySelected.properties.leader], 360, 32, 'rgb(255,0,255)');
            }
        }
    },
    
    shutdown : function () {
        var i;
        this.music.stop();
        this.music.destroy(false);
        this.se.fightitout.stop();
        this.se.liberated.stop();
        this.se.fightitout.destroy(false);
    
        this.map.destroy();
        this.layer_terrain.destroy();
        //this.layer_locations.destroy();
        this.cursors = null;
        this.selectedIndicator.destroy();
        
        this.castleGroup.destroy();
        
        this.foeParties.destroy();
        this.playerParties.destroy();
        this.neutralParties.destroy();
        
        this.playerPartySelected = null;
        
        this.selectedPartyMenu.destroy();
        this.selectedCastleMenu.destroy();
        this.HUD.destroy();
        this.castleStatus.destroy();
        this.recruitMenu.destroy();
        this.mainMenu.destroy();
        
        this.nightOverlay.destroy();
        
        this.game.tweens.removeAll();
        
        for (i = 0; i < this.exclamations.length; i +=1 ) {
            this.exclamations[i].destroy();
            this.exclamations = [];
        }
        
        for (i = 0; i < this.mytweens.length; i += 1) {
            this.mytweens[i].onComplete.removeAll();
            this.mytweens[i].stop();
            this.mytweens[i] = null;
        }
        this.mytweens = [];
        
        this.dayNightTween.onComplete.removeAll();
        this.dayNightTween.stop();
        this.dayNightTween = null;
        
        this.castlesOwned = 0;
        this.player = null;
        
        this.time.removeAll();
    },
    
    /* ********************************************************************** */
    worldToTileCoordinates : function (wX, wY) {
        return {x: Math.floor(wX/32), y: Math.floor(wY/32)};
    },
    
    tileToWorldCoordinates : function (tX, tY) {
        return {x: Math.floor(tX * 32), y: Math.floor(tY * 32)};
    },
    
    spawnParties : function () {
        //this.map.forEach(this.maybeCreateCastle, this, 0, 0, this.map.width, this.map.height, 'locations');
        this.castleGroup.forEach(this.spawnParty, this);
    },
    
    spawnParty : function (castle) {
        var party;
        
        // game, x, y, faction, icon
        party = new OgrePrototype.Party(this.game, 
                    castle.x + Math.floor(castle.width * 0.5),
                    castle.y + Math.floor(castle.height * 0.5),
                    castle.properties.faction,
                    this.game.rnd.integerInRange(0, OgrePrototype.jobs.length-1)
                );
        this.game.add.existing(party);
        
        party.events.onPartySelected.add(this.handlePartySelect, this);
        //party.events.onPartyDeselected.add(this.handlePartyDeselect, this);
        party.events.onPartyMoveSelect.add(this.handlePartyMoveSelect, this);
        party.events.onKilled.add(this.handlePartyKilled, this);
        party.events.onPartyMoveEnd.add(this.handlePartyFinishedMoving, this);
        
        party.revive(100);
        if (OgrePrototype.factions[party.properties.faction] === 'player') {
            this.playerParties.add(party);
        } else if (OgrePrototype.factions[party.properties.faction] === 'foe') {
            this.foeParties.add(party);
        } else {
            this.neutralParties.add(party);
        }
    },
    /*
    maybeCreateCastle : function (tile) {
        var castle, coords;
        if (tile.index >= 0) {
            coords = this.tileToWorldCoordinates(tile.x, tile.y);
            castle = new OgrePrototype.Castle(this.game, coords.x, coords.y, 'castles', 0, {label:'Castle-' + tile.x + ':' + tile.y});
            
            this.game.add.existing(castle);
            this.castleGroup.add(castle);
            
            castle.events.onCastleSelected.add(this.handleCastleSelect, this);
        }
    },
    */
    givePlayerCastle : function () {
        // select random castle for player
        var castle = this.castleGroup.getRandom(),
            speed = Math.floor(this.game.math.distance(this.game.camera.x, this.game.camera.y, castle.x - 400, castle.y - 300) * 2);
        
        castle.properties.faction = 0; // 0 index of factions is 'player'
        castle.frame = 1;
        // center camera on player
        this.castlesOwned += 1;
        this.mytweens.push(this.game.add.tween(this.game.camera).to({x:castle.x-this.game.camera.screenView.width/2,y:castle.y-this.game.camera.screenView.height/2}, speed, Phaser.Easing.Linear.None, true));
    },
    
    partyOnCastle : function (party, castle) {
        //console.log(party);
        //console.log(castle);
        return party.properties.faction !== castle.properties.faction;
    },
    
    conquerCastle : function (party, castle) {
        castle.properties.faction = party.properties.faction;
        castle.frame = 1;
        this.showExclam(castle, 'liberation', this.se.liberated, 32, -32);
        this.castlesOwned += 1;
        //console.log('You\'ve conquered this castle!');
    },
    
    partiesCollide : function (PartyOne, PartyTwo) {
        var i, roll, p1, p2;
        // if partytwo is neutral, they join the other party's faction
        if (PartyTwo.properties.faction === 2) {
            PartyTwo.properties.faction = PartyOne.properties.faction;
            PartyTwo.frame = PartyOne.properties.faction * OgrePrototype.jobs.length + PartyTwo.properties.leader;
            
            this.neutralParties.remove(PartyTwo);
            
            if (PartyOne.properties.faction === 0) {
                this.playerParties.add(PartyTwo);
            } else if (PartyOne.properties.faction === 1) {
                this.foeParties.add(PartyTwo);
            }
            
            // for some odd reason the party's useHandCursor gets reset to false
            // after switching groups
            if (!PartyTwo.input.useHandCursor) {
                PartyTwo.input.useHandCursor = true;
            }
            
            return;
        }
        
        // handle collision between player and foes
        // for now to make things less random we will implement this
        // order of win conditions:
        // fighter > acolyte > scout > mage > fighter
        // fighter > acolyte
        // acolyte > scout
        // scout > mage
        // mage > fighter
        // fighter = scout : random
        // acolyte = mage : random
        if (PartyTwo.properties.faction === 1) {
            this.mytweens.push(
                this.game.add.tween(this.game.camera).to({x:PartyOne.x-this.game.camera.screenView.width/2,y:PartyOne.y-this.game.camera.screenView.height/2}, 1000, Phaser.Easing.Linear.None, true)
            );
            //this.showFightExclam(PartyTwo);
            this.showExclam(PartyTwo, 'fightitout', this.se.fightitout, 32, -32);
            roll = Math.floor(Math.random() * 100);
            p1 = OgrePrototype.jobs[PartyOne.properties.leader];
            p2 = OgrePrototype.jobs[PartyTwo.properties.leader];
            
            if (p1 === p2 || (p1 === 'fighter' && p2 === 'scout') || (p1 === 'scout' && p2 === 'fighter') ||
                (p1 === 'acolyte' && p2 === 'mage') || (p1 === 'mage' && p2 === 'acolyte')) {
                if (roll >= 50) {
                    //console.log('player clashes with foe ~ wins : ' + roll);
                    PartyTwo.kill();
                } else {
                    //console.log('player clashes with foe ~ loses : ' + roll);
                    PartyOne.kill();
                }
            } else if ((p1 === 'fighter' && p2 === 'acolyte') || (p1 === 'acolyte' && p2 === 'scout') || 
                        (p1 === 'mage' && p2 === 'fighter') || (p1 === 'scout' && p2 === 'mage')) {
                //console.log('player clashes with foe ~ wins : ' + p1 + ' > ' + p2);
                PartyTwo.kill();
            } else {
                //console.log('player clashes with foe ~ loses : ' + p2 + ' > ' + p1);
                PartyOne.kill();
            }
        }
        
    },
    
    /* ****************** MENU ********************************************** */
    startTimeTracker : function () {
        this.day = this.game.rnd.integerInRange(1, OgrePrototype.calendar.daysPerMonth);
        this.month = this.game.rnd.integerInRange(1, OgrePrototype.calendar.monthsPerYear);
        this.year = this.game.rnd.integerInRange(100, 500);
        
        this.time.events.loop(Phaser.Timer.MINUTE, function () {
            this.day += 1;
            
            if (this.day > OgrePrototype.calendar.daysPerMonth) {
                this.day = 1;
                this.month += 1;
                
                if (this.month > OgrePrototype.calendar.monthsPerYear) {
                    this.month = 1;
                    this.year += 1;
                }
            }
            this.onNewDay();
            this.calendar.setText(this.day + 'th day of ' + OgrePrototype.calendar.months[this.month] + ', year ' + this.year);
        }, this);
    },
    
    createNightOverlay : function () {
        var bmd;
        
        bmd = this.game.add.bitmapData(this.game.camera.screenView.width, this.game.camera.screenView.height);
        
        bmd.context.fillStyle = 'rgba(0, 0, 0)';
        bmd.context.fillRect(0, 0, this.game.camera.screenView.width, this.game.camera.screenView.height);
        
        this.nightOverlay = this.game.add.sprite(0, 0, bmd);
        this.nightOverlay.fixedToCamera = true;
        
        this.nightOverlay.alpha = 0.75;
        
        this.dayNightTween = this.game.add.tween(this.nightOverlay).to({alpha:0}, Phaser.Timer.SECOND * 30, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE, true);
    },
    
    createHUD : function () {
        // we want to have a 32px-height bar across the top and a 64px-height
        // bar running across the bottom.
        var bmd, bg, btn, text;
        
        this.HUD = this.game.add.group();
        
        bmd = this.game.add.bitmapData(this.game.camera.screenView.width, 32);
        
        bmd.context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        bmd.context.fillRect(0, 0, this.game.camera.screenView.width, 32);
        
        bg = this.game.add.sprite(0,0,bmd);
        
        this.HUD.add(bg);
        
        bg = this.game.add.sprite(0,this.game.camera.screenView.height - 62,bmd);
        bg.scale.setTo(1,2);
        this.HUD.add(bg);
        
        //btn = this.game.add.button(x, y, 'flixelbutton', callbackFnc, callbackContext, overFrame, outFrame, downFrame, upFrame);
        this.menubtn = this.game.add.button(32, this.game.camera.screenView.height - 80, 'btn-menu', this.toggleMainMenu, this, 1, 0, 1, 0);
        this.HUD.add(this.menubtn);
        
        this.castlebtn = this.game.add.button((32 + 102) * 2, this.game.camera.screenView.height - 80, 'btn-castle', function () {
            if (this.castleStatus.visible) {
                this.closeCastleStatus(false);
            }

            if (this.recruitMenu.visible) {
                this.recruitMenu.hide();
            }
        }, this, 1, 0, 1, 0);
        this.HUD.add(this.castlebtn);
        
        this.partybtn = this.game.add.button((32 + 102) * 3 , this.game.camera.screenView.height - 80, 'btn-party', 
            function () {
                if (this.playerPartySelected) {
                    //this.game.add.tween(this.game.camera).to({x:castle.x-400,y:castle.y-300}, speed, Phaser.Easing.Linear.None, true);
                    this.mytweens.push(this.game.add.tween(this.game.camera).to({x:this.playerPartySelected.x-this.game.camera.screenView.width/2, y:this.playerPartySelected.y-this.game.camera.screenView.height/2}, 2000, Phaser.Easing.Linear.None, true));
                }
            }, this, 1, 0, 1, 0);
            
        this.HUD.add(this.partybtn);
        
        this.calendar = this.game.add.text(
            this.game.camera.screenView.width - 300, 8, 
            this.day + 'th day of ' + OgrePrototype.calendar.months[this.month] + ', Year ' + this.year,
            {font: 'bold 12pt Arial', fill: '#cc0', align: 'right' }
        );
            
        this.HUD.add(this.calendar);
        
        text = this.game.add.text(
            16, 8,
            this.player.hero_name,
            {font: 'bold 12pt Arial', fill: '#cc0', align: 'left'}
        );
        this.HUD.add(text);
        
        this.gold = this.game.add.text(
            100, 8,
            'GOLD: ' + this.player.gold,
            {font: 'bold 12pt Arial', fill: '#cc0', align: 'right' }
        );
        this.HUD.add(this.gold);
        
        this.HUD.fixedToCamera = true;
    },
    
    createOneCastleStatusScreen : function () {
        this.castleStatus = this.game.add.group();
        this.castleStatus.fixedToCamera = true;
        this.castleStatus.cameraOffset.setTo((32 + 102) * 2, this.game.camera.screenView.height);
        //this.castleStatus.position.setTo(150, 150);
        
        var bmd = this.game.add.bitmapData(200, 150);
        
        bmd.context.fillStyle = 'rgba(0, 0, 0, 0.85)';
        bmd.context.fillRect(0, 0, 200, 300);
        var bg = this.add.sprite(0, 0, bmd);
        this.castleStatus.add(bg);
        
        var label = this.add.text(10, 10, '', {font: 'bold 12pt Arial', fill: '#cc0', align: 'center'});
        label.name = 'label';
        
        this.castleStatus.add(label);
        
        label = this.add.text(10, 32, 'Faction: ', {font: 'bold 12pt Arial', fill: '#cc0', align: 'left'});
        label.name = 'faction';
        
        this.castleStatus.add(label);
        
        label = this.add.text(10, 54, 'Morale: ', {font: 'bold 12pt Arial', fill: '#cc0', align: 'left'});
        label.name = 'morale';
        
        this.castleStatus.add(label);
        
        label = this.add.text(10, 76, 'Defense: ', {font: 'bold 12pt Arial', fill: '#cc0', align: 'left'});
        label.name = 'defense';
        
        this.castleStatus.add(label);
        
        label = this.add.text(10, 98, 'Income: ', {font: 'bold 12pt Arial', fill: '#cc0', align: 'left'});
        label.name = 'income';
        
        this.castleStatus.add(label);
        
        this.castleStatus.updateInformation = function (info) {
            //console.log('called castle status update information function');
            this.forEach(function (child) {
                //console.log('status child');
                //console.log(child);
                if (child.name === 'label') {
                    child.setText(info.human_label);
                }
                if (child.name === 'faction') {
                    child.setText('Faction: ' + info.faction);
                }
                if (child.name === 'morale') {
                    child.setText('Morale: ' + info.morale);
                }
                if (child.name === 'defense') {
                    child.setText('Defense: ' + info.defense);
                }
                if (child.name === 'income') {
                    child.setText('Income: ' + info.gold);
                }
            }, this);
        };
        this.castleStatus.visible = true;
        //text = this.add.text(0, 0, 'INSTRUCTIONS', {font: 'bold 12px Arial', fill: '#f00', align: 'center'});
        //text.anchor.setTo(0.5,0.5);
    },
    
    createOnePartyMenu : function () {
        // we want to create a single menu to which
        // will show when a party is selected
        this.selectedPartyMenu = new OgrePrototype.Menu(
                                    this.game, 
                                    this.game.world, {
                                        width: 80, 
                                        height: 120,
                                        spacing: 10,
                                        x: this.partybtn.x,
                                        y: this.camera.screenView.height - 40
                                });
        this.game.add.existing(this.selectedPartyMenu);
        
        // buttons are initially null until the menu is attached to a party
        this.selectedPartyMenu.addButton(0, 0, 'move', null, this, 54, 50, 54, 50, {key: 'move'});
        this.selectedPartyMenu.addButton(0, 0, 'stop', null, this, 13, 9, 13, 9, {key: 'stop'});
        //this.selectedPartyMenu.addButton(0, 0, 'formation', null, this, 4, 0, 4, 0, {key: 'formation'});
        //this.selectedPartyMenu.addButton(0, 0, 'equip', null, this, 5, 1, 5, 1, {key: 'equip'});
        //this.selectedPartyMenu.addButton(0, 0, 'garrison', null, this, 45, 41, 45, 41, {key: 'garrison'});
        this.selectedPartyMenu.addButton(0, 0, 'cancel', function () {
            this.playerPartySelected.removeChild(this.selectedIndicator);
            
            this.playerPartySelected = undefined;
            this.selectedPartyMenu.hide();
            this.selectedIndicator.visible = false;
            this.selectedIndicator.animations.stop('idle');
        }, this, 20, 16, 20, 16, {key: 'cancel'});
    },
    
    handlePartySelect : function (party) {
        if (OgrePrototype.factions[party.properties.faction] === 'player') {
            // deselect the previous party
            /*if (this.playerPartySelected !== undefined && this.playerPartySelected !== null && this.playerPartySelected !== party) {
                this.playerPartySelected.events.onPartyDeselected.dispatch(this.playerPartySelected);
            }*/
            this.selectedCastleMenu.hide();
            this.mainMenu.hide();
            
            this.playerParties.callAll('hideDestinationMarker');
            
            this.playerPartySelected = party;
            this.playerPartySelected.showDestinationMarker();
            this.showSelectedIndicator(party);
            
            this.playerParties.bringToTop(party);
            
            
            this.selectedPartyMenu.clearButtonHandle('move');
            this.selectedPartyMenu.clearButtonHandle('stop');
            
            this.selectedPartyMenu.addButtonHandle('move', party.selectMove, party);
            this.selectedPartyMenu.addButtonHandle('stop', party.moveFinished, party);
            //this.selectedPartyMenu.addButtonHandle('formation', party.selectMove, party);
            
            this.selectedPartyMenu.show();
        }
    },
    
    /*
    handlePartyDeselect : function (party) {
        if (OgrePrototype.factions[party.properties.faction] === 'player') {
            //console.log( ' received deselect signal for player party' );
            this.selectedPartyMenu.clearButtonHandle('move');
            this.selectedPartyMenu.clearButtonHandle('cancel');
            
            this.selectedPartyMenu.hide();
            this.playerPartySelected.destinationMarker.visible = false;
            this.playerPartySelected = null;
        }
    },*/
    
    createOneCastleMenu : function () {
        // we want to create a single menu to which
        // will show when a party is selected
        this.selectedCastleMenu = new OgrePrototype.Menu(
                                    this.game, 
                                    this.game.world, {
                                        width: 80, 
                                        height: 120,
                                        spacing: 10,
                                        x: this.castlebtn.x,
                                        y: this.camera.screenView.height - 40
                                });
        this.game.add.existing(this.selectedCastleMenu);
        
        // buttons are initially null until the menu is attached to a party
        this.selectedCastleMenu.addButton(0, 0, '', null, this, 52, 48, 52, 48, {key: 'deploy'});
        this.selectedCastleMenu.addButton(0, 0, '', function () {
            if (this.castleStatus.visible) {
                this.closeCastleStatus(false, this.recruitMenu.show, this.recruitMenu);
            } else {
                this.recruitMenu.show();
            }


            //this.recruitMenu.show();
        }, this, 28, 24, 28, 24, {key: 'recruit'});
        this.selectedCastleMenu.addButton(0, 0, '', null, this, 36, 32, 36, 32, {key: 'repair'});
        this.selectedCastleMenu.addButton(0, 0, '', null, this, 21, 17, 21, 17, {key: 'shop'});
        //this.selectedCastleMenu.addButton(0, 0, '', this.selectedCastleMenu.hide, this.selectedCastleMenu, 20, 16, 20, 16, {key: 'cancel'});
        this.selectedCastleMenu.addButton(0, 0, '', function () {
            //this.playerCastleSelected.removeChild(this.selectedIndicator);
            this.closeCastleStatus(true);

            if (this.recruitMenu.visible) {
                this.recruitMenu.hide();
            }
            //this.playerCastleSelected
            /*
            this.playerCastleSelected = undefined;
            this.selectedCastleMenu.hide();
            this.selectedIndicator.visible = false;
            this.selectedIndicator.animations.stop('idle');
            */
        }, this, 20, 16, 20, 16, {key: 'cancel'});
    },
    
    handleCastleSelect : function (castle) {
        if (OgrePrototype.factions[castle.properties.faction] === 'player') {
            /*if (this.playerPartySelected && this.playerPartySelected.name === 'party') {
                this.playerPartySelected.hideDestinationMarker();
                this.playerPartySelected = undefined;
            }*/


            this.playerCastleSelected = castle;
            this.selectedCastleMenu.show();
            this.showSelectedIndicator(castle);
            
            this.mainMenu.hide();
            this.selectedPartyMenu.hide();
        }
        
        this.castleStatus.updateInformation(castle.properties);
        
        /*
        this.castleStatus.position.setTo(
            castle.position.x - 200 < 0 ? castle.position.x + 200 : castle.position.x - 200, 
            castle.position.y
        );
        */
        this.castleStatus.visible = true;
        this.mytweens.push(this.game.add.tween(this.castleStatus.cameraOffset).to({y:this.game.camera.screenView.height - 250}, 2000, Phaser.Easing.Linear.None, true));
        /*
        this.mytweens.push(this.game.add.tween(this.game.camera).to({x:this.playerPartySelected.x-this.game.camera.screenView.width/2, y:this.playerPartySelected.y-this.game.camera.screenView.height/2}, 2000, Phaser.Easing.Linear.None, true));
        */
    },
    
    createMainMenu : function () {
        this.mainMenu = new OgrePrototype.Menu(
                            this.game,
                            this.game.world, {
                                width: 80,
                                height: 120,
                                spacing: 10,
                                x: this.menubtn.x,
                                y: this.camera.screenView.height - 40
                        });
        this.game.add.existing(this.mainMenu);
        
        this.mainMenu.addButton(0, 0, '', null, this, 22, 18, 22, 18, {key: 'castles'});
        this.mainMenu.addButton(0, 0, '', null, this, 46, 42, 46, 42, {key: 'parties'});
        this.mainMenu.addButton(0, 0, '', null, this, 52, 48, 52, 48, {key: 'deploy'});
        this.mainMenu.addButton(0, 0, '', null, this, 29, 25, 29, 25, {key: 'objective'});
        this.mainMenu.addButton(0, 0, '', null, this, 39, 35, 39, 35, {key: 'settings'});
        this.mainMenu.addButton(0, 0, '', function () {
            if (window.confirm('Are you sure you want to quit?')) {
                this.endGameTransition('TitleMenu', 1);
                //this.state.start('TitleMenu');
            }
        }, this, 44, 40, 44, 40, {key: 'quit'});
        this.mainMenu.addButton(0, 0, '', this.mainMenu.hide, this.mainMenu, 20, 16, 20, 16, {key: 'cancel'});
    },

    createRecruitMenu : function () {
        this.recruitMenu = new OgrePrototype.Menu(
            this.game,
            this.game.world, {
                width: 192,
                height: 276,
                spacing: 5,
                orientation: 'vertical',
                x: this.castlebtn.x,
                y: this.camera.screenView.height - 350
        });

        this.recruitMenu.addButton(0, 0, 'fighter', function () {
            this.handleRecruitUnit(0);
        }, this, 1, 0, 1, 0, {key: 'fighter', imgsrc: 'btn-units'});
        this.recruitMenu.addButton(0, 0, 'scout', function () {
            this.handleRecruitUnit(1);
        }, this, 3, 2, 3, 2, {key: 'scout', imgsrc: 'btn-units'});
        this.recruitMenu.addButton(0, 0, 'acolyte', function () {
            this.handleRecruitUnit(2);
        }, this, 5, 4, 5, 4, {key: 'acolyte', imgsrc: 'btn-units'});
        this.recruitMenu.addButton(0, 0, 'mage', function () {
            this.handleRecruitUnit(3);
        }, this, 7, 6, 7, 6, {key: 'mage', imgsrc: 'btn-units'});
    },

    closeCastleStatus : function (closeCastleMenu, callback, callbackContext, callbackArgs) {
        var castleScreen = this.castleStatus;
        var tween = this.game.add.tween(this.castleStatus.cameraOffset).to({y:this.game.camera.screenView.height}, 2000, Phaser.Easing.Linear.None, true);
        tween.onComplete.add(function () {
            castleScreen.visible = false;

            if (callback) {
                if (callbackArgs) {
                    //console.log(callback);
                    callback.call(callbackContext, this, callbackArgs);
                } else {
                    callback.call(callbackContext, this);
                }
            }
        });
        this.mytweens.push(tween);
        
        if (closeCastleMenu && this.playerCastleSelected) {
            //console.log('playerSelectedCastle NOT null');
            this.playerCastleSelected.removeChild(this.selectedIndicator);
            this.playerCastleSelected = undefined;
            this.selectedCastleMenu.hide();
            this.selectedIndicator.visible = false;
            this.selectedIndicator.animations.stop('idle');
            
            this.playerSelectedCastle = undefined;
        }
    },
    
    toggleMainMenu : function () {
        if (this.mainMenu.visible) {
            this.mainMenu.hide();
        } else {
            this.mainMenu.show();
            this.selectedCastleMenu.hide();
            this.selectedPartyMenu.hide();
            if (this.playerPartySelected) {
                
                if (this.playerPartySelected.name === 'party') {
                    this.playerPartySelected.hideDestinationMarker();
                }
                this.playerPartySelected = undefined;
            }
        }
    },
    
    showSelectedIndicator : function (element) {
        element.addChild(this.selectedIndicator);
        
        if (element.anchor.x === 0) {
            this.selectedIndicator.position.setTo(element.width/2, - element.height/2);
        } else {
            this.selectedIndicator.position.setTo(0, -24);
        }
        this.selectedIndicator.animations.play('idle', 10, true);
        this.selectedIndicator.visible = true;
    },
    
    showExclam : function (fromEntity, key, sound, offsetX, offsetY) {
        var x = fromEntity.x, 
            y = fromEntity.y,
            i, exclamation;
        
        if (offsetX) {
            x += offsetX;
        }
        
        if (offsetY) {
            y += offsetY;
        }
        
        if (sound) {
            sound.play();
        }
        
        for (i = 0; i < this.exclamations.length; i +=1) {
            if (!this.exclamations[i].visible) {
                exclamation = this.exclamations[i];
            }
        }
        
        if (!exclamation) {
            exclamation = this.game.add.sprite(0, 0, 'exclamations');
            this.exclamations.push(exclamation);
        }
        
        exclamation.frame = OgrePrototype.exclamations[key];
        exclamation.position.setTo(x,y);
        exclamation.visible = true;
        this.game.time.events.add(Phaser.Timer.SECOND * 3, function () {
            exclamation.visible = false;
        }, this);
    },
    
    handlePartyMoveSelect : function (party) {
        //this.selectedPartyMenu.hide();
    },
    
    handlePartyKilled : function (party) {
        if (party === this.playerPartySelected) {
            this.selectedPartyMenu.hide();
            this.playerPartySelected = undefined;
        }
    },
    
    handlePartyFinishedMoving : function (party) {
        //console.log('party finished move signal received');
        this.game.physics.arcade.overlap(party, this.castleGroup, this.conquerCastle, this.partyOnCastle, this);
    },

    handleRecruitUnit : function (unitIdx) {
        var unit, x, y;

        if (this.player.gold >= 250) {
            unit = this.playerParties.getFirstDead();

            x = this.playerCastleSelected.x + Math.floor(this.playerCastleSelected.width * 0.5);
            y = this.playerCastleSelected.y + Math.floor(this.playerCastleSelected.height * 0.5);

            if (unit === null) {
                unit = new OgrePrototype.Party(this.game, x, y, 0, unitIdx);

                this.game.add.existing(unit);
                this.playerParties.add(unit);

                unit.events.onPartySelected.add(this.handlePartySelect, this);
                unit.events.onPartyMoveSelect.add(this.handlePartyMoveSelect, this);
                unit.events.onKilled.add(this.handlePartyKilled, this);
                unit.events.onPartyMoveEnd.add(this.handlePartyFinishedMoving, this);
            } else {
                unit.properties.leader = unitIdx;
                unit.frame = unit.properties.faction * OgrePrototype.jobs.length + unitIdx;
                unit.reset(x,y,100);

                unit.isMoving = false;
                unit.tween = null;
            }

            console.log('Player recruited ' + OgrePrototype.jobs[unitIdx] + ' for ' + 250 + ' gold');
            this.player.gold -= 250;
        }
    },

    onNewDay : function () {
        // increase the player's gold by the sum of incomes from all castles they own
        // this should probably be handled elsewhere, but for now lets put it here.
        //var income;

        this.castleGroup.forEach(function (castle) {
            if (castle.properties.faction === 0) {
                this.player.gold += castle.properties.gold;
                console.log(' Player gained ' + castle.properties.gold + ' gold');
            }
        }, this);
    },
    
    endGameTransition : function (key, time) {
        var t = time || 3;
        this.game.time.events.add(Phaser.Timer.SECOND * t, function () {
            this.game.StateTransitions.to(key);
        }, this);
    }
};
