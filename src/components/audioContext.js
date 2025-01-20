import * as THREE from 'three';

export default class AudioContextManager {
  constructor() {
    this.audioContext = null;
  }

  initializeAudioContext(camera) {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('AudioContext created after user gesture.');
      const listener = new THREE.AudioListener();
      camera.add(listener);
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        console.log('AudioContext resumed.');
      });
    }

    if (this.audioContext.state === 'running') {
      console.log('AudioContext initialized');
    }
  }
}