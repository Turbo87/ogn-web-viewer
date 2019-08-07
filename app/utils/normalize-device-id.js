const RE_HEXDEC = /^[0-9a-fA-F]+$/;

export function normalizeDeviceId(id) {
  if (!id) return null;

  let length = id.length;

  if (length === 6) {
    if (RE_HEXDEC.test(id)) {
      // Perform guestimates based on 6-digit device ID.
      // In case device ID is in the range D00000 to DFFFFF it is most likely a FLARM ID
      if (id.substring(0,1) == 'D') {
        return `FLR${id}`;
      // In case device ID is between 004000 to E94FFF it is most likely a ICAO-ID - this logic coule be elaborated more based on the country correlation: http://www.aerot$
      // TODO express the above correctly
      } else if (id.substring(0,1) == '3E') {
        return `ICA${id}`;
      // In case device ID is between 000000 to 003FFF 
      // TODO: Express above correctly and replace '00'
      } else if (id.substring(0,2) == '00') {
        return `OGN${id.substring(2)}`;
      } else {
        // If nothing of the above matches assume FLARM as best guess
        return `FLR${id}`;
      }
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
