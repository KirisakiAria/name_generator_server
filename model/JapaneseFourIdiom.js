const mongoose = require('mongoose')
const Schema = mongoose.Schema

const japaneseFourIdiomSchema = new Schema({
  word: String,
})

const JapaneseFourIdiom = mongoose.model(
  'JapaneseFourIdiom',
  japaneseFourIdiomSchema,
)

module.exports = JapaneseFourIdiom
