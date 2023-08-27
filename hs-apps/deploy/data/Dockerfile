########################################
FROM node:14-alpine AS FILES_CACHE

# /data/source-files: 构建所需的完整源代码
# /data/meta-files 相关的内容变更频率低，可大幅提升构建过程的缓存命中率
# /data/prod-meta-files: /data/meta-files 的精简版，移除了与生产环境无关的依赖
WORKDIR /data/source-files
COPY . .

# 构建仅包含 package.json 和 yarn.lock 的 /data/meta-files
RUN mkdir -p /data/meta-files \
    && find . -not -path "*/node_modules/*" -name "package.json" \
      | xargs -i dirname {} \
      | xargs -i sh -c "mkdir -p /data/meta-files/{} && cp {}/package.json /data/meta-files/{}" \
    && cp /data/source-files/yarn.lock /data/meta-files

# 格式化 package.json
RUN node ./deploy/deps/purify-package-json.js /data/meta-files

# 构建 /data/prod-meta-files
RUN mkdir -p /data/prod-meta-files/packages \
    && cp -r /data/meta-files/package.json /data/meta-files/yarn.lock /data/prod-meta-files

# 将运行时配置文件移动到 /data/config-files 中，避免其影响缓存命中
RUN mkdir -p /data/config-files \
    && mv /data/source-files/config/*.js /data/config-files/ \
    && mv /data/config-files/*default.js /data/source-files/config/

###### FILES_CACHE 阶段个性化代码 START ######
# 复制本次构建项目的 package.json 到 /data/prod-meta-files
RUN cp -r /data/meta-files/packages/data-backend /data/meta-files/packages/data-frontend /data/prod-meta-files/packages
# 移除 /data/source-files/packages 与本次构建无关的 packages 目录其他工程
RUN find /data/source-files/packages \! -name "data-*" -mindepth 1 -maxdepth 1 -print | xargs rm -rf
# 移除 /data/source-files/deploy 下与本次构建无关的文件
RUN find /data/source-files/deploy \! -name "*deps*" \! -name "data" -mindepth 1 -maxdepth 1 -print | xargs rm -rf
RUN find /data/source-files/deploy/data \! -name "deps" -mindepth 1 -maxdepth 1 -print | xargs rm -rf
###### FILES_CACHE 阶段个性化代码 END ######

########################################
FROM node:14-alpine AS CONFIG_CACHE

WORKDIR /data/config-files/
ARG configSecret=''

RUN apk add --no-cache openssl
COPY --from=FILES_CACHE /data/config-files/ /data/config-files/
RUN tar -czf - * | openssl enc -e -aes256 -k "${configSecret}" -out ./config.tgz

########################################
# 准备仅包含 package.json 和 yarn.lock 的最小构建依赖文件
# package.json 以外的文件修改将不会影响缓存命中
FROM node:14-alpine AS MODULES_CACHE

ARG PRE_BUILD_DIR=/data/pre-build
ARG BUILD_DIR=/data/build
ARG useCDN=true

WORKDIR ${PRE_BUILD_DIR}

# 本仓库所有项目共享 yarn install 缓存
COPY --from=FILES_CACHE /data/meta-files ${PRE_BUILD_DIR}
RUN cd ${PRE_BUILD_DIR} && yarn install --prefer-offline --frozen-lockfile --ignore-engines

# 完全 yarn install 执行完之后，yarn install --production 执行也会很快（即使没命中 Docker 缓存）
COPY --from=FILES_CACHE /data/prod-meta-files ${BUILD_DIR}
RUN cd ${BUILD_DIR} && yarn install --prefer-offline --frozen-lockfile --production --ignore-engines

# node_modules 已准备完毕；此时复制完整源代码
COPY --from=FILES_CACHE /data/source-files ${PRE_BUILD_DIR}

# 将 docker.deps.local/ 目录下的文件复制到 docker.deps/
# docker.deps 中含有上传下载所需的配置文件，故需要在 yarn build 前复制
RUN cp -r ./deploy/docker.deps.local/* ./deploy/docker.deps/

# 下载依赖文件（适用于个别项目）
#RUN npx ali-oss-download ./deploy/docker.deps/web-oss.oss.config.js \
#  data/something.txt ${PRE_BUILD_DIR}/my-modules/something.txt

###### MODULES_CACHE 阶段个性化代码 START ######
RUN cd ${PRE_BUILD_DIR} && yarn workspace data-backend run build

RUN if [ "${useCDN}" = "false" ] ; then \
        cd ${PRE_BUILD_DIR} && yarn workspace data-frontend run build:dev; \
    else \
        cd ${PRE_BUILD_DIR} && yarn workspace data-frontend run build; \
    fi
#        && npx ali-oss-lazy-upload ./deploy/docker.deps/web-cdn.oss.config.js ./packages/data-frontend/dist data; \

RUN cp -r ${PRE_BUILD_DIR}/config ${BUILD_DIR} \
    && cp -r ${PRE_BUILD_DIR}/packages/data-backend/dist ${BUILD_DIR}/packages/data-backend \
    && cp -r ${PRE_BUILD_DIR}/packages/data-frontend/dist ${BUILD_DIR}/packages/data-frontend \
    && cp ${PRE_BUILD_DIR}/packages/data-backend/ecosystem.config.js ${BUILD_DIR}/packages/data-backend
###### MODULES_CACHE 阶段个性化代码 END ######

########################################
# 最终镜像，仅复制可执行的程序文件和准备必要的系统服务（nginx、curl）
FROM node:14-alpine

ENV TZ=Asia/Shanghai

# 其他项目若将本语句置于最前方，可共享缓存命中
RUN apk add --no-cache curl openssl nginx>=1.20.1 && yarn global add pm2 && pm2 install pm2-logrotate && mkdir -p /run/nginx/

LABEL maintainer="work@fangqk.com"
WORKDIR /data/data

COPY --from=MODULES_CACHE /data/build .
COPY ./deploy/deps/*.sh /data/deps/
COPY ./deploy/data/deps/data.nginx.conf /etc/nginx/http.d/data.nginx.conf

# 复制运行时配置文件
COPY --from=CONFIG_CACHE /data/config-files/config.tgz /data/config.tgz

# 此步骤会使文件发生改变，应放在后方避免影响缓存命中
ARG commitSHA=Unknown
RUN sed -i 's/COMMIT_SHA/'${commitSHA}'/g' /etc/nginx/http.d/data.nginx.conf
RUN sed -i 's/COMMIT_SHA/'${commitSHA}'/g' ./packages/data-backend/ecosystem.config.js
RUN sed -i 's/COMMIT_SHA/'${commitSHA}'/g' ./packages/data-frontend/dist/index.html
LABEL commitSHA="${commitSHA}"

CMD /data/deps/prepare-config-files.sh "${configSecret}" "/data/config.tgz" /data/data/config \
  && nginx && /data/deps/on-container-start.sh && pm2-runtime ./packages/data-backend/ecosystem.config.js --env ${ENV}
#HEALTHCHECK CMD curl --fail http://localhost:5300/api/health/ping && curl --fail http://localhost:5399/api/health/ping || exit 1
