# CREATE DATABASE `demo_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
# USE demo_db;

CREATE TABLE IF NOT EXISTS data_table
(
    _rid            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    table_id        CHAR(32)        NOT NULL COLLATE ascii_bin COMMENT 'UUID，具备唯一性',
    name            VARCHAR(127)    NOT NULL DEFAULT '' COMMENT '模型名称',
    description     TEXT COMMENT '模型描述',
    version         INT             NOT NULL DEFAULT '0' COMMENT '版本号',
    field_items_str MEDIUMTEXT COMMENT '字段列表，JSON 数组',
    extras_info     MEDIUMTEXT COMMENT '附加信息，空 | JSON 字符串',
    author          VARCHAR(127)    NOT NULL DEFAULT '' COMMENT '创建者',
    update_author   VARCHAR(127)    NOT NULL DEFAULT '' COMMENT '更新者',
    is_deleted      TINYINT         NOT NULL DEFAULT 0 COMMENT '是否已被删除',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE (table_id),
    INDEX (created_at)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;

