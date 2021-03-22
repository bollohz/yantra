const fs = require('fs');

/**
 * @param {any[]} array
 * @param {(arg0: any, arg1: number, arg2: any) => void} callback
 */
async function asyncForEach(array, callback){
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function getStackPath() {
  return JSON.parse(fs.readFileSync(process.cwd() + "/gaea.json"));
}

function isDict(v){
  return typeof v === 'object' && v !== null && !(v instanceof Array) && !(v instanceof Date);
}

module.exports = {
  asyncForEach,
  getStackPath,
  isDict,
  getStackResoruces: () => {
    return getStackPath()['resources'];
  },
  getStackEntities: () => {
    return getStackPath()['entities'];
  },
  getStackTags: () => {
    return getStackPath()['tags'];
  },
  getGeneralProvider: () => {
    return getStackPath()['generalProvider'] || false
  }
};
