const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')

//JWT验证
class JWT {
  //生成时初始化传tel，校验时初始化传token
  constructor(data) {
    this.data = data
  }

  //生成
  generateToken() {
    const cert = fs.readFileSync(
      path.resolve(__dirname, '../pem/private_key_pkcs8.pem'),
    ) //私钥 可以自己生成
    const token = jwt.sign(
      {
        user: this.data.user,
        role: this.data.role,
      },
      cert,
      {
        header: {
          typ: 'JWT',
          alg: 'RS256',
        },
        algorithm: 'RS256',
        //expiresIn: '15 days',
        issuer: 'bigteacher',
        audience: 'bigteacher',
      },
    )
    return token
  }

  //验证，返回解包的tel
  verifyToken() {
    const token = this.data
    const cert = fs.readFileSync(
      path.join(__dirname, '../pem/rsa_public_key.pem'),
    ) //公钥 可以自己生成
    let res
    try {
      const result = jwt.verify(token, cert, { algorithms: ['RS256'] })
      if (result) {
        res = {
          code: '1000',
          message: '身份校验成功',
          user: result.user,
          role: result.role,
        }
      }
    } catch (e) {
      res = {
        code: '3007',
        message: '登录状态失效，请重新登录',
      }
    }
    return res
  }
}

//生成token
module.exports = JWT
