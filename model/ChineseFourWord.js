const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ChineseFourWordSchema = new Schema({
  word: String,
})

const ChineseFourWord = mongoose.model('ChineseFourWord', ChineseFourWordSchema)

module.exports = ChineseFourWord
