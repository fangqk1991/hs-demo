#!/bin/bash

set -e

__DIR__=`cd "$(dirname "$0")"; pwd`
ROOT_DIR="${__DIR__}"
cd "${ROOT_DIR}"

imageName=fangcha.app/hs-ruby
containerName=hs-ruby
env=development
# 静态资源会根据 Refer 判断防盗链，本地环境不能正常访问，故传递参数构建特殊镜像
docker build -t ${imageName} -f "${__DIR__}/Dockerfile" .

docker container stop ${containerName} || true
docker container rm ${containerName} || true

DATABASE_URL="mysql2://root:@host.docker.internal/hs_data"

docker run --name ${containerName} --hostname=`hostname` -d \
  -p 5400:5401 \
  -e ENV=${env} \
  -e DATABASE_URL=${DATABASE_URL} \
  ${imageName}
#docker exec -it my-data /bin/sh -c 'echo "#" >> /etc/hosts'
#
#echo "You can visit <http://localhost:5399/> to check."
