require "test_helper"

class JwtTest < ActiveSupport::TestCase
  test "encode & decode" do
    jwt_secret = MyConfig::Options.adminJwtSecret

    payload = {
      data: 'test',
      exp: Time.now.to_i + 24 * 3600 * 30,
    }

    token = JWT.encode payload, jwt_secret, 'HS256'

    puts token

    decoded_token, = JWT.decode token, jwt_secret, true

    puts decoded_token
  end
end
