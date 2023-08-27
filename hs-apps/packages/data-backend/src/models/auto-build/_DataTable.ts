import { FeedBase } from 'fc-feed'
import { MyDatabase } from '../../services/MyDatabase'

const _cols: string[] = [
  // prettier-ignore
  'table_id',
  'name',
  'description',
  'version',
  'field_items_str',
  'extras_info',
  'author',
  'update_author',
  'is_deleted',
  'created_at',
  'updated_at',
]
const _insertableCols: string[] = [
  // prettier-ignore
  'table_id',
  'name',
  'description',
  'version',
  'field_items_str',
  'extras_info',
  'author',
  'update_author',
  'is_deleted',
]
const _modifiableCols: string[] = [
  // prettier-ignore
  'name',
  'description',
  'version',
  'field_items_str',
  'extras_info',
  'author',
  'update_author',
  'is_deleted',
  'created_at',
]

const _timestampTypeCols: string[] = [
  // prettier-ignore
  'created_at',
  'updated_at',
]

export default class _DataTable extends FeedBase {
  /**
   * @description [char(32)] UUID，具备唯一性
   */
  public tableId!: string
  /**
   * @description [varchar(127)] 模型名称
   */
  public name!: string
  /**
   * @description [text] 模型描述
   */
  public description!: string
  /**
   * @description [int] 版本号
   */
  public version!: number
  /**
   * @description [mediumtext] 字段列表，JSON 数组
   */
  public fieldItemsStr!: string
  /**
   * @description [mediumtext] 附加信息，空 | JSON 字符串
   */
  public extrasInfo!: string
  /**
   * @description [varchar(127)] 创建者
   */
  public author!: string
  /**
   * @description [varchar(127)] 更新者
   */
  public updateAuthor!: string
  /**
   * @description [tinyint] 是否已被删除
   */
  public isDeleted!: number
  /**
   * @description [timestamp] 创建时间
   */
  public createdAt!: string
  /**
   * @description [timestamp] 更新时间
   */
  public updatedAt!: string

  public constructor() {
    super()
    this.setDBProtocolV2({
      database: MyDatabase.dataDB,
      table: 'data_table',
      primaryKey: 'table_id',
      cols: _cols,
      insertableCols: _insertableCols,
      modifiableCols: _modifiableCols,
      timestampTypeCols: _timestampTypeCols,
    })
    this._reloadOnAdded = true
    this._reloadOnUpdated = true
  }

  public fc_defaultInit() {
    // This function is invoked by constructor of FCModel
    this.name = ''
    this.description = ''
    this.version = 0
    this.fieldItemsStr = ''
    this.extrasInfo = ''
    this.author = ''
    this.updateAuthor = ''
    this.isDeleted = 0
  }

  public fc_propertyMapper() {
    return {
      tableId: 'table_id',
      name: 'name',
      description: 'description',
      version: 'version',
      fieldItemsStr: 'field_items_str',
      extrasInfo: 'extras_info',
      author: 'author',
      updateAuthor: 'update_author',
      isDeleted: 'is_deleted',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  }
}
