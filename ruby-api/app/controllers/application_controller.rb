class ApplicationController < ActionController::API
  before_action do
    # set_no_cache
    response.headers["Cache-Control"] = "no-cache, no-store"

    # parse JWT
    begin
      @user = JsonWebToken.verify(request.cookies[Constants::JwtKey])
    rescue => e
      puts e
      @user = nil
    end
  end

  around_action :around_action

  before_action :auth, :except => [:session_info, :redirect_login, :redirect_logout, :handle_sso, :ping, :record_page_record_ids]

  def around_action
    begin
      yield
    rescue => e
      STDERR.puts e
      render :plain => e.message, :status => :bad_request
    end
  end

  def not_found
    render :plain => 'Not Found', :status => 404
  end

  #
  # def index
  #   puts '!!!!!!!!!!!!!!!'
  #   render :plain => 'Hello.', :status => :ok
  # end

  def auth
    unless @user
      render :plain => "JWT Authorization missing.", :status => :unauthorized
    end
  end
end
