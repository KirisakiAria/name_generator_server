const mongoose = require('mongoose')
const Schema = mongoose.Schema

const coupleSchema = new Schema({
  words: [String],
  type: String,
  length: Number,
  showable: Boolean,
})

const Couple = mongoose.model('Couple', coupleSchema)

module.exports = Couple
