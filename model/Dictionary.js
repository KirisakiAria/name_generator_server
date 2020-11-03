const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DictionarySchema = new Schema({
  word: String,
  oldword:String,
  pinyin: String,
  explanation: String,
  radicals:String,
  strokes:Number,
  more: String,
})

const Dictionary = mongoose.model('Dictionary', DictionarySchema)

module.exports = Dictionary
