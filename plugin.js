#!./bin/node
const fs = require('fs');
const WebSocket = require('ws');
const Ableton = require('./ableton.js');

const [,,,port,,uuid,,event,,info] = process.argv;

const ws = new WebSocket(`ws://localhost:${port}`);

const contexts = {};

const ableton = new Ableton();

ableton.on('isPlayingChanged', isPlaying => {
  for (const context of contexts['audio.mjvh.ableton.playpause']) {
    sendMessage({
      event: 'setTitle',
      context,
      payload: {
        title: isPlaying ? 'Pause' : 'Play'
      }
    });
  }
});

function handleMessage(data) {
  log(JSON.stringify(data));
  switch (data.event) {
    case 'keyDown':
      switch (data.action) {
        case 'audio.mjvh.ableton.playpause':
          ableton.togglePlayback();
          break;
      }
      break;
    case 'willAppear': {
      if (!contexts[data.action]) {
        contexts[data.action] = [];
      }
      contexts[data.action].push(data.context);
      break;
    }
    case 'willDisappear': {
      if (!contexts[data.action]) {
        break;
      }
      contexts[data.action] = contexts[data.action].filter(c => c !== data.context);
    }
  }
}

function sendMessage(data) {
  ws.send(JSON.stringify(data));
}

function log(message) {
  fs.writeFileSync('./log.txt', JSON.stringify(message) + '\n', { flag: 'a' });
}

ws.on('open', () => {
  sendMessage({ event, uuid });
});

ws.on('message', data => {
  try {
    handleMessage(JSON.parse(data));
  } catch (e) {
    fs.writeFileSync('./errors.log', e.toString() + '\n', { flag: 'a' });
  }
});
