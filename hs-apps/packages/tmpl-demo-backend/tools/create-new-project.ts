import { bigCamel, makeRandomStr } from '@fangcha/tools'
const shell = require('shelljs')
const glob = require('glob')
const path = require('path')
const fs = require('fs')

const [, , kebabName, _overwrite] = process.argv

if (!kebabName) {
  console.info(`参数不能为空`)
  process.exit(-1)
}

const underlineName = kebabName.replace(/-/g, '_')
const bigCamelName = bigCamel(underlineName)

const replaceContent = (content: string) => {
  return content
    .replace(/TmplDemo/g, bigCamelName)
    .replace(/tmpl-demo/g, kebabName)
    .replace(/tmpl_demo/g, underlineName)
}

const copyDir = (tmplDir: string, appDir: string) => {
  const copySingleFile = fs.statSync(tmplDir).isFile()
  if (copySingleFile && fs.existsSync(appDir) && !_overwrite) {
    return
  }
  if (_overwrite) {
    shell.exec(`rm -rf "${appDir}"`)
  }
  shell.exec(`[ ! -d "${appDir}" ] && cp -r "${tmplDir}" "${appDir}"`)
  const tmplFiles = glob.sync(`${tmplDir}/**/*{TmplDemo,tmpl-demo}*`)
  for (const tmplFilePath of tmplFiles) {
    const appFilePathBefore = tmplFilePath.replace(tmplDir, appDir)
    if (fs.existsSync(appFilePathBefore)) {
      const appFilePathAfter = replaceContent(tmplFilePath)
      console.info(`${appFilePathBefore} -> ${appFilePathAfter}`)
      shell.exec(`mv "${appFilePathBefore}" "${appFilePathAfter}"`)
    }
  }
  const appFiles = copySingleFile ? [appDir] : glob.sync(`${appDir}/**/*`)
  for (const filePath of appFiles) {
    if (fs.statSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath, 'utf8')
      fs.writeFileSync(filePath, replaceContent(content))
    }
  }
}

const ROOT_DIR = path.resolve(`${__dirname}/../../..`)
shell.exec(`cd "${ROOT_DIR}"`)

copyDir(`${ROOT_DIR}/services/tmpl-demo-common`, `${ROOT_DIR}/services/${kebabName}-common`)
copyDir(`${ROOT_DIR}/packages/tmpl-demo-backend`, `${ROOT_DIR}/packages/${kebabName}-backend`)
copyDir(`${ROOT_DIR}/packages/tmpl-demo-frontend`, `${ROOT_DIR}/packages/${kebabName}-frontend`)
copyDir(`${ROOT_DIR}/deploy/tmpl-demo`, `${ROOT_DIR}/deploy/${kebabName}`)
copyDir(`${ROOT_DIR}/config/tmpl-demo.default.js`, `${ROOT_DIR}/config/${kebabName}.default.js`)
shell.exec(`rm -f ${ROOT_DIR}/packages/${kebabName}-backend/tools/create-new-project.ts`)
shell.exec(`rm -f ${ROOT_DIR}/packages/${kebabName}-backend/tools/destroy-project.ts`)

console.info(`TODO 0: 请执行 yarn install`)
console.info(`TODO 1: 请在 config/default.js 添加 ${bigCamelName} 及 ${bigCamelName}Dev 配置`)
console.info(`TODO 2: 请为 ${bigCamelName} 应用在 OAuth 中申请 Key 和 Secret 并替换 SSO 配置`)
console.info(`TODO 3: 请为 ${bigCamelName} 应用添加相关域名记录`)
console.info(`---- 提供几组随机数，可用于 jwtSecret 及 SSO`)
console.info('Staging jwtSecret ->', makeRandomStr(32))
console.info('Production jwtSecret ->', makeRandomStr(32))
