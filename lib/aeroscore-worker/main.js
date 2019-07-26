import registerPromiseWorker from 'promise-worker/register';

import AeroscoreWorker from './worker';

self.process = {};


let worker = new AeroscoreWorker();

registerPromiseWorker(({ type, data }) => {
  if (worker[type]) {
    return worker[type](data);
  }
});
