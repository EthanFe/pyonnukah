const makeId = length => {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const makeUniqueId = existingIds => {
  const length = 15 // why not
  const maxTries = Math.pow(10, 7)
  let id = null
  let tries = 0
  while (id === null || (existingIds.find && existingIds.find(existingId => existingId === id) !== undefined) || existingIds[id] !== undefined) {
    id = makeId(length)
    tries++
    if (tries > maxTries) {
      throw new Error(`failed to create unique id for new game after ${maxTries} tries, frankly idk how you got this to break`)
    }
  }
  return id
}

module.exports = {
  makeUniqueId
}