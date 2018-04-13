import interact from 'interactjs';
import $ from 'jquery';
import Howler from 'howler';

window.$ = $;

// styles
require('./style.scss');

// background music
const backgroundSound = new Howl({
  src: [
    require('./assets/background.mp3'),
    require('./assets/background.webm')
  ],
  autoplay: false,
  volume: .1,
  loop: true
});

// start screen
$('#startbutton').click(() => {
  $('#intro').fadeOut('slow', () => {
    $('#game').show('slow')
  });
});

// garbage sound with multiple variations
const garbageSound = new Howl({
  src: [require('./assets/garbage.mp3')],
  sprite: {
    '1': [800, 1600],
    '2': [1900, 2800],
    '3': [4000, 1000],
    '4': [8500, 2000]
  }
});

// sounds
const sounds = {
  pathetic: new Howl({
    src: [require('./assets/fucking-pathetic.mp3')],
    volume: 2,
  }),
  brain: new Howl({
    src: [require('./assets/where-is-your-brain.mp3')],
    volume: 2,
  }),
  cold: new Howl({
    src: [require('./assets/stone-cold.mp3')],
    volume: 2,
  }),
  itsraw: new Howl({
    src: [require('./assets/itsraw.mp3')],
    volume: 2,
  }),
  itsrawcomon: new Howl({
    src: [require('./assets/itsrawcomon.mp3')],
    volume: 2,
  }),
  rubber: new Howl({
    src: [require('./assets/rubber.mp3')],
    volume: 2,
  }),
};

// controls for controlling background music
$('#controls').click(() => {
  if (backgroundSound.playing())
    backgroundSound.pause()
  else
    backgroundSound.play()
})

let ingredientNr = 1;

let dragAmount = 0;

interact('.item')
  .draggable({
    // enable inertial throwing
    inertia: true,
    // keep the element within the area of it's parent
    restrict: {
      restriction: "parent",
      endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
    // enable autoScroll
    autoScroll: false,

    // call this function on every dragmove event
    onmove: dragMoveListener,
    // call this function on every dragend event
    onend: function (event) {
      if (grilling.length > 0) {
        document.querySelector('#grill').classList.add('on');
      } else {
        document.querySelector('#grill').classList.remove('on');
      }
      var textEl = event.target.querySelector('p');

      /*
      textEl && (textEl.textContent =
        'moved a distance of '
        + (Math.sqrt(Math.pow(event.pageX - event.x0, 2) +
          Math.pow(event.pageY - event.y0, 2) | 0))
          .toFixed(2) + 'px');
          */
    }
  }).on('dragstart', (event) => {
    // only if the data-unique attribute is not set
    dragAmount++;
    event.target.style.zIndex = dragAmount;
    if (event.target.getAttribute('data-unique')) {
      return;
    }
    if (!event.target.getAttribute('data-ingredient-no')) {
      $(event.target).clone().appendTo('.wrapper');
      event.target.setAttribute('data-ingredient-no', ingredientNr++);
    }
  });

function dragMoveListener(event) {
  var target = event.target,
    // keep the dragged position in the data-x/data-y attributes
    x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
    y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  // translate the element
  target.style.webkitTransform =
    target.style.transform =
    'translate(' + x + 'px, ' + y + 'px)';

  // update the posiion attributes
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}

// this is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener;

const grilling = [];
window.grilling = grilling;

let gordonAngryLevel = 0; // out of 5
const gordonAngry = (type) => {
  gordonAngryLevel++;
  $('#angriness').css('width', (gordonAngryLevel/5)*100+'%')
  $('#gordon').removeClass().addClass('mad'+gordonAngryLevel);
  sounds[type].play();
  if (gordonAngryLevel > 5) {
    // game over
    const gameOverVideo = $('video#bad:first');
    gameOverVideo.fadeIn()
    gameOverVideo.get(0).play()
  }
  setTimeout(() => {
    $('#gordon').removeClass();
  }, sounds[type].duration()*1000);
};
const win = () => {
  const video = $('video#good:first');
  video.fadeIn()
  video.get(0).play()
}
const gameOver = (type) => {
  $('#angriness').css('width', '300%')
  $('#gordon').removeClass().addClass('mad3');
  sounds[type].play();
  setTimeout(() => {
    const gameOverVideo = $('video#bad:first');
    gameOverVideo.fadeIn()
    gameOverVideo.get(0).play()
  }, sounds[type].duration()*1000);
}

// interval that handles the grilling of stuff
setInterval(() => {
  grilling.forEach((el) => {
    const original = parseInt(el.getAttribute('data-grilled')) || 0;
    el.setAttribute('data-grilled', original+1);
    const contrast = ((30-original)/30)*2
    $(el).css('filter', `contrast(${contrast}) brightness(${contrast})`)
    if (original === 30)
      return gordonAngry('pathetic');
    if (original === 20)
      return gordonAngry('pathetic');
    if (original === 20)
      return gordonAngry('pathetic');
  })
}, 500)

let rawMeatOnce = false;
interact('.dropzone').dropzone({
  // only accept elements matching this CSS selector
  accept: '.item',
  // Require a 75% element overlap for a drop to be possible
  overlap: 0.75,

  // listen for drop related events:

  ondropactivate: function (event) {
    // add active dropzone feedback
    event.target.classList.add('drop-active');
  },
  ondragenter: function (event) {
    var draggableElement = event.relatedTarget,
      dropzoneElement = event.target;

    // feedback the possibility of a drop
    dropzoneElement.classList.add('drop-target');
    draggableElement.classList.add('can-drop');
    //draggableElement.textContent = 'Dragged in';
  },
  ondragleave: function (event) {
    // remove the drop feedback style
    console.log('dragleave', event)
    switch (event.target.id) {
      case 'grill':
        grilling.splice(grilling.indexOf(event.relatedTarget), 1);
        break;
      default:
        console.log('unknown')
    }
  },
  ondrop: function (event) {
    event.target.classList.add('on');
    switch (event.target.id) {
      case 'grill':
        if (!!event.relatedTarget.getAttribute('data-no-grill')) {
          $(event.relatedTarget).remove();
          gordonAngry('brain');
          return;
        }
        grilling.push(event.relatedTarget);
        break;
      case 'trash':
        $(event.relatedTarget).remove();
        const randomNr = Math.round((Math.random()*4)+1).toString();
        garbageSound.play(randomNr);
        break;
      case 'plate':
        if (event.relatedTarget.getAttribute('data-meat') && event.relatedTarget.getAttribute('data-grilled')<10) {
          if (!rawMeatOnce) {
            gordonAngry('itsraw');
            rawMeatOnce = true;
          } else {
            gameOver('itsrawcomon')
          }
        }
        if (event.relatedTarget.getAttribute('data-meat') && event.relatedTarget.getAttribute('data-grilled')>20) {
            gordonAngry('rubber');
        }
        if (event.relatedTarget.classList.value.indexOf('steak') > -1 && event.relatedTarget.getAttribute('data-grilled') > 10 && event.relatedTarget.getAttribute('data-grilled') < 20) {
          win()
        }
        console.log('dropped on plate', event.relatedTarget.getAttribute('data-meat'))
        break;
      default:
        console.log('unknown:', event.target.id, event);
    }
  },
  ondropdeactivate: function (event) {
    event.target.classList.remove('drop-active');
    event.target.classList.remove('drop-target');
  }
});