function adjustSpeed() {
  var targetFPS = 7.5; // Define your target FPS
  var minFPS = minimumFpsValue; // Minimum FPS value
  var targetSpeed = difficulty === 'hard' ? speedHard : speedNormal; // Define the base speed for the difficulty level
  var adjustedSpeed = targetSpeed * (targetFPS / Math.max(fps));

  var scoreBasedSpeedAdjustment = Math.floor(score / 50); // Increase speed by 10% for every 50 points

  adjustedSpeed += (adjustedSpeed * 0.1 * scoreBasedSpeedAdjustment);

  speed = adjustedSpeed;
}

function adjustPipeSpawnRate() {
  var targetFPS = 7.5; // Define your target FPS
  var minFPS = minimumFpsValue; // Minimum FPS value
  var targetFrameRate = difficulty === 'hard' ? pipeSpawnHard : pipeSpawnNormal; // Define the base speed for the difficulty level
  var adjustedFrameRate = targetFrameRate // * (targetFPS / Math.max(fps, minFPS * 2.3));
  var scoreBasedFrameRateAdjustment = Math.floor(score / 50); // Increase frame rate by 10% for every 50 points

  adjustedFrameRate += (adjustedFrameRate * 0.07 * scoreBasedFrameRateAdjustment);

  pipeSpawnRate = adjustedFrameRate;
}

let isPipesCleared = false;

// Define variables for FPS control
var fpsInterval = 1000 / 60; // Interval for 60 FPS (in milliseconds)
var lastUpdateTime = performance.now();
var accumulatedTime = 0;

//Updates the game state every frame.
function update() {

  var currentTime = performance.now();
    var deltaTime = currentTime - lastUpdateTime;
    lastUpdateTime = currentTime;
    
    // Accumulate the elapsed time
    accumulatedTime += deltaTime;
    
    // Limit the accumulated time to a maximum value
    var maxAccumulatedTime = fpsInterval * 2;
    if (accumulatedTime > maxAccumulatedTime) {
      accumulatedTime = maxAccumulatedTime;
    }
  
    // Update the game state in fixed time steps
    while (accumulatedTime >= fpsInterval) {

  handleVerticalMovement();
  
  
    // Reset ground position when it goes off-screen
  if (ground.x <= -ground.width) {
    ground.x = 0;
  }
  
  // Reset ceiling position when it goes off-screen
  if (ceiling.x <= -ceiling.width) {
    ceiling.x = 0;
  }
  
  // Reset skybox position when it goes off-screen
  if (skybox.x <= -skybox.width) {
    skybox.x = 0;
  }
  
  // Reset skybox position when it goes off-screen
  if (secondSkybox.x <= -secondSkybox.width) {
    secondSkybox.x = 0;
  }
  
    // Move the ground
    ground.x -= groundSpeed;
  
    // Move the ceiling
    ceiling.x -= groundSpeed;
  
    // Move the skybox
    skybox.x -= skyboxSpeed;
  
    // Move the skybox
    secondSkybox.x -= secondSkyboxSpeed;
  
    // Check for collision with top border
    if (bird.y < 10 / resolutionAdjust) {
      isGameOver = true; // Set the game over state
      drawBird();
      gameOver(); // Call the game over function
      deathSound.play();
      JUMP = -1.6 
      GRAVITY = 1.2 * secondResolutionAdjust
      document.removeEventListener("mousedown", moveUp)
      document.removeEventListener("touchstart", touchMoveUp)
    }
    
    // Check for collision with bottom border
    if (bird.y + bird.height > canvas.height + 80 / resolutionAdjust) {
      deathSound.play();
      gameOver();
      return;
    }

    // Check for collision with pipes
    if (checkCollision()) {
      deathSound.play()
      backgroundMusic.pause()
      isGameOver = true; // Set the game over state
  }  
    
    // Check if the current power-up has expired
    var currentTime = Date.now();
    if (currentTime > starPowerUpEndTime) {
      // Power-up has expired, reset effects
      starSpeedMultiplier = 1;
      isInvincible = false;
      clearInterval(powerUpCoinIntervalId); // Clear the current coin interval
    }
    if (currentTime > ghostPowerUpEndTime) {
      // Power-up has expired, reset effects
      isGhost = false;
      ghostSpeedMultiplier = 1;
    }
  
    if (currentTime > sizePowerUpEndTime) {
      // Power-up has expired, reset effects
      HITBOX_RIGHT = -40 * (canvas.width / 2560);
      HITBOX_TOP = -75 * (canvas.height / 1080); 
      HITBOX_BOTTOM = -10 * (canvas.height / 1080); 
      HITBOX_LEFT = 140 * (canvas.width / 2560); 
      birdUp.width = 250 * (canvas.width * resolutionAdjust / 2560);
      birdUp.height = 250 * (canvas.height * resolutionAdjust / 1080);
      birdDown.width = 250 * (canvas.width * resolutionAdjust / 2560);
      birdDown.height = 250 * (canvas.height * resolutionAdjust / 1080);
      isSize = false;
    }
  
    if (currentTime > reduceGapPowerUpEndTime && !isSize) {
      PIPE_GAP = 320 * (canvas.height / 1080);
      isReduceGap = false;
      reduceGapSpeedMultiplier = 1;
      HITBOX_BOTTOM = -10 * (canvas.height / 1080);
    }
  
    if (currentTime > reduceGapPowerUpEndTime && isSize) {
      PIPE_GAP = 320 * (canvas.height / 1080);
    isReduceGap = false;
    reduceGapSpeedMultiplier = 1;
    HITBOX_BOTTOM = -80 * (canvas.height / 1080);
    }
  
  
    if (isInvincible) {
      speed = speed * starSpeedMultiplier;
      pipeStartSkip = 0;
      pipes = [];
        ghosts = [];
        sizes = [];
        reduceGaps = [];
    }
  
    if (isGhost) {
      speed = speed * ghostSpeedMultiplier;
        stars = [];
        sizes = [];
        reduceGaps = [];
    }

    if (isSize) {
      stars = [];
      ghosts = [];
      reduceGaps = [];
    }

    if (isReduceGap){
      stars = [];
      ghosts = [];
      sizes = [];
    }
  
    if (isReduceGap && !isSize) {
      PIPE_GAP = 450 * (canvas.height / 1080);
      speed = speed * reduceGapSpeedMultiplier;
      HITBOX_BOTTOM = -80 * (canvas.height / 1080);
    }
  
    if (isReduceGap && isSize){
      PIPE_GAP = 450 * (canvas.height / 1080);
      speed = speed * reduceGapSpeedMultiplier;
      HITBOX_BOTTOM = -80 * (canvas.height / 1080);
      HITBOX_BOTTOM = -150 / secondResolutionAdjust * (canvas.height / 1080);
      }

     // Clear canvas before drawing new elements each frame
     ctx.clearRect(0, 0, canvas.width * resolutionAdjust, canvas.height * resolutionAdjust);
  
      // Check if the game is started
      if (!isGameStarted) {
        // Display the logo and buttons
        logo.style.display = "block";
        difficultyButtons.style.display = "block";
        storeButton.style.display = "block";
        startButton.style.display = "block";
        settingsButton.style.display = "block"
        drawCollectedCoins();
        return;
        
      } 
       if (isGameStarted) {
        // Hide the logo and buttons once the game starts
        logo.style.display = "none";
        sfxButton.style.display = "none";
        musicButton.style.display = "none";
        difficultyButtons.style.display = "none";
        storeButton.style.display = "none";
        startButton.style.display = "none";
        settingsButton.style.display = "none"
      }
  
    // Draw skybox
    drawSkybox();

    // Draw Bird
    if (enableVerticalMovement && !isGameOver) 
      drawBird();
    if (isGameOver) {
      drawDeathAnimation(); // Call the drawing function when collision is detected
    }
  
    // Draw second skybox
    drawSecondSkybox();
  
    //Spawn in coins
    updateCoins();
  
    //Spawn in stars
    updateStars();
  
    //Spawn in ghosts
    updateGhosts();
  
    //Spawn in Sizes
    updateSizes();
  
    //Spawn in reduce gap
    updateReduceGaps();
  
    //Draw and move pipes
    updatePipes();
  
    // Draw floor and ceiling;
    drawSpikes();
  
    // Draw the score counter
    drawScore();
  
    // Call the drawFPS function
    drawFPS();
  
    // Draw the coin counter
    drawCollectedCoins();
    
    // Draw the message before vertical movement starts and start flying animation
    if (!enableVerticalMovement && isGameStarted){
    drawReadyMessage();
    drawAnimatedBird();
    isMovingUp = false;
    }
  
    // Draw the message afte vertical movement starts
    if (enableVerticalMovement && score < 1 && isGameStarted){
    drawGoMessage();
    }

    if (score > 0 && score % 50 === 0){
      drawGameSpeedIncreaseMessage();
    }

    if (score > 0 && score % 50 === 0) {
      if (!isPipesCleared) {
        pipes = [];
        pipeStartSkip = 0;
        isPipesCleared = true;
      }
    } else {
      isPipesCleared = false;
    }
    
    // Check if bird passes pipe and add score
    checkScore();
  
    var currentTime = performance.now();
    var deltaTime = currentTime - lastTime;
    lastTime = currentTime;
  
    // Accumulate the elapsed time
    elapsedTime += deltaTime;
  
    // Calculate frames per 100ms
    frameCount++;
    if (elapsedTime >= 100) {
      var framesPer100ms = frameCount / (elapsedTime / 100);
      fps = framesPer100ms.toFixed(1); // Convert framesPer100ms to a string with one decimal place
      frameCount = 0;
      elapsedTime = 0;
      adjustSpeed();
      adjustPipeSpawnRate();
    }
  
    var minFPS = minimumFpsValue; // Minimum FPS value
  
    // Calculate the desired frame rate for adding a pipe every 0.5 seconds
    var targetFrameRate = pipeSpawnRate;
    var framesPerPipe = Math.max(fps / targetFrameRate, minFPS);
  
    frameCounter++;
  
    // Check if it's time to add a new pipe
    if (frameCounter >= framesPerPipe && frameCounter >= minFramesPerPipe) {
      addPipe(); 
      frameCounter = 0; // Reset the frame counter
    }

    // Subtract the fixed time step from the accumulated time
    accumulatedTime -= fpsInterval;
  }

  requestAnimationFrame(update);
  }