import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'proto.js', // 적절한 파일 경로로 변경해주세요
  output: {
    file: 'bundle.js', // 번들 파일의 출력 경로와 이름을 적절히 변경해주세요
    format: 'esm',
  },
  plugins: [
    resolve(),
    commonjs(),
  ],
};
