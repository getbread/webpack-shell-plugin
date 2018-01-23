import babel from 'rollup-plugin-babel';
import babelRc from 'babelrc-rollup';

export default {
  input: 'src/webpack-shell-plugin.js',
  output: {
    file: 'lib/index.js',
    format: 'cjs',
  },
  plugins: [
    babel(babelRc())
  ],
};
