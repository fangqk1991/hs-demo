class DataRecordController < ApplicationController
  def record_page_result
    handler = DataSpecHandler.new(params[:tableId]).table_handler
    render :json => handler.get_page_result(request.query_parameters), :status => :ok
  end

  def create_record
    handler = DataSpecHandler.new(params[:tableId]).table_handler
    render :json => handler.create_record(request.request_parameters, {
      'withoutAudit' => UserService.instance.check_user_has_permission(@user['email'], DataPermissionKey::Data_Approval_Create),
      'author' => @user['email'],
    }), :status => :ok
  end

  def import_records_batch
    handler = DataSpecHandler.new(params[:tableId]).table_handler
    handler.bulk_upsert_records(JSON.parse(request.raw_post), {
      'author' => @user['email'],
      'canInsert' => UserService.instance.check_user_has_permission(@user['email'], DataPermissionKey::Data_Approval_Create),
      'canUpdate' => UserService.instance.check_user_has_permission(@user['email'], DataPermissionKey::Data_Approval_Update),
    })
    render :status => :ok
  end

  def get_record_info
    handler = DataSpecHandler.new(params[:tableId]).table_handler
    render :json => handler.get_data_record(params[:dataId]), :status => :ok
  end

  def update_record
    handler = DataSpecHandler.new(params[:tableId]).table_handler
    data_info = handler.get_data_record(params[:dataId])
    render :json => { dataStatus: handler.update_record(data_info, request.request_parameters, {
      'withoutAudit' => UserService.instance.check_user_has_permission(@user['email'], DataPermissionKey::Data_Approval_Update),
      'author' => @user['email'],
    }) }, :status => :ok
  end

  def delete_record
    handler = DataSpecHandler.new(params[:tableId]).table_handler
    data_info = handler.get_data_record(params[:dataId])
    render :json => { dataStatus: handler.delete_record(data_info, {
      'withoutAudit' => UserService.instance.check_user_has_permission(@user['email'], DataPermissionKey::Data_Approval_Delete),
      'author' => @user['email'],
    }) }, :status => :ok
  end

  def pass_record
    key_map = UserService.instance.get_permission_key_map_for_user(@user['email'])
    handler = DataSpecHandler.new(params[:tableId]).table_handler
    data_info = handler.get_data_record(params[:dataId])
    handler.check_reviewing_permission(data_info, key_map)
    handler.pass_audit_data(data_info)
    render :status => :ok
  end

  def reject_record
    key_map = UserService.instance.get_permission_key_map_for_user(@user['email'])
    handler = DataSpecHandler.new(params[:tableId]).table_handler
    data_info = handler.get_data_record(params[:dataId])
    handler.check_reviewing_permission(data_info, key_map)
    handler.reject_audit_data(data_info)
    render :status => :ok
  end

  def record_page_record_ids
    handler = DataSpecHandler.new(params[:tableId]).table_handler
    page_result = handler.get_page_result(request.query_parameters, ['data_id'])
    render :json => {
      totalCount: page_result[:totalCount],
      dataIdList: page_result[:items].map { |item| item['data_id'] },
    }, :status => :ok
  end
end
