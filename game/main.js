'use strict';

(function () {
	//	Create your Phaser game and inject it into the viewContainer div.
	//	We're using a game size of 1024 x 768 here, but you can use whatever you feel makes sense for your game of course.
    var game = new Phaser.Game(1024, 768, Phaser.CANVAS, 'viewContainer');
    //var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, 'viewContainer');
    //var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'viewContainer');

    game.state.add('Boot', OgrePrototype.Boot);
    game.state.add('Preloader', OgrePrototype.Preloader);
    game.state.add('TitleMenu', OgrePrototype.TitleMenu);
    game.state.add('Game', OgrePrototype.Game);
    game.state.add('VictoryScreen', OgrePrototype.VictoryScreen);
    game.state.add('DefeatScreen', OgrePrototype.DefeatScreen);

    game.state.start('Boot');
}());
