Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  root "application#index"

  get "/api/session/v1/session-info", to: "session#session_info"
  get "/api/session/v1/user-info", to: "session#user_info"

  get "/api/health/ping", to: "session#ping"
  get "/api/health/system-info", to: "session#system_info"

  get "/api-302/auth-sdk/v1/login", to: "sso#redirect_login"
  get "/api-302/auth-sdk/v1/logout", to: "sso#redirect_logout"
  get "/api-302/auth-sdk/v1/handle-sso", to: "sso#handle_sso"

  get "/api/v1/table", to: "data_table#table_page_result"
  post "/api/v1/table", to: "data_table#create_table"
  get "/api/v1/table/:tableId", to: "data_table#table_info"
  put "/api/v1/table/:tableId", to: "data_table#update_table"
  delete "/api/v1/table/:tableId", to: "data_table#delete_table"

  get '/api/v1/table/:tableId/record', to: "data_record#record_page_result"
  post '/api/v1/table/:tableId/record', to: "data_record#create_record"
  put '/api/v1/table/:tableId/batch-records/import', to: "data_record#import_records_batch"
  get '/api/v1/table/:tableId/record/:dataId', to: "data_record#get_record_info"
  put '/api/v1/table/:tableId/record/:dataId', to: "data_record#update_record"
  delete '/api/v1/table/:tableId/record/:dataId', to: "data_record#delete_record"

  put '/api/v1/table/:tableId/record/:dataId/pass', to: "data_record#pass_record"
  put '/api/v1/table/:tableId/record/:dataId/reject', to: "data_record#reject_record"

  get '/api/v1/table/:tableId/record-id', to: "data_record#record_page_record_ids"

  get '*unmatched_route', to: 'application#not_found'
  post '*unmatched_route', to: 'application#not_found'
  put '*unmatched_route', to: 'application#not_found'
end
