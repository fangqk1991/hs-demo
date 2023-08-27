class JsonWebToken
  SECRET_KEY = MyConfig::Options.adminJwtSecret

  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY)
  end

  def self.verify(token)
    decoded_token, = JWT.decode token, SECRET_KEY, true
    HashWithIndifferentAccess.new decoded_token
  end
end