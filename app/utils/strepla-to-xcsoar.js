export function convertTask(taskRecord) {
  let taskType;
  if (taskRecord.isRacing) {
    taskType = 'RT';
  } else if (taskRecord.isAAT) {
    taskType = 'AAT';
  } else {
    throw new Error(`Unknown task type: ${taskRecord.ruleName}`);
  }

  let points = taskRecord.turnpoints.map((turnpoint, i) => {
    let { scoring, tp } = turnpoint;

    let type = i === 0 ? 'Start' : i === taskRecord.turnpoints.length - 1 ? 'Finish' : 'Turn';

    let observationZone;
    if (scoring.type === 'LINE') {
      observationZone = `<ObservationZone type="Line" length="${scoring.width}"/>`;
    } else if (scoring.type === 'CYLINDER') {
      observationZone = `<ObservationZone type="Cylinder" radius="${scoring.radius}"/>`;
    } else if (scoring.type === 'KEYHOLE') {
      if (scoring.radiusCylinder !== 500 || scoring.radiusSector !== 10000 || scoring.angle !== 90) {
        throw new Error(`Unsupported keyhole turnpoint type`);
      }

      observationZone = `<ObservationZone type="Keyhole"/>`;
    } else if (scoring.type === 'AAT SECTOR') {
      if (scoring.radial1 !== scoring.radial2) {
        throw new Error(`Unsupported AAT sector type`);
      }

      observationZone = `<ObservationZone type="Cylinder" radius="${scoring.radius}"/>`;
    } else {
      throw new Error(`Unknown turnpoint type: ${scoring.type}`);
    }

    return `  <Point type="${type}">
    <Waypoint id="${tp.id}" name="${tp.name}">
      <Location latitude="${tp.lat}" longitude="${tp.lng}"/>
    </Waypoint>
    ${observationZone}
  </Point>`;
  });

  return `<Task${taskRecord.isAAT ? ` aat_min_time="${taskRecord.minTime}"` : ''} type="${taskType}">
${points.join('\n')}
</Task>`;
}
