const mongoose = require('mongoose')
const Schema = mongoose.Schema

const coupleSchema = new Schema({
  words: [],
  type: String,
  length: Number,
})

const Couple = mongoose.model('Couple', coupleSchema)

module.exports = Couple
