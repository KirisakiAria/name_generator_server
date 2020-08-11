const crypto = require('crypto')

const sha512 = value => {
  const hmac = crypto.createHmac('sha512', 'SRkCWkwnlrtV3khPkhK9681rHwLUrA')
  return hmac.update(value).digest('hex')
}

module.exports = sha512
