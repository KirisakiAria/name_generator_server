const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  uid: Number,
  username: String,
  avatar: String,
  tel: String,
  password: String,
  date: String,
  vip_start: String,
  vip_expiry: String,
  vip: Boolean,
  history: [],
  favourites: [],
})

userSchema.statics.pushHistory = async function (tel, cb) {
  return this.findOne({ tel }, cb)
}

const User = mongoose.model('User', userSchema)

module.exports = User
