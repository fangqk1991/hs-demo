# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2023_08_23_121505) do
  create_table "data_table", primary_key: "_rid", id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_general_ci", force: :cascade do |t|
    t.string "table_id", limit: 32, null: false, collation: "ascii_bin", comment: "UUID，具备唯一性"
    t.string "name", limit: 127, default: "", null: false, comment: "模型名称"
    t.text "description", comment: "模型描述"
    t.integer "version", default: 0, null: false, comment: "版本号"
    t.text "field_items_str", size: :medium, comment: "字段列表，JSON 数组"
    t.text "extras_info", size: :medium, comment: "附加信息，空 | JSON 字符串"
    t.string "author", limit: 127, default: "", null: false, comment: "创建者"
    t.string "update_author", limit: 127, default: "", null: false, comment: "更新者"
    t.integer "is_deleted", limit: 1, default: 0, null: false, comment: "是否已被删除"
    t.timestamp "created_at", default: -> { "CURRENT_TIMESTAMP" }, null: false, comment: "创建时间"
    t.timestamp "updated_at", default: -> { "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" }, null: false, comment: "更新时间"
    t.index ["created_at"], name: "created_at"
    t.index ["table_id"], name: "table_id", unique: true
  end

end
