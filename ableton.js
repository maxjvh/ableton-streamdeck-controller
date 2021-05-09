const EventEmitter = require('events');
const { Client, Server } = require('node-osc');

module.exports = class Ableton extends EventEmitter {
  constructor() {
    super();
    this.isPlaying = false;
    this.client = new Client('127.0.0.1', 11000);
    this.server = new Server(11001, '127.0.0.1');
    
    this.client.send('/live/song/start_listen/is_playing');
    
    this.server.on('message', msg => {
      const [address, value] = msg;
      switch (address) {
        case '/live/set/get/is_playing': {
          this.isPlaying = value;
          this.emit('isPlayingChanged', this.isPlaying);
          break;
        }
      }
    });
  }

  togglePlayback() {
    this.client.send(this.isPlaying ? '/live/song/stop_playing' : '/live/song/start_playing');
  }
}
