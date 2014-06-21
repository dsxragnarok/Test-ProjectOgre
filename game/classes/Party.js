/*
    The party icon is usually represented by it's leader job.
    For now, without the job class implemented and the full
    functionality of a party is yet to be implemented, we
    will just choose a random icon to represent the party.
    
    The icon is set spritesheet is setup in this way:
                       0       1      2       3
    player      0: [fighter][scout][acolyte][mage]
    foe         1: [fighter][scout][acolyte][mage]
    neutral     2: [fighter][scout][acolyte][mage]
*/
'use strict';

OgrePrototype.Party = function (game, x, y, faction, icon) {
    // for now the icon will be the job-key: fighter, scout, acolyte, mage
    // we need to determine what frame to grab using combination
    // of key and owner
    var i, j, fIdx, jIdx, frameIdx;
    frameIdx = faction * OgrePrototype.jobs.length + icon;
    //frameIdx = fIdx * OgrePrototype.jobs.length + jIdx;
    
    Phaser.Sprite.call(this, game, x, y, 'icons-units', frameIdx);
    this.name = 'party';
    
    //this.scale.setTo(1.6,1.6);     // 1/0.625 = 1.6 ->  20 * 1.6 = 32
    this.anchor.setTo(0.5,0.5);
    
    this.events.onPartySelected = new Phaser.Signal();
    //this.events.onPartyDeselected = new Phaser.Signal();
    this.events.onPartyMoveSelect = new Phaser.Signal();
    
    this.events.onPartyMoveEnd = new Phaser.Signal();
    
    /* INITIALIZATION */
    this.inputEnabled = true;
    this.input.useHandCursor = true;
    this.events.onInputDown.add(this.select, this);
    
    this.events.onKilled.add(this.killed, this);

    /* ************* */

    this.properties = {
        faction : faction,
        leader : icon,
        morale : 100,
        members : [icon],
        speed : 16  // 16px per second
    };
    
    this.isMoving = false;
    this.tween = null;
    this.destinationMarker = game.add.sprite(0,0,'flag');
    this.destinationMarker.anchor.setTo(0.5,0.5);
    this.destinationMarker.animations.add('idle', null, 10, true);
    game.physics.enable(this.destinationMarker);
    this.hideDestinationMarker();
    //this.destinationMarker.visible = false;
    
    return this;
};

OgrePrototype.Party.prototype = Object.create(Phaser.Sprite.prototype);
OgrePrototype.Party.prototype.constructor = OgrePrototype.Party;

OgrePrototype.Party.prototype.getMembers = function () {
    return this.properties.members;
};

// TODO: finish the rest of the code below
OgrePrototype.Party.prototype.killed = function () {
    this.hideDestinationMarker();
};

OgrePrototype.Party.prototype.select = function () {
    this.events.onPartySelected.dispatch(this);
};
    
OgrePrototype.Party.prototype.release = function () {
    //console.log(this.label + ' RELEASED');
};

OgrePrototype.Party.prototype.moveTo = function (destination) {
    // drop the destination marker:
    /*this.destinationMarker.x = destination.x;
    this.destinationMarker.y = destination.y;*/
    if (!this.destinationMarker.alive) {
        this.destinationMarker.revive();
        this.destinationMarker.animations.play('idle',10,true);
    }
    this.destinationMarker.x = destination.x;
    this.destinationMarker.y = destination.y;
    
    this.isMoving = true;
    
    this._angle = Math.atan2(this.destinationMarker.y - this.y, this.destinationMarker.x - this.x);
    this.body.velocity.x = Math.cos(this._angle) * this.properties.speed;
    this.body.velocity.y = Math.sin(this._angle) * this.properties.speed;
    /*if (!this.isMoving) {
        speed = Math.floor(this.game.math.distance(this.x, this.y, destination.x, destination.y) * this.properties.speed);
        this.tween = this.game.add.tween(this).to(destination, speed, Phaser.Easing.Linear.None, true);
        this.tween.onComplete.add(this.moveFinished, this);
    }*/
    
};

OgrePrototype.Party.prototype.moveFinished = function () {
    this.tween = null;
    this.isMoving = false;
    this.destinationMarker.kill();
    console.log(' -- move finished! --');
    this.body.velocity.setTo(0);
    
    this.events.onPartyMoveEnd.dispatch(this);
};

/* *** Menu Stuff *** */

OgrePrototype.Party.prototype.selectMove = function () {
    this.events.onPartyMoveSelect.dispatch(this);
    //this.events.onPartyDeselected.dispatch(this);
    this.game.input.onUp.add(this.processClickMove, this);
};

OgrePrototype.Party.prototype.processClickMove = function (pointer) {
    if (pointer.duration <= 150) {  // in case they are dragging
        this.moveTo({x: pointer.worldX, y:pointer.worldY});
        this.game.input.onUp.remove(this.processClickMove, this);
    }
};

OgrePrototype.Party.prototype.showDestinationMarker = function () {
    if (this.destinationMarker.alive) {
        this.destinationMarker.visible = true;
        this.destinationMarker.play('idle', 10, true);
    }
};

OgrePrototype.Party.prototype.hideDestinationMarker = function () {
    this.destinationMarker.visible = false;
    this.destinationMarker.animations.stop('idle');
};

/* ** OVERRIDES ** */
OgrePrototype.Party.prototype.update = function () {
    if (this.isMoving) {
        if (Phaser.Point.distance(this.position, this.destinationMarker.position) < 1) {
            this.moveFinished();
        }
    }
    //this.game.physics.arcade.overlap(this, this.destinationMarker, this.moveFinished, null, this);
};
