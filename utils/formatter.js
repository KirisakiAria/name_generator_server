const time = dateObj => {
  const year = padZero(dateObj.getFullYear())
  const month = padZero(dateObj.getMonth() + 1)
  const date = padZero(dateObj.getDate())
  return `${year}-${month}-${date}`
}

const padZero = value => {
  let newVal = value
  if (value < 10) {
    newVal = `0${value}`
  }
  return newVal
}

module.exports = { time }
