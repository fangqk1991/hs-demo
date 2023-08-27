require "test_helper"

class UserServiceTest < ActiveSupport::TestCase
  test "get data" do
    assert_not_empty UserService.instance.data
    puts UserService.instance.data
  end

  test "get_permission_key_map_for_user" do
    puts UserService.instance.get_permission_key_map_for_user('admin-hs@fangcha.net')
  end
end
