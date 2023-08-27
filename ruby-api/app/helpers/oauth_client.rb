class OauthClient
  def self.options
    MyConfig::Options.adminSSO
  end

  def self.get_authorize_uri(state = '')
    options = self.options
    query_params = {
      response_type: 'code',
      client_id: options[:clientId],
      redirect_uri: options[:callbackUri],
      scope: options[:scope],
    }
    if state
      query_params[:state] = state
    end
    "#{options[:baseURL]}#{options[:authorizePath]}?#{query_params.to_query}"
  end

  def self.build_logout_url(redirect_uri)
    query_params = {
      redirect_uri: redirect_uri,
    }
    "#{options[:baseURL]}#{options[:logoutPath]}?#{query_params.to_query}"
  end

  def self.get_access_token_data(code)
    options = self.options
    uri = URI("#{options[:baseURL]}#{options[:tokenPath]}")
    res = Net::HTTP.post_form(uri, {
      client_id: options[:clientId],
      client_secret: options[:clientSecret],
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: options[:callbackUri],
    })
    JSON.parse(res.body)
  end

  def self.get_access_token_from_code(code)
    token_data = self.get_access_token_data(code)
    token_data['access_token']
  end
end

