import { Application } from 'pixi.js';
import { createActor } from 'xstate';
import { gameMachine } from './engine/game-state';

/** Initialize the core engine and rendering pipeline. */
async function init() {
  const app = new Application();
  await app.init({ background: '#1099bb', resizeTo: window });
  document.body.appendChild(app.canvas);

  const actor = createActor(gameMachine);
  actor.subscribe((snapshot) => {
    console.log('State updated:', snapshot.value);
  });
  actor.start();
}

init().catch((err: unknown) => {
  console.error('Initialization failed:', err);
});