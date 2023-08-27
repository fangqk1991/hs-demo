class SessionController < ApplicationController
  def session_info
    render :json => {
      env: Rails.env,
      tags: [],
      codeVersion: '',
      userInfo: @user,
      config: {
        appName: MyConfig::Options['appName'],
      }
    }, :status => :ok
  end

  def user_info
    render :json => @user, :status => :ok
  end

  def ping
    render :plain => 'PONG', :status => :ok
  end

  def system_info
    render :json => {
      env: Rails.env,
      tags: [],
      codeVersion: ENV['CODE_VERSION'],
      runningMachine: 'Ruby VM',
    }, :status => :ok
  end
end
