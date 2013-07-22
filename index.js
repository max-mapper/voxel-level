var leveljs = require('level-js')
var crunch = require('voxel-crunch')

module.exports = VoxelLevel

function VoxelLevel(db) {
  if (!(this instanceof VoxelLevel)) return new VoxelLevel(db)
  this.db = db
  return true
}

VoxelLevel.prototype.load = function(worldName, chunkPosition, dimensions, cb) {
  var chunkLength = dimensions[0] * dimensions[1] * dimensions[2]
  var chunkIndex = chunkPosition.join('|') + '|' + chunkLength
  this.db.sublevel(worldName).get(chunkIndex, { valueEncoding: 'binary' }, function(err, rle) {
    if (err) return cb(err)
    var voxels = new Uint8Array(chunkLength)
    crunch.decode(rle, voxels)
    cb(false, {position: chunkPosition, voxels: voxels, dimensions: dimensions})
  })
}

VoxelLevel.prototype.store = function(worldName, chunk, cb) {
  var rle = crunch.encode(chunk.voxels)
  var key = chunk.position.join('|')
  key += '|' + chunk.voxels.length
  this.db.sublevel(worldName).put(key, rle, { valueEncoding: 'binary' }, cb)
}
