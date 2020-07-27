const mongoose = require('mongoose')
const Schema = mongoose.Schema

const japaneseThreeIdiomSchema = new Schema({
  word: String,
})

const JapaneseThreeIdiom = mongoose.model(
  'JapaneseThreeIdiom',
  japaneseThreeIdiomSchema,
)

module.exports = JapaneseThreeIdiom
