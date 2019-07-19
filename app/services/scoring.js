import Service from '@ember/service';

export default class extends Service {
  task = null;

  setTask(task) {
    this.set('task', task);
  }
}
