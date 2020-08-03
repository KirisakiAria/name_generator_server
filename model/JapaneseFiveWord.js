const mongoose = require('mongoose')
const Schema = mongoose.Schema

const JapaneseFiveWordSchema = new Schema({
  word: String,
})

const JapaneseFiveWord = mongoose.model(
  'JapaneseFiveWord',
  JapaneseFiveWordSchema,
)

module.exports = JapaneseFiveWord
