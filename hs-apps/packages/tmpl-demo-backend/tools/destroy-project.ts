const shell = require('shelljs')
const path = require('path')

const [, , kebabName] = process.argv

if (!kebabName) {
  console.info(`参数不能为空`)
  process.exit(-1)
}

const ROOT_DIR = path.resolve(`${__dirname}/../../..`)
shell.exec(`rm -rf ${ROOT_DIR}/services/${kebabName}-common`)
shell.exec(`rm -rf ${ROOT_DIR}/packages/${kebabName}-backend`)
shell.exec(`rm -rf ${ROOT_DIR}/packages/${kebabName}-frontend`)
shell.exec(`rm -rf ${ROOT_DIR}/deploy/${kebabName}`)
