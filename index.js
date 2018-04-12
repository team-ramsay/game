import interact from 'interactjs';
import $ from 'jquery';
import Howler from 'howler';

// assets
import soundUrl from './assets/fucking-pathetic.mp3';
import backgroundMp3 from './assets/background.mp3';
import backgroundWebm from './assets/background.webm';

// styles
require('./style.scss');

// sounds
const backgroundSound = new Howl({
  src: [backgroundWebm, backgroundMp3],
  autoplay: true,
  volume: .1,
  loop: true
});

// background music
var sound = new Howl({
  src: [soundUrl],
  volume: 2,
});

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

      textEl && (textEl.textContent =
        'moved a distance of '
        + (Math.sqrt(Math.pow(event.pageX - event.x0, 2) +
          Math.pow(event.pageY - event.y0, 2) | 0))
          .toFixed(2) + 'px');
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

let gordonAngryLevel = 0;
const gordonAngry = (type) => {
  gordonAngryLevel++;
  $('#gordon').removeClass().addClass('mad'+gordonAngryLevel);
  sound.play();
  setTimeout(() => {
    $('#gordon').removeClass();
  }, sound.duration()*1000);
};
setInterval(() => {
  grilling.forEach((el) => {
    const original = parseInt(el.getAttribute('data-grilled')) || 0;
    el.setAttribute('data-grilled', original+1);
    if (original === 30)
      return gordonAngry('meat');
    if (original === 20)
      return gordonAngry('meat');
    if (original === 10)
      return gordonAngry('meat');
  })
}, 500)


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
    draggableElement.textContent = 'Dragged in';
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
    event.relatedTarget.textContent = 'Dropped';
    //console.log('yeahs', event);
    event.target.classList.add('on');
    switch (event.target.id) {
      case 'grill':
        console.log('dropped on grill')
        grilling.push(event.relatedTarget);
        break;
      default:
        console.log('unknown')
    }
  },
  ondropdeactivate: function (event) {
    // remove active dropzone feedback
    event.target.classList.remove('drop-active');
    event.target.classList.remove('drop-target');
  }
});