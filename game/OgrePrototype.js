'use strict';

var OgrePrototype = {
    /* Here we've just got some global level vars that persist regardless of State swaps */
    /* If the music in your game needs to play through-out a few State swaps, then you could reference it here */
    music: null,
    
    debug: false,
    
    factions : {    // possibly add 'ally'
        length:3, // to make our lives easier
        0:'player', 
        1:'foe', 
        2:'neutral'
    },
    jobs : {
        length : 4,  // to make our lives easier
        0:'fighter', 
        1:'scout', 
        2:'acolyte', 
        3:'mage'
    },
    
    exclamations : {
        'thank' : 0,
        'fightitout' : 1,
        'findout' : 2,
        'lucky' : 3,
        'liberation' : 4,
        'boo' : 5
    }
};
