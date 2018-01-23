'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _getIterator = _interopDefault(require('babel-runtime/core-js/get-iterator'));
var _regeneratorRuntime = _interopDefault(require('babel-runtime/regenerator'));
var _Promise = _interopDefault(require('babel-runtime/core-js/promise'));
var _asyncToGenerator = _interopDefault(require('babel-runtime/helpers/asyncToGenerator'));
var _toArray = _interopDefault(require('babel-runtime/helpers/toArray'));
var _classCallCheck = _interopDefault(require('babel-runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('babel-runtime/helpers/createClass'));
var child_process = require('child_process');

var os = require('os');

var defaultOptions = {
  onBuildStart: [],
  onBuildEnd: [],
  onBuildExit: [],
  dev: true,
  verbose: false,
  safe: false,
  sync: false
};

var WebpackShellPlugin = function () {
  function WebpackShellPlugin(options) {
    _classCallCheck(this, WebpackShellPlugin);

    this.options = this.validateInput(this.mergeOptions(options, defaultOptions));

    this.onCompilation = this.onCompilation.bind(this);
    this.onAfterEmit = this.onAfterEmit.bind(this);
    this.onDone = this.onDone.bind(this);
  }

  _createClass(WebpackShellPlugin, [{
    key: 'puts',
    value: function puts(error, stdout, stderr) {
      if (error) {
        throw error;
      }
    }
  }, {
    key: 'spreadStdoutAndStdErr',
    value: function spreadStdoutAndStdErr(proc) {
      proc.stdout.pipe(process.stdout);
      proc.stderr.pipe(process.stdout);
    }
  }, {
    key: 'serializeScript',
    value: function serializeScript(script) {
      if (typeof script === 'string') {
        var _script$split = script.split(' '),
            _script$split2 = _toArray(_script$split),
            _command = _script$split2[0],
            _args = _script$split2.slice(1);

        return { command: _command, args: _args };
      }
      var command = script.command,
          args = script.args;

      return { command: command, args: args };
    }
  }, {
    key: 'sleep',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(ms) {
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt('return', new _Promise(function (resolve) {
                  return setTimeout(resolve, ms);
                }));

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function sleep(_x) {
        return _ref.apply(this, arguments);
      }

      return sleep;
    }()
  }, {
    key: 'handleScript',
    value: function handleScript(script) {
      var proc = null;

      if (os.platform() === 'win32' || this.options.safe) {
        if (this.options.sync) {
          proc = child_process.execSync(script, { stdio: [0, 1, 2] });
        } else {
          proc = child_process.exec(script, this.puts);
          this.spreadStdoutAndStdErr(proc);
        }
      } else {
        var _serializeScript = this.serializeScript(script),
            command = _serializeScript.command,
            args = _serializeScript.args;

        if (this.options.sync) {
          proc = child_process.spawnSync(command, args, { stdio: 'inherit' });
        } else {
          proc = child_process.spawn(command, args, { stdio: 'inherit' });
          proc.on('close', this.puts);
        }
      }
    }
  }, {
    key: 'handleScriptsOn',
    value: function handleScriptsOn(data) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _getIterator(data), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          this.handleScript(item);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'validateInput',
    value: function validateInput(options) {
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
  }, {
    key: 'mergeOptions',
    value: function mergeOptions(options, defaults) {
      for (var key in defaults) {
        if (options.hasOwnProperty(key)) {
          defaults[key] = options[key];
        }
      }
      return defaults;
    }
  }, {
    key: 'apply',
    value: function apply(compiler) {
      compiler.plugin('compilation', this.onCompilation);
      compiler.plugin('after-emit', this.onAfterEmit);
      compiler.plugin('done', this.onDone);
    }
  }, {
    key: 'onCompilation',
    value: function onCompilation(compilation) {
      if (this.options.verbose) {
        console.log('Report compilation: ' + compilation);
        console.warn('WebpackShellPlugin [' + new Date() + ']: Verbose is being deprecated, please remove.');
      }
      if (this.options.onBuildStart.length) {
        console.log('Executing pre-build scripts');
        this.handleScriptsOn(this.options.onBuildStart);
        if (this.options.dev) {
          this.options.onBuildStart = [];
        }
      }
    }
  }, {
    key: 'onAfterEmit',
    value: function onAfterEmit(compilation, callback) {
      if (this.options.onBuildEnd.length) {
        console.log('Executing post-build scripts');
        this.handleScriptsOn(this.options.onBuildEnd);
        if (this.options.dev) {
          this.options.onBuildEnd = [];
        }
      }
      callback();
    }
  }, {
    key: 'onDone',
    value: function onDone() {
      if (this.options.onBuildExit.length) {
        console.log('Executing additional scripts before exit');
        this.handleScriptsOn(this.options.onBuildExit);
      }
    }
  }]);

  return WebpackShellPlugin;
}();

module.exports = WebpackShellPlugin;
