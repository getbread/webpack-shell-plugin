import {spawn, spawnSync, exec, execSync} from 'child_process';
const os = require('os');

const defaultOptions = {
  onBuildStart: [],
  onBuildEnd: [],
  onBuildExit: [],
  dev: true,
  verbose: false,
  safe: false,
  sync: false
};

export default class WebpackShellPlugin {
  constructor(options) {
    this.options = this.validateInput(this.mergeOptions(options, defaultOptions));

    this.onCompilation = this.onCompilation.bind(this);
    this.onAfterEmit = this.onAfterEmit.bind(this);
    this.onDone = this.onDone.bind(this)
  }

  puts(error, stdout, stderr) {
    if (error) {
      throw error;
    }
  }

  spreadStdoutAndStdErr(proc) {
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stdout);
  }

  serializeScript(script) {
    if (typeof script === 'string') {
      const [command, ...args] = script.split(' ');
      return {command, args};
    }
    const {command, args} = script;
    return {command, args};
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  handleScript(script) {
    let proc = null;

    if (os.platform() === 'win32' || this.options.safe) {
      if (this.options.sync) {
        proc = execSync(script, {stdio:[0, 1, 2]});
      } else {
        proc = exec(script, this.puts);
        this.spreadStdoutAndStdErr(proc);
      }
    } else {
      const {command, args} = this.serializeScript(script);
      if (this.options.sync) {
        proc = spawnSync(command, args, {stdio: 'inherit'});
      } else {
        proc = spawn(command, args, {stdio: 'inherit'});
        proc.on('close', this.puts);
      }
    }
  }

  handleScriptsOn(data) {
    for (let item of data) {
      this.handleScript(item)
    }
  }

  validateInput(options) {
    if (typeof options.onBuildStart === 'string') {
      options.onBuildStart = options.onBuildStart.split('&&');
    }
    if (typeof options.onBuildEnd === 'string') {
      options.onBuildEnd = options.onBuildEnd.split('&&');
    }
    if (typeof options.onBuildExit === 'string') {
      options.onBuildExit = options.onBuildExit.split('&&');
    }
    return options;
  }

  mergeOptions(options, defaults) {
    for (const key in defaults) {
      if (options.hasOwnProperty(key)) {
        defaults[key] = options[key];
      }
    }
    return defaults;
  }

  apply(compiler) {
    compiler.plugin('compilation', this.onCompilation);
    compiler.plugin('after-emit', this.onAfterEmit);
    compiler.plugin('done', this.onDone);
  }

  onCompilation(compilation) {
    if (this.options.verbose) {
      console.log(`Report compilation: ${compilation}`);
      console.warn(`WebpackShellPlugin [${new Date()}]: Verbose is being deprecated, please remove.`);
    }
    if (this.options.onBuildStart.length) {
      console.log('Executing pre-build scripts');
      this.handleScriptsOn(this.options.onBuildStart);
      if (this.options.dev) {
        this.options.onBuildStart = [];
      }
    }
  }

  onAfterEmit(compilation, callback) {
    if (this.options.onBuildEnd.length) {
      console.log('Executing post-build scripts');
      this.handleScriptsOn(this.options.onBuildEnd);
      if (this.options.dev) {
          this.options.onBuildEnd = [];
      }
    }
    callback();
  }

  onDone() {
    if (this.options.onBuildExit.length) {
      console.log('Executing additional scripts before exit');
      this.handleScriptsOn(this.options.onBuildExit);
    }
  }
}
