# README

### 项目初始化
```
bundle install

# （向相关同学索要）添加 config/my_config.yml
```

### 相关依赖
* MySQL 连接信息 - 见 `config/database.yml`，可根据需要自行调整

### 启动后端项目
```
# 后端服务的启动将占用 5400 端口（前端转发指定端口）
# 故需要先关闭 NodeJS 版本的后端服务

rails s -p 5400
```
