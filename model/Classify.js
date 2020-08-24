const mongoose = require('mongoose')
const Schema = mongoose.Schema

const classifySchema = new Schema({
  name: String,
})

const Classify = mongoose.model('Classify', classifySchema)

module.exports = Classify
