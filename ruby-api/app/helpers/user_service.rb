class UserService
  @instance = new

  private_class_method :new

  def self.instance
    @instance
  end

  @is_ready = false

  def self.auto_reload_data
    if @is_ready
      return
    end

    @is_ready = true
    @instance.reload_app_info

    Thread.new do
      while true
        @instance.reload_app_info_if_need
        sleep(10)
      end
    end
  end

  def _make_request(api_path)
    options = MyConfig::Options.userService
    uri = URI("#{options[:urlBase]}#{api_path}")
    auth = Base64.encode64("#{options[:username]}:#{options[:password]}")
    [uri, {
      Authorization: "Basic #{auth}"
    }]
  end

  def get_app_version
    uri, headers = _make_request('/api/v1/app-version')
    res = Net::HTTP.get_response(uri, headers)
    res.body.to_i
    # res.body if res.is_a?(Net::HTTPSuccess)
  end

  def get_app_full_info
    uri, headers = _make_request('/api/v1/app-full-info')
    res = Net::HTTP.get_response(uri, headers)
    JSON.parse(res.body)
  end

  @group_member_mapper = {}
  @group_permission_mapper = {}

  attr_reader :data
  def reload_app_info
    @data = get_app_full_info
    @latest_version = @data['version']
    groups = @data['groups']

    # @group_member_mapper
    group_member_mapper = {}
    groups.each do |group|
      unless group_member_mapper[group['groupId']]
        group_member_mapper[group['groupId']] = {}
      end
      group['memberIdList'].each do |memberId|
        group_member_mapper[group['groupId']][memberId] = true
        group_member_mapper[group['groupId']][memberId.downcase] = true
      end
    end
    @group_member_mapper = group_member_mapper

    # @group_permission_mapper
    group_permission_mapper = {}
    groups.each do |group|
      group_permission_mapper[group['groupId']] = group['permissionKeys'].reduce({}) { |result, cur|
        result[cur] = 1
        result
      }
    end
    @group_permission_mapper = group_permission_mapper

    permission_list = PermissionHelper.flatten_permission_meta(@data['permissionMeta'])
    @permission_data = permission_list.reduce({}) { |result, cur|
      result[cur['permissionKey']] = cur
      result
    }

    @data
  end

  def reload_app_info_if_need
    @latest_version = get_app_version
    unless @data
      reload_app_info
      return
    end
    if @data['version'] == @latest_version
      return
    end
    puts "#{@data['name']}[#{@data['appid']}] 检查到新的配置版本 (#{@data['version']} -> #{@latest_version})，正在更新"
    reload_app_info
  end

  def check_user_is_admin(email)
    !!@data && @data['powerUserList'].include?(email)
  end

  def app_groups
    !!@data ? @data['groups'] : []
  end

  def get_groups_for_user(email)
    groups = app_groups
    groups.select do |group|
      mapper = @group_member_mapper[group['groupId']]
      !!mapper && (!!mapper['*'] || mapper[email] || mapper[email.downcase])
    end
  end

  def get_permission_key_map_for_user(email)
    permission_key_map = {}
    groups = get_groups_for_user(email)
    groups.each do |group|
      keys = @group_permission_mapper[group['groupId']].keys
      keys.each do |key|
        permission_key_map[key] = 1
      end
    end
    permission_key_map
  end

  def check_user_has_permission(email, permission_key)
    key_map = get_permission_key_map_for_user(email)
    !!key_map[permission_key]
  end
end

UserService.auto_reload_data
