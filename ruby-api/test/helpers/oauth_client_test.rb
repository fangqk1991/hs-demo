require "test_helper"

class OauthClientTest < ActiveSupport::TestCase
  test "get_authorize_uri" do
    puts OauthClient.get_authorize_uri('123')
    assert true
  end
end
