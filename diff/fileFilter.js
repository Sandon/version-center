import fileFilterRules from '../config/fileFilterRules'
/**
 * check whether the file should be filtered
 * @param filename
 * @param path
 * @returns {boolean} true: filtered; false: not filtered
 */
export default function fileFilter (filename, path) {
  if (!filename && !path)
    return true

  if (filename) {
    for (let rule of fileFilterRules.filenameRules) {
      if (rule.test(filename)) {
        return true
      }
    }
  }

  if (path) {
    for (let rule of fileFilterRules.pathRules) {
      if (rule.test(path)) {
        return true
      }
    }
  }

  return false
}