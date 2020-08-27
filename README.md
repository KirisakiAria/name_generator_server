# 彼岸自在-服务

### 启动服务

npm run start

### 使用 supervisor 启动服务

npm run dev

### 请求状态对应的 code

- 1000：成功
- 2000：增删改查 失败
- 2001：词语已存在
- 2002：点赞数已满
- 3000：用户已存在
- 3001：手机号或密码错误
- 3002：验证码错误
- 3003：同一手机号一天最多接收五次
- 3004：同一手机号请相隔一分钟再请求
- 3005：同一 IP 一天最多请求 15 次验证码
- 3006：请先发送验证码
- 3007：登陆状态失效
- 3008：无此用户信息，请重新登录
- 3009：暗号错误
- 9000：请求错误
- 9001：app 信息不匹配
- 9002：请求的接口不存在
