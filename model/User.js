const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  uid: Number,
  username: String,
  avatar: String,
  tel: String,
  password: String,
  date: String,
  vipStartTime: Number,
  vipEndTime: Number,
  vip: Boolean,
  history: [],
  favourites: [],
})

const User = mongoose.model('User', userSchema)

module.exports = User
