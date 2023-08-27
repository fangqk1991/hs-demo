class SsoController < ApplicationController
  def index
    render :json => {}, :status => :ok
  end

  def redirect_login
    admin_base_url = MyConfig::Options.adminBaseURL
    redirect_to OauthClient.get_authorize_uri(admin_base_url), allow_other_host: true
  end

  def redirect_logout
    response.delete_cookie(Constants::JwtKey, {
      path: '/',
    })
    admin_base_url = MyConfig::Options.adminBaseURL
    logout_url = OauthClient.build_logout_url(request.referrer ? request.referrer : admin_base_url)
    redirect_to logout_url, allow_other_host: true
  end

  def handle_sso
    code, redirect_uri = request.query_parameters[:code], request.query_parameters[:state]
    raise StandardError.new 'code invalid.' unless code
    raise StandardError.new 'redirect_uri invalid.' unless redirect_uri

    access_token = OauthClient.get_access_token_from_code(code)

    options = OauthClient.options
    res = Net::HTTP.get_response(URI(options[:userInfoURL]), {
      Authorization: "Bearer #{access_token}"
    })
    raise StandardError.new 'user_info error.' unless res
    user_info = JSON.parse(res.body)
    user_info['isAdmin'] = UserService.instance.check_user_is_admin(user_info['email'])
    user_info['permissionKeyMap'] = UserService.instance.get_permission_key_map_for_user(user_info['email'])
    response.set_cookie(Constants::JwtKey, {
      value: JsonWebToken.encode(user_info),
      path: '/',
      expires: 24.hours.from_now,
      httponly: true,
      # secure: true,
    })
    redirect_to redirect_uri, allow_other_host: true
  end
end
