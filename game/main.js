var score = 0;
var user_number = 0;
// Create our 'main' state that will contain the game
var mainState = {
    preload: function() { 
        // This function will be executed at the beginning     
        // That's where we load the images and sounds

        if(!game.device.desktop) {
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            game.scale.setMinMax(game.width/2, game.height/2, game.width, game.height);
        }

        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        // Load the horse sprite
        game.load.image('horse', '/assets/horse.png');
        game.load.image('sky', '/assets/sky.png');
        game.load.image('pipe', '/assets/pipe.png');
        game.load.image('win_screen', '/assets/phaser.png');
    },

    create: function() { 
        // This function is called after the preload function     
        // Here we set up the game, display sprites, etc.

        // Change the background color of the game to blue
        // game.stage.backgroundColor = '#71c5cf';   
        game.add.sprite(0, 0, 'sky');
        this.labelScore = game.add.text(20, 20, "Score: " + score, { font: "30px Arial", fill: "#ffffff" });
        this.labelUsers = game.add.text(20, 50, "Users: " + user_number, { font: "30px Arial", fill: "#ffffff" });

        // Create an empty group
        this.pipes = game.add.group();

        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Display the horse at the position x=100 and y=245
        this.horse = game.add.sprite(100, 245, 'horse');

        // Add physics to the horse
        // Needed for: movements, gravity, collisions, etc.
        game.physics.arcade.enable(this.horse);

        // Add gravity to the horse to make it fall
        this.horse.body.gravity.y = 1000;

        // Call the 'jump' function when the spacekey is hit
        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);
        game.input.onDown.add(this.jump, this);

        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);
        this.score_checker = game.time.events.loop(1500, this.checkScore, this);
    },

    update: function() {
        // This function is called 60 times per second    
        // It contains the game's logic

        // If the horse is out of the screen (too high or too low)
        // Call the 'restartGame' function 
        if (this.horse.y < 0 || this.horse.y > 490)
            this.restartGame();

        // game.physics.arcade.overlap(this.horse, this.pipes, this.restartGame, null, this);
        game.physics.arcade.overlap(this.horse, this.pipes, this.bump, null, this);

        if (this.horse.angle < 20)
            this.horse.angle += 1;
    },

    checkScore: function() {
        if (score >= 500) {
            var win_screen = game.add.sprite(game.world.centerX, game.world.centerY, 'win_screen');
            win_screen.anchor.setTo(0.5, 0.5);
            game.paused = true;
        }
    },

    bump: function() {
        score -= 1;
        // if (this.bird.alive == false)
        //     return;
        // this.horse.alive = false;
        // game.time.events.remove(this.timer);
        // this.pipes.forEach(function(p){
        //     p.body.velocity.x = 0;
        // }, this);
        this.restartGame();
    },

    // Make the horse jump 
    jump: function() {
        // Add a vertical velocity to the horse
        this.horse.body.velocity.y = -350;

        // Create an animation on the horse
        var animation = game.add.tween(this.horse);

        // Change the angle of the horse to -20° in 100 milliseconds
        animation.to({angle: -20}, 100);

        // And start the animation
        animation.start();
    },

    // Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        game.state.start('main');
    },

    addOnePipe: function(x, y) {
        // Create a pipe at the position x and y
        var pipe = game.add.sprite(x, y, 'pipe');

        // Add the pipe to our previously created group
        this.pipes.add(pipe);

        // Enable physics on the pipe
        game.physics.arcade.enable(pipe);

        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200;

        // Automatically kill the pipe when it's no longer visible
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function() {
        score += 1;
        this.labelScore.text = "Score: " + score;
        // Randomly pick a number between 1 and 5
        // This will be the hole position
        var hole = Math.floor(Math.random() * 5) + 1;

        // Add the 6 pipes
        // With one big hole at position 'hole' and 'hole + 1'
        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole + 1) 
                this.addOnePipe(400, i * 60 + 10);
    },
};

// Server interaction
var socket = io.connect('https://' + document.domain + ':' + location.port);

socket.on('users_number', function(msg) {
    var user_number = msg.data;
    console.log(msg.data);
    mainState.labelUsers.text = "Users: " + user_number;
    });

// Initialize Phaser, and create a 400px by 490px game
var game = new Phaser.Game(400, 490, Phaser.AUTO);

// Add the 'mainState' and call it 'main'
game.state.add('main', mainState); 

// Start the state to actually start the game
game.state.start('main');
