const { ConstructLibraryCdk8s } = require('projen');

const CDK_VERSION = '1.92.0';

const project = new ConstructLibraryCdk8s({
  author: 'Hunter Thompson',
  authorAddress: 'aatman@auroville.org.in',
  cdk8sVersion: '1.0.0-beta.11',
  defaultReleaseBranch: 'development',
  stability: 'experimental',
  jsiiFqn: 'projen.ConstructLibraryCdk8s',
  name: '@opencdk8s/cdk8s-opendistro-for-elasticsearch',
  keywords: ['aws', 'cdk8s', 'cdk'],
  npmAccess: 'public',
  repositoryUrl: 'https://github.com/opencdk8s/cdk8s-opendistro-for-elasticsearch',
  python: {
    distName: 'cdk8s-opendistro-for-elasticsearch',
    module: 'cdk8s_opendistro_for_elasticsearch',
  },
  peerDeps: [
    'constructs@^3.3.71',
  ],
  devDeps: [
    'constructs@^3.3.71',
  ],
  releaseEveryCommit: false,
  dependabot: false,
  gitignore: ['package.json', 'test/'],
  pullRequestTemplate: false,
  releaseBranches: ['development'],
  codeCov: true,
  clobber: false,
  readme: true,
  mergify: true,
});

const common_exclude = ['cdk.out', 'package.json', 'yarn-error.log', 'coverage', '.DS_Store', '.idea', '.vs_code'];
project.gitignore.exclude(...common_exclude);

project.synth();

