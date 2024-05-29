interface IConfig {
  label: string
}

class EurekaConsole {
  private config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
  }

  private getDate(date: Date) {
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var milliseconds = date.getMilliseconds();

    return ((hour < 10) ? '0' + hour : hour) +
      ':' +
      ((minutes < 10) ? '0' + minutes : minutes) +
      ':' +
      ((seconds < 10) ? '0' + seconds : seconds) +
      '.' +
      ('00' + milliseconds).slice(-3);
  }

  debug(message: string, ...optionalParams: any[]) {
    const { label } = this.config;
    const timestamp = this.getDate(new Date());

    console.debug(`🐞[${timestamp} • ${label}] ${message}`, ...optionalParams)
  }

  log(message: string, ...optionalParams: any[]) {
    const { label } = this.config;
    const timestamp = this.getDate(new Date());

    console.log(`👀[${timestamp} • ${label}] ${message}`, ...optionalParams)
  }

  error(message: string, ...optionalParams: any[]) {
    const { label } = this.config;
    const timestamp = this.getDate(new Date());

    console.error(`😔[${timestamp} • ${label}] ${message}`, ...optionalParams)
  }

  warn(message: string, ...optionalParams: any[]) {
    const { label } = this.config;
    const timestamp = this.getDate(new Date());

    console.warn(`🧐[${timestamp} • ${label}] ${message}`, ...optionalParams)
  }

  info(message: string, ...optionalParams: any[]) {
    const { label } = this.config;
    const timestamp = this.getDate(new Date());

    console.info(`🤓[${timestamp} • ${label}] ${message}`, ...optionalParams)
  }
}

export default function (config: IConfig) {
  return new EurekaConsole(config)
};