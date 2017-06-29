function init(){
    game.renderer.renderSession.roundPixels = true;
}
function preload(){
	game.load.image('background', 'images/background.png');
    game.load.json('level:1', 'data/level01.json'); 
    game.load.image('ground', 'images/ground.png');
    game.load.image('grass:8x1', 'images/grass_8x1.png');
    game.load.image('grass:6x1', 'images/grass_6x1.png');
    game.load.image('grass:4x1', 'images/grass_4x1.png');
    game.load.image('grass:2x1', 'images/grass_2x1.png');
    game.load.image('grass:1x1', 'images/grass_1x1.png');
    game.load.image('hero', 'images/hero_stopped.png');
    game.load.audio('sfx:jump', 'audio/jump.wav');
    game.load.spritesheet('coin', 'images/coin_animated.png', 22, 22);
    game.load.audio('sfx:coin', 'audio/jump.wav');
    game.load.spritesheet('spider', 'images/spider.png', 42, 32);
    game.load.image('invisible-wall', 'images/invisible_wall.png');
};
function create(){
	game.add.image(0, 0, 'background');
  loadLevel(this.game.cache.getJSON('level:1'));
    leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    upKey.onDown.add(function(){
        jump();
    })
    sfxCoin = game.add.audio('sfx:coin');
};
function update(){
   handleInput();
   handleCollisions();
};
function loadLevel (data) {
    platforms = game.add.group();
    coins = game.add.group();
    spiders = game.add.group();
    enemyWalls = game.add.group();
    enemyWalls.visible = false;
    data.platforms.forEach(spawnPlatform, this);
    data.coins.forEach(spawnCoin, this);
    game.physics.arcade.gravity.y = 1200;
    spawnCharacters({hero: data.hero, spiders: data.spiders});

};
function spawnPlatform(platform) {
    game.add.sprite(platform.x, platform.y, platform.image);
    var sprite = platforms.create(platform.x, platform.y, platform.image);
    game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;
    spawnEnemyWall(platform.x, platform.y, 'left');
    spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
};
function spawnCharacters (data) {
    hero = game.add.sprite(data.hero.x, data.hero.y, 'hero');
    hero.anchor.set(0.5, 0.5);
    game.physics.enable(hero);
    hero.body.collideWorldBounds = true;
    data.spiders.forEach(function (spider){
        var sprite = game.add.sprite(spider.x, spider.y, 'spider');
        spiders.add(sprite);
        sprite.anchor.set(0.5);
        sprite.animations.add('crawl', [0, 1, 2], 8, true);
        sprite.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 12);
        sprite.animations.play('crawl');
        game.physics.enable(sprite);
        sprite.body.collideWorldBounds = true;
        sprite.body.velocity.x = 100;
    })
};
function move(direction){
    hero.body.velocity.x = direction * 200;
     if (hero.body.velocity.x < 0) {   
        hero.scale.x = -1;
    }
    else if (hero.body.velocity.x > 0) {
        hero.scale.x = 1;
    }
}
function handleInput(){
    if (leftKey.isDown) {
        move(-1);
    }
    else if (rightKey.isDown) {
        move(1);
    }
    else {
        move(0);
    }
}
function handleCollisions(){
    game.physics.arcade.collide(hero, platforms);
    game.physics.arcade.overlap(hero, coins, onHeroVsCoin, null);
    game.physics.arcade.collide(spiders, platforms);
    game.physics.arcade.collide(spiders, enemyWalls);
};
function jump(){
    hero.body.velocity.y = -600;
    var canJump = hero.body.touching.down;
    if (canJump) {
        hero.body.velocity.y = -600;
        sfxJump.play();
    }
    return canJump;
};
function spawnCoin(coin) {
    var sprite = coins.create(coin.x, coin.y, 'coin');
    sprite.anchor.set(0.5, 0.5);
    sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    sprite.animations.play('rotate');
    game.physics.enable(sprite);
    sprite.body.allowGravity = false;
};
function onHeroVsCoin(hero, coin){
    coin.kill();
    sfxCoin.play();
};
function spawnEnemyWall(x, y, side){
    var sprite = enemyWalls.create(x, y, 'invisible-wall');
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);
    game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
}
function moveSpider(){
    spiders.forEach(function (spider){
        if (spider.body.touching.right || spider.body.blocked.right) {
            spider.body.velocity.x = -100;
        }
        else if (spider.body.touching.left || spider.body.blocked.left) {
            spider.body.velocity.y = -100;
        }
    })
}
var game = new Phaser.Game(960, 600, Phaser.AUTO, 'game', {init: init, preload: preload, create: create, update: update});