export function normalizeDeviceId(id) {
  if (id.startsWith('06') && id.length === 8) {
    return `FLR${id.substr(2)}`;
  }

  if (id.length === 6) {
    return `FLR${id}`;
  }

  return id;
}
