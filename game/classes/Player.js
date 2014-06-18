OgrePrototype.Player = function (game, options) {
    this.name = 'player';
    this.game = game;
    if (!options) {
        options = {};
    }
    
    this.hero_name = options.hero_name || OgrePrototype.names.kings[game.rnd.integerInRange(0, OgrePrototype.names.kings.length-1)];
    this.gold = options.gold || OgrePrototype.STARTING_GOLD;
    this.reputation = options.reputation || OgrePrototype.STARTING_REPUTATION;
};
