const handleTime = time => {
  return time.replace('T', ' ').replace('.000Z', '')
}

module.exports = {
  handleTime,
}
