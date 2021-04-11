import { Chart, Testing } from 'cdk8s';
import * as es from '../src/index';

test('elasticsearch', () => {
  const app = Testing.app();
  const chart = new Chart(app, 'test');
  new es.MyElasticSearch(chart, 'es', {
    name: 'elasticsearch',
  });
  expect(Testing.synth(chart)).toMatchSnapshot();
});
