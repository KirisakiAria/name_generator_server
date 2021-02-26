const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SurnameSchema = new Schema({
  surname: String,
})

const Surname = mongoose.model('Surname', SurnameSchema)

module.exports = Surname
