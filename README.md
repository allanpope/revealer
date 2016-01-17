# Revealer

Jquery plugin used to reveal a hidden world through a canvas particle animation. Plugin inspired from a [Codepen expirment](http://codepen.io/allanpope/pen/eNgGJm) I created.

## Dependencies
* jQuery
* Greensock Tweenmax

## Usage
Initiate plugin with `$("#canvas").revealer();`

Add a data attribute to the canvas with the word you want to reveal. `<canvas id="canvas" data-reveal-text="Hello"></canvas>
`

### Configuration
Options can be passed through to customise it as you need.
Colors need to be passed in, in an RGB format.

```javascript
$args = {
  text: {
    message: 'Show me the message!',
    fontFamily: 'Rubik One',
    fontWeight: '300'
  },
  dots: {
    radius: 2,
    gapDistance: 1,
    extra: 100, // 0 will mean there is exactly enough dots to form word
    alpha: 0.5,
    colors: ['61, 207, 236', '255, 244, 174', '255, 211, 218', '151, 211, 226'], // RGB format
    revealColor: ['252', '185', '37']
  }
};

$("#canvas").revealer($args);
```


### Issues
Known issues

* Small holes appear in revealed text sometimes.