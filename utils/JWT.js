const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')

class JWT {
  //生成时初始化传tel，校验时初始化传token
  constructor(data) {
    this.data = data
  }

  //生成
  generateToken() {
    let cert = fs.readFileSync(
      path.resolve(__dirname, '../pem/private_pkcs8.pem'),
    ) //私钥 可以自己生成
    let token = jwt.sign(
      {
        tel: this.data,
      },
      cert,
      {
        header: {
          typ: 'JWT',
          alg: 'RS256',
        },
        algorithm: 'RS256',
        //expiresIn: '15 days',
        issuer: 'kirisakiaria',
        audience: 'kirisakiaria',
      },
    )
    return token
  }

  //验证，返回解包的tel
  verifyToken() {
    let token = this.data
    let cert = fs.readFileSync(
      path.join(__dirname, '../pem/rsa_public_key.pem'),
    ) //公钥 可以自己生成
    let res
    try {
      let result = jwt.verify(token, cert, { algorithms: ['RS256'] })
      if (result) {
        res = {
          code: '1000',
          message: '身份校验成功',
          tel: result.tel,
        }
      }
    } catch (e) {
      res = {
        code: '2000',
        message: '登陆状态失效，请重新登录',
      }
    }
    return res
  }
}

//生成token
module.exports = JWT
