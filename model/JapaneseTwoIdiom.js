const mongoose = require('mongoose')
const Schema = mongoose.Schema

const japaneseTwoIdiomSchema = new Schema({
  word: String,
})

const JapaneseTwoIdiom = mongoose.model(
  'JapaneseTwoIdiom',
  japaneseTwoIdiomSchema,
)

module.exports = JapaneseTwoIdiom
