OgrePrototype.Menu = function (game, parent, settings) {
    Phaser.Group.call(this, game, parent);
    
    this.name = 'menu';
    /* Initialization */
    
    this.properties = {
        lastX : settings.x, //|| game.camera.screenView.centerX,
        lastY : settings.y, //|| game.camera.screenView.centerY,
        width : settings.width || 80,
        height : settings.height || 120,
        spacing : settings.spacing || 0,
        padding : settings.padding || 0,
        topOffset : settings.topOffset || 0,
        leftOffset : settings.leftOffset || 0,
        orientation : settings.orientation || 'horizontal'
    };
    
    this.buttons = {};
    this.numOfButtons = 0;
    
    this.fixedToCamera = true;
    
    this.hide();
};

OgrePrototype.Menu.prototype = Object.create(Phaser.Group.prototype);
OgrePrototype.Menu.prototype.constructor = OgrePrototype.Menu;

OgrePrototype.Menu.prototype.hide = function () {
    var k, keys = Object.keys(this.buttons);
    for (k in keys) {
        this.buttons[keys[k]].label.visible = false;
    }

    this.visible = false;
};

OgrePrototype.Menu.prototype.show = function (options) {
    var x,y;
    console.log(this);
    if (options) {
        if (options.fixedToCamera !== undefined && options.fixedToCamera !== null) {
            this.fixedToCamera = options.fixedToCamera;
        }
        x = options.x || this.properties.lastX;
        y = options.y || this.properties.lastY;
    } else {
        x = this.properties.lastX;
        y = this.properties.lastY;
    }
    // calculate cameraOffset
    //x = x - this.game.camera.x;
    //y = y - this.game.camera.y;
    if (this.fixedToCamera) {
        this.cameraOffset.setTo(x,y);
    } else {
        this.x = x;
        this.y = y;
    }
    console.log(this.x + " - " + this.y + ' ~ ' + this.fixedToCamera);
    this.visible = true;
};

OgrePrototype.Menu.prototype.addButton = function (x, y, label, callbackFnc, callbackContext, overFrame, outFrame, downFrame, upFrame, options) {
    var wscale, hscale, btn, text, style, key, imgsrc;
    
    if (options) {
        style = options.style || {
            font : 'bold 10pt Arial',
            fill : '#f00',
            align: 'center'
        };
        
        key = options.key || this.numOfButtons + 1;

        imgsrc = options.imgsrc || 'icons-00';
    } else {
        style = {
            font : 'bold 10pt Arial',
            fill : '#f00',
            align: 'center'
        };
        
        key = this.numOfButtons + 1;

        imgsrc = 'icons-00';
    }
    
    btn = this.game.add.button(x, y, imgsrc, callbackFnc, callbackContext, overFrame, outFrame, downFrame, upFrame);
    
    //wscale = (this.properties.width - (this.properties.padding * 2)) / btn.width;
    wscale = 1;
    hscale = 1; // not sure how to decide height-scale yet... default to 2 for now
    
    btn.scale.setTo(wscale, hscale);
    btn.anchor.setTo(0.5,0.5);

    if (this.properties.orientation === 'horizontal') {
        btn.x = Math.floor(btn.width *  0.5) + (this.properties.padding + this.properties.spacing + this.properties.leftOffset + btn.width) * this.numOfButtons;
        btn.y = Math.floor(btn.height * 0.5) + this.properties.padding + this.properties.topOffset;
    } else {
        btn.x = Math.floor(btn.width * 0.5) + this.properties.padding + this.properties.leftOffset;
        btn.y = Math.floor(btn.height * 0.5) + (this.properties.padding + this.properties.spacing + this.properties.topOffset + btn.height) * this.numOfButtons;
    }

    
    text = this.game.add.text(0, 0, label, style);
    text.anchor.setTo(0.5,0.5);
    btn.addChild(text);
    text.visible = false;
    btn.onOverMouseOnly = true;
    btn.onInputOver.add(function () {text.visible = true;},this);
    btn.onInputOut.add(function () {text.visible = false;},this);
    
    this.add(btn);
    
    this.buttons[key] = {
        index : this.numOfButtons,
        btn : btn, 
        label : text, 
        callback: callbackFnc, 
        callbackContext: callbackContext
    };
    this.numOfButtons += 1;
};

OgrePrototype.Menu.prototype.getButton = function (key) {
    return this.buttons[key];
};

OgrePrototype.Menu.prototype.clearButtonHandle = function (key) {
    if (this.buttons[key].callback !== null) {
        this.buttons[key].btn.onInputUp.remove(this.buttons[key].callback, this.buttons[key].callbackContext);
    }
};

OgrePrototype.Menu.prototype.addButtonHandle = function (key, callback, callbackContext) {
    this.buttons[key].btn.onInputUp.add(callback, callbackContext);
    
    this.buttons[key].callback = callback;
    this.buttons[key].callbackContext = callbackContext;
};
