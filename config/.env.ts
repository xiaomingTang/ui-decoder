/**
 * key and value 必须全部为 string, 不得为 number 或其他类型
 */
export interface EnvConfig {
  [key: string]: string;
}

/**
 * 警告!!! 该对象下所有 key-value 基于 webpack.DefinePlugin, 将会在打包的时候将所有 process.env.KEY 替换为相应的 value(简单的字符映射)
 *
 * 因此, 如果环境将会被客户端访问, 则不建议将私有变量(如数据库连接密码等)放在此处
 *
 * 你可以额外在该文件所在目录下新建 .env.local.ts 文件, 用于添加本地的环境配置
 *
 * 该配置所添加的 key value 将在 /config 以及 /examples 内的 js/ts 文件能被访问( process.env[key] === value )
 *
 * 如果有自定义项, 可以在 .env.local.ts 中添加自定义项( .env.local.ts 文件应当是本地配置, 不应当添加到 git 版本管理 )
 *
 * ```
 * import { envConfig as publicEnvConfig, EnvConfig } from "./env"
 *
 * export const envConfig: EnvConfig = {
 *   ...publicEnvConfig,
 *   CUSTOM_VAR: "custom value",
 * }
 * ```
 *
 * 例如下面的示例代码, 你将能访问 process.env.SCAFFOLD_CONFIG_APP_NAME, 其值为 "ui-decoder"
 */
export const envConfig: EnvConfig = {
  SCAFFOLD_CONFIG_APP_NAME: "ui-decoder",
}
