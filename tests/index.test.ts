import path from 'path';
import pluginTester from 'babel-plugin-tester';
import plugin from '../src';


pluginTester({
  plugin,
  fixtures: path.join(__dirname, 'fixtures')
})