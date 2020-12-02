const mongoose = require('mongoose')
const Schema = mongoose.Schema

const planSchema = new Schema({
  planId: Number,
  title: String,
  currentPrice: String,
  originalPrice: String,
})

const Plan = mongoose.model('Plan', planSchema)

module.exports = Plan
