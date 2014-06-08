OgrePrototype.Castle = function (game, x, y, key, frame, properties) {
    Phaser.Sprite.call(this, game, x, y, key, frame);
    
    this.name = 'castle';
    
    /* initialization here */
    
    this.inputEnabled = true;
    this.input.useHandCursor = true;
    
    this.events.onCastleSelected = new Phaser.Signal();
    
    this.events.onInputDown.add(this.select, this);
    
    /* ************* */
    this.properties = {
        label : properties.label || 'castle-default',
        human_label : properties.human_label || 'Castle Default',
        defense : properties.defense || game.rnd.integerInRange(50,100),
        gold : properties.gold || game.rnd.integerInRange(100,10000),
        morale : properties.morale || game.rnd.integerInRange(0,100),
        faction : properties.faction || game.rnd.integerInRange(1, OgrePrototype.factions.length-1)   // we never default to player owned
    };
    
    return this;
};

OgrePrototype.Castle.prototype = Object.create(Phaser.Sprite.prototype);
OgrePrototype.Castle.prototype.constructor = OgrePrototype.Castle;


OgrePrototype.Castle.prototype.rollover = function () {
};

OgrePrototype.Castle.prototype.rollout = function () {
};

OgrePrototype.Castle.prototype.select = function () {
    console.log(this.properties.human_label + ' SELECTED');
    var sb = 'FACTION: ' + this.properties.faction + '\n' +
            'MORALE: ' + this.properties.morale + '\n' +
            'DEFENSE: ' + this.properties.defense + '\n' +
            'INCOME: ' + this.properties.gold + ' G\n';
    console.log(sb);
    
    this.events.onCastleSelected.dispatch(this);
};
    
OgrePrototype.Castle.prototype.release = function () {
    //console.log(this.label + ' RELEASED');
};
