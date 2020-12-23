const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CuteWordSchema = new Schema({
  word: String,
  length: Number,
  classify: String,
  showable: Boolean,
  likedUsers: [String],
})

const CuteWord = mongoose.model('CuteWord', CuteWordSchema)

module.exports = CuteWord
