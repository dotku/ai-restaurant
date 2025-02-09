import { fileURLToPath } from "url";

function getFilename(metaUrl) {
  return fileURLToPath(metaUrl);
}

function formatLog(filename, message) {
  return `[${filename}] ${message}`;
}

export function getLogger(metaUrl) {
  const filename = getFilename(metaUrl);
  return {
    log: (message) => console.log(formatLog(filename, message)),
    info: (message) => console.info(formatLog(filename, message)),
    error: (message) => console.error(formatLog(filename, message)),
    debug: (message) => console.debug(formatLog(filename, message)),
    warn: (message) => console.warn(formatLog(filename, message)),
  };
}

export default getLogger;
