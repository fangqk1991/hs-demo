# README
* 架构说明: [《全栈应用架构》](https://fqk.io/full-stack-app-architecture/)

### 项目初始化
```
#  安装 node_modules
yarn install

# （向相关同学索要），添加 config/development.js
```

### 相关依赖
* MySQL 连接信息 - 见 `config/data.default.js`，可根据需要自行调整
* MySQL 数据表 - 手动导入 `packages/data-backend/schemas/data-demo.sql` 或在 ruby-api 项目下使用 migrate 操作均可

### 启动「数据管理」后端项目
```
cd packages/data-backend
yarn start
# 后端服务的启动将占用 5400 端口
```

### 启动「数据管理」前端项目
```
cd packages/data-frontend
yarn start
# 前端服务的启动将占用 5399 端口，API 请求会转发到 5400 端口
```
