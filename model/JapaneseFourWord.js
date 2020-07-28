const mongoose = require('mongoose')
const Schema = mongoose.Schema

const japaneseFourWordSchema = new Schema({
  word: String,
})

const JapaneseFourWord = mongoose.model(
  'JapaneseFourWord',
  japaneseFourWordSchema,
)

module.exports = JapaneseFourWord
