const RE_HEXDEC = /^[0-9a-fA-F]+$/;

export function normalizeDeviceId(id) {
  if (!id) return null;

  let length = id.length;

  if (length === 6) {
    if (RE_HEXDEC.test(id)) {
      return `FLR${id}`;
    }
  } else if (length === 8) {
    if (RE_HEXDEC.test(id)) {
      let senderDetails = parseInt(id.substring(0, 2), 16);
      let addressType = senderDetails & 0b00000011;
      if (addressType === 0b01) {
        return `ICA${id.substring(2)}`;
      } else if (addressType === 0b10) {
        return `FLR${id.substring(2)}`;
      } else if (addressType === 0b11) {
        return `OGN${id.substring(2)}`;
      }
    }
  } else if (length === 9) {
    if (RE_HEXDEC.test(id.substring(3))) {
      return id;
    }
  }

  return null;
}
