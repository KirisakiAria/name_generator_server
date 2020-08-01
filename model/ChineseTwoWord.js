const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ChineseTwoWordSchema = new Schema({
  word: String,
})

const ChineseTwoWord = mongoose.model('ChineseTwoWord', ChineseTwoWordSchema)

module.exports = ChineseTwoWord
