export function initialize(appInstance) {
  appInstance.lookup('service:igc-replay').start();
}

export default { initialize };
