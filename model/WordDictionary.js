const mongoose = require('mongoose')
const Schema = mongoose.Schema

const WordDictionarySchema = new Schema({
  word: String,
  oldword: String,
  length: Number,
  pinyin: String,
  explanation: String,
  radicals: String,
  strokes: Number,
  more: String,
  type: String,
})

const WordDictionary = mongoose.model('WordDictionary', WordDictionarySchema)

module.exports = WordDictionary
