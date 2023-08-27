class DataTableController < ApplicationController
  def table_page_result
    @tables = DataTable.where({ is_deleted: 0 })
    render :json => {
      offset: 0,
      length: @tables.length,
      totalCount: @tables.length,
      items: @tables.map { |table| table.model_for_client },
    }, :status => :ok
  end

  def table_info
    handler = DataSpecHandler.new(params[:tableId])
    table = handler.prepare_table
    render :json => table.model_for_client, :status => :ok
  end

  def create_table
    table = DataTable.generate({}.merge(request.request_parameters).merge({ 'author' => @user['email'] }))
    render :json => table.model_for_client, :status => :ok
  end

  def update_table
    handler = DataSpecHandler.new(params[:tableId])
    table = handler.prepare_table
    table.update_infos({}.merge(request.request_parameters).merge({ 'author' => @user['email'] }))
    render :json => table.model_for_client, :status => :ok
  end

  def delete_table
    handler = DataSpecHandler.new(params[:tableId])
    table = handler.prepare_table
    table.is_deleted = 1
    table.update_author = @user['email']
    table.save
    render :status => :ok
  end
end
