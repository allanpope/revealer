(function ($) {
  'use strict';

  $.fn.revealer = function(config) {

    var base = this,
        dots = [],
        pixelCoordinates = [],

        $textCanvas,
        textCanvasCtx,
        textCanvasWidth,
        textCanvasHeight,

        $canvas = $(base),
        canvasCtx = $canvas[0].getContext("2d"),
        canvasWidth,
        canvasHeight,

        revealedText = $canvas.data("reveal-text");

    /*
    Desc: Configure that come be overwritten on plugin init
    */
    base.config = $.extend({
      text: {
        message: 'Show me the message!',
        fontFamily: 'Rubik One',
        fontWeight: '300'
      },
      dots: {
        radius: 2,
        gapDistance: 1,
        extra: 100,
        alpha: 0.5,
        colors: ['252, 185, 37'],
        revealColor: ['252, 185, 37']
      },
    }, config);

    /*
    Desc: Init
    */
    base.init = function() {
      base.createTextCanvas();
      base.createRevealBtn();
      base.setCanvasSizes();
      base.writeRevealText();
      base.getTextCanvasData();
      base.createDots();
      base.redrawCanvas();
      base.events();
    };

    /*
    Desc: All plugin events
    */
    base.events = function() {
      base.revealBtn.on('click', function() {
         base.formRevealText();
         $(this).fadeOut(300);
      });
      $(window).on('resize', base.reset);
    };

    /*
    Desc: Create a canvas which we will write text on and use it to get information about where pixels are
    */
    base.createTextCanvas = function() {
      var textCanvas = '<canvas id="text-canvas"></canvas>';

      // Create canvas and add to page
      $(textCanvas).insertAfter(base);

      // Store reference to textCanvas
      $textCanvas = $('#' + $(textCanvas).attr('id'));
      textCanvasCtx = $textCanvas[0].getContext("2d", {alpha: false});
    }

    /*
    Desc: Create button that will trigger dot reveal
    */
    base.createRevealBtn = function() {
      var revealButton = '<button id="reveal-text-btn">' + base.config.text.message + '</button>';

      $(revealButton).insertAfter(base);

      // Store reference to reveal btn
      base.revealBtn = $('#' + $(revealButton).attr('id'));
    };

    /*
    Desc: Set width/height for canvas elements, to fix blurry elements
    */
    base.setCanvasSizes = function() {
      var windowWidth = $(window).width(),
          windowHeight = $(window).height();

      textCanvasHeight = $textCanvas.height();
      textCanvasWidth = windowWidth;

      canvasHeight = windowHeight;
      canvasWidth = windowWidth;

      $canvas[0].width  = windowWidth;
      $canvas[0].height = windowHeight;

      $textCanvas[0].width  = windowWidth;
      $textCanvas[0].height = textCanvasHeight;
    };

    /*
    Desc: Write styled text that dots will transform into
    */
    base.writeRevealText = function() {

      var fontSize = 120;

      // If text is longer than 10 characters we need to shrink it so it fits on screen
      if (revealedText.length > 10) {
        fontSize = 86;
      } else if (revealedText.length > 20) {
        fontSize = 60;
      }

      textCanvasCtx.fillStyle = '#24282f';
      textCanvasCtx.textAlign = 'center';
      textCanvasCtx.font = base.config.text.fontWeight + ' ' + fontSize + 'px ' + base.config.text.fontFamily;
      textCanvasCtx.fillText(revealedText.toUpperCase(), textCanvasWidth / 2, (textCanvasHeight) - 5);
    };

    /*
    Desc: Get array of data for the text canvas
    */
    base.getTextCanvasData = function() {
      var imageData;

      // Clear any previously stored data
      pixelCoordinates = [];

      // Grab array of image data containing info about each pixel
      imageData = textCanvasCtx.getImageData(0, 0, textCanvasWidth, textCanvasHeight).data;

      // Each pixel has four numbers attributed to it: R, G, B, A
      // Ignore the RGBA values, instead work out where a pixel is located
      for (var i = imageData.length; i >= 0; i -= 4) {

        // If pixel isnt empty
        if (imageData[i] !== 0) {

          // Store pixel x position(account for 4 numbers per a pixel)
          var x = (i / 4) % textCanvasWidth;
          // Store pixel y position relative to the center of the page
          var y = Math.floor(Math.floor(i / textCanvasWidth) / 4);

          // If has a position and number is divisble by dot radius plus a pixel gap then add cordinates to array.
          // Do this so circles dont overlap
          if( (x && x % (base.config.dots.radius * 2 + base.config.dots.gapDistance) == 0) && (y && y % (base.config.dots.radius * 2 + base.config.dots.gapDistance) == 0) ) {
            pixelCoordinates.push({x: x, y: y});
          }

        }
      };

    };

    /*
    Desc: Create dots and start animating them
    */
    base.createDots = function() {

      // Create amount of dots needed
      for (var i = 0; i < (pixelCoordinates.length + base.config.dots.extra); i++) {

        // Create a dot
        // - canvas to draw it onto
        // - in random x & y pos on canvas
        // - with random color from config
        // - with the alpha value
        var dot = new Dot(canvasCtx,
                          base.randomNumber(0, canvasWidth, true),
                          base.randomNumber(0, canvasHeight, true),
                          base.config.dots.radius,
                          base.config.dots.colors[base.randomNumber(0, base.config.dots.colors.length, true)],
                          base.config.dots.alpha);

        // Push to into an array of dots to reuse
        dots.push(dot);

        // Start animating dot
        base.animateDot(dot,
                        base.randomNumber(0, canvasWidth, true),
                        base.randomNumber(0, canvasHeight, true),
                        true);

      }
    };

    /*
    Desc: Grab dots to form reveal text
    */
    base.formRevealText = function() {

      for (var i = 0; i < pixelCoordinates.length; i++) {

        // Dont run if theres no dots
        if (dots[i] !== undefined) {

        base.animateDot(dots[i],
                         pixelCoordinates[i].x,
                         (pixelCoordinates[i].y + ((canvasHeight - textCanvasHeight) / 2)),
                         false);
        }

      }
    };

    /*
    Desc: Clear canvas and redraw canvas elements
    */
    base.redrawCanvas = function() {

      // Clear everything on canvas
      canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Loop over all dots and redraw there position
      for(var i = 0; i < dots.length; i++) {
        dots[i].draw(canvasCtx);
      }

      requestAnimationFrame(base.redrawCanvas);
    };

    /*
    Desc: Animate dot randomly around canvas board using GreenSock's animation library
    Param: @dot = dot to animate, @x = x position, @y = y position, @loop = Continually loop over function boolean
    */
    base.animateDot = function(dot, x, y, loop) {

      var x = x,
          y = y,
          speed = base.randomNumber(3, 6, false),
          delay = 0,
          alpha = base.config.dots.alpha;


      // Turn reveal word alpha to full color/1
      if(loop === false) {
        alpha = 1;
      }

      // Tween dot to coordinate to form number
      TweenMax.to(dot, speed, {
        x: x,
        y: y,
        alpha: alpha,
        ease: Cubic.easeInOut,
        delay: delay,
        onComplete: function() {
          if (loop) {
            base.animateDot(dot,
                          base.randomNumber(0, canvasWidth, true),
                          base.randomNumber(0, canvasHeight, true),
                          true);
          }
        }
      });
    };

    /*
    Desc: Reset to inital state
    */
    base.reset = function() {

      base.setCanvasSizes();
      base.writeRevealText();
      base.getTextCanvasData();

      // Randomise dots again
      for (var i = 0; i < dots.length; i++) {
        base.animateDot(dots[i],
                        base.randomNumber(0, canvasWidth, true),
                        base.randomNumber(0, canvasHeight, true),
                        true);
      }

      // Show
      base.revealBtn.fadeIn();
    };

    /*
    Desc: Return a random number between to specified numbers
    Param: @min = minium number, @max = maximum number, @round = to round a number or keep it to 3 decimal places: boolean
    */
    base.randomNumber = function(min, max, round) {
      var result = Math.random() * (max - min) + min;

      if (round) {
        result =  Math.floor(result);
      } else {
        result = result.toFixed(3);
      }

      return result;
    };

    // Initialize
    base.init();
  };

  /*
  Desc: Draw a dot on a canvas
  Param: @canvas = canvas to draw dot onto, @x = x position on canvas, @y = y position on canvas, @color = color of dot, @alpha = transparency of dot
  */
  function Dot(canvas, x, y, radius, color, alpha) {

    var base = this;
    base.canvas = canvas;
    base.x = x;
    base.y = y;
    base.radius = radius;
    base.color = color;
    base.alpha = alpha;

    this.draw = function() {
      base.canvas.beginPath();
      base.canvas.arc(base.x, base.y, base.radius, 0, 2 * Math.PI, false);
      base.canvas.fillStyle = 'rgba(' + base.color + ', ' + base.alpha + ')';
      base.canvas.fill();
    }
  };

})(jQuery);