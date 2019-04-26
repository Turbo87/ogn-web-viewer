export function normalizeDeviceId(id) {
  if (id.length === 8) {
    let senderDetails = parseInt(id.substring(0, 2), 16);
    if (!isNaN(senderDetails)) {
      let addressType = senderDetails & 0b00000011;
      if (addressType === 0b01) {
        return `ICA${id.substring(2)}`;
      } else if (addressType === 0b10) {
        return `FLR${id.substring(2)}`;
      } else if (addressType === 0b11) {
        return `OGN${id.substring(2)}`;
      }
    }

    return null;
  }

  if (id.length === 6) {
    return `FLR${id}`;
  }

  return id;
}
