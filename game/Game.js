'use strict';

OgrePrototype.Game = function (game) {
    this.music = null;
    
    this.se = {};
    
    this.map;
    this.layer_terrain;
    this.layer_locations;
    this.cursors;

    // TODO: CastleGroup and PartyGroups should be their own classes extending Phaser.Group
    
    this.castleGroup;
    
    this.foeParties;
    this.playerParties;
    this.neutralParties;
    
    this.playerPartySelected;
    
    this.selectedPartyMenu;
    this.selectedCastleMenu;
    this.mainMenu;
    
    this.selectedIndicator;
    this.HUD;
    
    this.mytweens = [];
    this.fightitout;
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
        
        this.foeParties.enableBody = true;
        this.neutralParties.enableBody = true;
        this.playerParties.enableBody = true;
        
        this.map.createFromObjects('Object Layer 1', 15, 'castle', 0, true, false, this.castleGroup, OgrePrototype.Castle);
        /* test creating castle sprites */
        //this.map.forEach(this.maybeCreateCastle, this, 0, 0, this.map.width, this.map.height, 'locations');
        this.castleGroup.forEach(function (castle) {
            castle.setProperties({});
            castle.events.onCastleSelected.add(this.handleCastleSelect, this);
        }, this);
        
        
        this.givePlayerCastle();
        this.spawnParties();
        
        
        this.selectedIndicator = this.game.add.sprite(0, 0, 'down-arrow');
        this.selectedIndicator.scale.setTo(0.5,0.5);
        this.selectedIndicator.anchor.setTo(0.5,0.5);
        this.selectedIndicator.visible = false;
        this.selectedIndicator.animations.add('idle', [0,1,2,1], 1000, true);
        
        this.fightitout = this.game.add.sprite(0, 0, 'exclamations', 1);
        this.fightitout.visible = false;
        
        this.createHUD();
        
        //this.selectedPartyMenu = this.createOnePartyMenu();
        this.createMainMenu();
        this.createOneCastleMenu();
        this.createOnePartyMenu();
        
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
            this.game.StateTransitions.to('DefeatScreen');
            //this.state.start('DefeatScreen');
        }
        
        if (this.foeParties.countLiving() === 0) {
            this.game.StateTransitions.to('VictoryScreen');
            //this.state.start('VictoryScreen');
        }
    },
    
    // this is run while this.paused === true
    pauseUpdate : function () {
    
    },
    
    render : function () {
        if (OgrePrototype.debug) {
            this.game.debug.pointer(this.game.input.activePointer);
            this.game.debug.cameraInfo(this.game.camera, 32, 32);
        
            if (this.playerPartySelected) {
                this.game.debug.text('Selected Party: ' + 
                    OgrePrototype.factions[this.playerPartySelected.properties.faction] + '-' + 
                    OgrePrototype.jobs[this.playerPartySelected.properties.leader], 360, 32, 'rgb(255,0,255)');
            }
        }
    },
    
    shutdown : function () {
        this.music.stop();
        this.music.destroy(false);
        this.se.fightitout.stop();
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
        
        this.game.tweens.removeAll();
        
        var i = 0;
        for (i; i < this.mytweens.length; i += 1) {
            this.mytweens[i].onComplete.removeAll();
            this.mytweens[i].stop();
            this.mytweens[i] = null;
        }
        this.mytweens = [];
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
                    castle.x + castle.width/2,
                    castle.y + castle.height/2,
                    castle.properties.faction,
                    this.game.rnd.integerInRange(0, OgrePrototype.jobs.length-1)
                );
        this.game.add.existing(party);
        
        party.events.onPartySelected.add(this.handlePartySelect, this);
        //party.events.onPartyDeselected.add(this.handlePartyDeselect, this);
        party.events.onPartyMoveSelect.add(this.handlePartyMoveSelect, this);
        party.events.onKilled.add(this.handlePartyKilled, this);
        
        party.revive(100);
        if (OgrePrototype.factions[party.properties.faction] === 'player') {
            this.playerParties.add(party);
        } else if (OgrePrototype.factions[party.properties.faction] === 'foe') {
            this.foeParties.add(party);
        } else {
            this.neutralParties.add(party);
        }
    },
    
    maybeCreateCastle : function (tile) {
        var castle, coords;
        if (tile.index >= 0) {
            coords = this.tileToWorldCoordinates(tile.x, tile.y);
            castle = new OgrePrototype.Castle(this.game, coords.x, coords.y, 'castle', 0, {label:'Castle-' + tile.x + ':' + tile.y});
            
            this.game.add.existing(castle);
            this.castleGroup.add(castle);
            
            castle.events.onCastleSelected.add(this.handleCastleSelect, this);
        }
    },
    
    givePlayerCastle : function () {
        // select random castle for player
        var castle = this.castleGroup.getRandom(),
            speed = Math.floor(this.game.math.distance(this.game.camera.x, this.game.camera.y, castle.x - 400, castle.y - 300) * 2);
        
        castle.properties.faction = 0; // 0 index of factions is 'player'
        // center camera on player
        
        this.mytweens.push(this.game.add.tween(this.game.camera).to({x:castle.x-this.game.camera.screenView.width/2,y:castle.y-this.game.camera.screenView.height/2}, speed, Phaser.Easing.Linear.None, true));
    },
    
    partiesCollide : function (PartyOne, PartyTwo) {
        var i, fidx, jidx, roll, p1, p2;
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
            this.showFightExclam(PartyTwo);
            roll = Math.floor(Math.random() * 100);
            p1 = OgrePrototype.jobs[PartyOne.properties.leader];
            p2 = OgrePrototype.jobs[PartyTwo.properties.leader];
            
            if (p1 === p2 || (p1 === 'fighter' && p2 === 'scout') || (p1 === 'scout' && p2 === 'fighter') ||
                (p1 === 'acolyte' && p2 === 'mage') || (p1 === 'mage' && p2 === 'acolyte')) {
                if (roll >= 50) {
                    console.log('player clashes with foe ~ wins : ' + roll);
                    PartyTwo.kill();
                } else {
                    console.log('player clashes with foe ~ loses : ' + roll);
                    PartyOne.kill();
                }
            } else if ((p1 === 'fighter' && p2 === 'acolyte') || (p1 === 'acolyte' && p2 === 'scout') || 
                        (p1 === 'mage' && p2 === 'fighter') || (p1 === 'scout' && p2 === 'mage')) {
                console.log('player clashes with foe ~ wins : ' + p1 + ' > ' + p2);
                PartyTwo.kill();
            } else {
                console.log('player clashes with foe ~ loses : ' + p2 + ' > ' + p1);
                PartyOne.kill();
            }
        }
        
    },
    
    /* ****************** MENU ********************************************** */
    
    createHUD : function () {
        // we want to have a 32px-height bar across the top and a 64px-height
        // bar running across the bottom.
        var bmd, bg, btn;
        
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
        
        this.castlebtn = this.game.add.button((32 + 102) * 2, this.game.camera.screenView.height - 80, 'btn-castle', null, null, 1, 0, 1, 0);
        this.HUD.add(this.castlebtn);
        
        this.partybtn = this.game.add.button((32 + 102) * 3 , this.game.camera.screenView.height - 80, 'btn-party', 
            function () {
                if (this.playerPartySelected) {
                    //this.game.add.tween(this.game.camera).to({x:castle.x-400,y:castle.y-300}, speed, Phaser.Easing.Linear.None, true);
                    this.mytweens.push(this.game.add.tween(this.game.camera).to({x:this.playerPartySelected.x-this.game.camera.screenView.width/2, y:this.playerPartySelected.y-this.game.camera.screenView.height/2}, 2000, Phaser.Easing.Linear.None, true));
                }
            }, this, 1, 0, 1, 0);
            
        this.HUD.add(this.partybtn);
        
        this.HUD.fixedToCamera = true;
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
            console.log( ' received deselect signal for player party' );
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
        this.selectedCastleMenu.addButton(0, 0, '', null, this, 28, 24, 28, 24, {key: 'recruit'});
        this.selectedCastleMenu.addButton(0, 0, '', null, this, 36, 32, 36, 32, {key: 'repair'});
        this.selectedCastleMenu.addButton(0, 0, '', null, this, 21, 17, 21, 17, {key: 'shop'});
        //this.selectedCastleMenu.addButton(0, 0, '', this.selectedCastleMenu.hide, this.selectedCastleMenu, 20, 16, 20, 16, {key: 'cancel'});
        this.selectedCastleMenu.addButton(0, 0, '', function () {
            this.playerPartySelected.removeChild(this.selectedIndicator);
            
            this.playerPartySelected = undefined;
            this.selectedCastleMenu.hide();
            this.selectedIndicator.visible = false;
            this.selectedIndicator.animations.stop('idle');
        }, this, 20, 16, 20, 16, {key: 'cancel'});
    },
    
    handleCastleSelect : function (castle) {
        if (OgrePrototype.factions[castle.properties.faction] === 'player') {
            if (this.playerPartySelected && this.playerPartySelected.name === 'party') {
                this.playerPartySelected.hideDestinationMarker();
                this.playerPartySelected = undefined;
            }

            this.playerPartySelected = castle;
            this.selectedCastleMenu.show();
            this.showSelectedIndicator(castle);
            
            this.mainMenu.hide();
            this.selectedPartyMenu.hide();
        }
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
                this.state.start('TitleMenu');
            };
        }, this, 44, 40, 44, 40, {key: 'quit'});
        this.mainMenu.addButton(0, 0, '', this.mainMenu.hide, this.mainMenu, 20, 16, 20, 16, {key: 'cancel'});
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
    
    showFightExclam : function (element) {
        var fight = this.fightitout;
        fight.position.setTo(element.x, element.y - 32);
        fight.visible = true;
        this.se.fightitout.play();
        // for simplicity, going to use setTimeout for now.
        setTimeout(function () {
            fight.visible = false;
        }, 3000);
    },
    
    handlePartyMoveSelect : function (party) {
        //this.selectedPartyMenu.hide();
    },
    
    handlePartyKilled : function (party) {
        if (party === this.playerPartySelected) {
            this.selectedPartyMenu.hide();
            this.playerPartySelected = undefined;
        }
    }
};
