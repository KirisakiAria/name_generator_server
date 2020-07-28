const mongoose = require('mongoose')
const Schema = mongoose.Schema

const japaneseTwoWordSchema = new Schema({
  word: String,
})

const JapaneseTwoWord = mongoose.model('JapaneseTwoWord', japaneseTwoWordSchema)

module.exports = JapaneseTwoWord
