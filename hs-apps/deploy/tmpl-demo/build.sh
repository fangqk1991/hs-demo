#!/bin/bash

set -e
set -v on

__DIR__=`cd "$(dirname "$0")"; pwd`
ROOT_DIR="${__DIR__}/../.."
cd "${ROOT_DIR}"

imageName=fangcha.app/tmpl-demo
containerName=my-tmpl-demo
env=development
configSecret=kjCCkH0jWaj6JyTtXrsX2o05KboakijA
# 静态资源会根据 Refer 判断防盗链，本地环境不能正常访问，故传递参数构建特殊镜像
docker build -t ${imageName} -f "${__DIR__}/Dockerfile" . --build-arg useCDN=false --build-arg configSecret=${configSecret}

docker container stop ${containerName} || true
docker container rm ${containerName} || true

docker run --name ${containerName} --hostname=`hostname` -d \
  -p 2399:2399 \
  -e ENV=${env} \
  -e configSecret=${configSecret} \
  ${imageName}
docker exec -it my-tmpl-demo /bin/sh -c 'echo "#" >> /etc/hosts'

echo "You can visit <http://localhost:2399/> to check."
