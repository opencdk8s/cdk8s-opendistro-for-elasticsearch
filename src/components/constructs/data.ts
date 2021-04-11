import * as cdk8s from 'cdk8s';
import { Construct } from 'constructs';
import { ResourceRequirements, convertQuantity } from '../../util';

export interface DataOpts {

  readonly namespace?: string;
  readonly image?: string;
  readonly dataVolumeSize?: string;
  readonly dataResources?: ResourceRequirements;
  readonly dataReplicas?: number;
  readonly dataNodeSelectorParams?: { [name: string]: string };
}

export class MyData extends Construct {

  public readonly namespace?: string;
  public readonly image?: string;
  public readonly dataVolumeSize?: string;
  public readonly dataNodeSelectorParams?: { [name: string]: string };
  public readonly dataResources?: ResourceRequirements;
  public readonly dataReplicas?: number;

  constructor(scope: Construct, name: string, opts: DataOpts) {
    super(scope, name);

    this.dataNodeSelectorParams = opts.dataNodeSelectorParams ?? undefined;
    this.dataReplicas = opts.dataReplicas ?? 1;
    this.namespace = opts.namespace ?? 'elasticsearch';
    this.dataVolumeSize = opts.dataVolumeSize ?? '8Gi';
    this.image = opts.image ?? 'docker.io/amazon/opendistro-for-elasticsearch:1.13.2';
    this.dataResources = {
      limits: convertQuantity(opts.dataResources?.limits, {
        cpu: '400m',
        memory: '512Mi',
      }),
      requests: convertQuantity(opts.dataResources?.requests, {
        cpu: '200m',
        memory: '256Mi',
      }),
    };

    new cdk8s.ApiObject(this, 'data-svc', {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        labels: {
          app: name,
          role: 'data',
        },
        name: `${name}-data-svc`,
        namespace: this.namespace,
      },
      spec: {
        ports: [
          {
            port: 9300,
            name: 'transport',
          },
          {
            port: 9200,
            name: 'http',
          },
          {
            port: 9600,
            name: 'metrics',
          },
          {
            port: 9650,
            name: 'rca',
          },
        ],
        clusterIP: 'None',
        selector: {
          role: 'data',
        },
      },
    });

    new cdk8s.ApiObject(this, 'data-sts', {
      apiVersion: 'apps/v1',
      kind: 'StatefulSet',
      metadata: {
        labels: {
          app: name,
          role: 'data',
        },
        name: `${name}-data`,
        namespace: this.namespace,
      },
      spec: {
        serviceName: `${name}-data-svc`,
        replicas: 1,
        selector: {
          matchLabels: {
            app: name,
            role: 'data',
          },
        },
        updateStrategy: {
          type: 'RollingUpdate',
        },
        template: {
          metadata: {
            labels: {
              app: name,
              role: 'data',
            },
            annotations: undefined,
          },
          spec: {
            initContainers: [
              {
                name: 'init-sysctl',
                image: 'docker.io/busybox:1.27.2',
                command: [
                  'sysctl',
                  '-w',
                  'vm.max_map_count=262144',
                ],
                securityContext: {
                  privileged: true,
                },
              },
              {
                name: 'fixmount',
                command: [
                  'sh',
                  '-c',
                  'chown -R 1000:1000 /usr/share/elasticsearch/data',
                ],
                image: 'docker.io/busybox:1.27.2',
                volumeMounts: [{
                  mountPath: '/usr/share/elasticsearch/data',
                  name: 'data',
                  subPath: undefined,
                }],
              },
            ],
            serviceAccountName: `${name}-es`,
            containers: [{
              name: 'elasticsearch',
              securityContext: {
                capabilities: {
                  add: ['SYS_CHROOT'],
                },
              },
              env: [
                {
                  name: 'cluster.name',
                  value: 'elasticsearch',
                },
                {
                  name: 'node.master',
                  value: 'false',
                },
                {
                  name: 'node.ingest',
                  value: 'false',
                },
                {
                  name: 'network.host',
                  value: '0.0.0.0',
                },
                {
                  name: 'node.name',
                  valueFrom: {
                    fieldRef: {
                      fieldPath: 'metadata.name',
                    },
                  },
                },
                {
                  name: 'discovery.seed_hosts',
                  value: `${name}-discovery`,
                },
                {
                  name: 'KUBERNETES_NAMESPACE',
                  valueFrom: {
                    fieldRef: {
                      fieldPath: 'metadata.namespace',
                    },
                  },
                },
                {
                  name: 'node.data',
                  value: 'true',
                },
                {
                  name: 'PROCESSORS',
                  valueFrom: {
                    resourceFieldRef: {
                      resource: 'limits.cpu',
                    },
                  },
                },
                {
                  name: 'ES_JAVA_OPTS',
                  value: '-Xms512m -Xmx512m',
                },
              ],
              image: this.image,
              imagePullPolicy: 'Always',
              ports: [{
                containerPort: 9300,
                name: 'transport',
              }],
              resources: this.dataResources,
              livenessProbe: {
                initialDelaySeconds: 60,
                periodSeconds: 10,
                tcpSocket: {
                  port: 'transport',
                },
              },
              volumeMounts: [
                {
                  mountPath: '/usr/share/elasticsearch/data',
                  name: 'data',
                  subPath: undefined,
                },
                {
                  mountPath: '/usr/share/elasticsearch/config/logging.yml',
                  name: 'config',
                  subPath: 'logging.yml',
                },
              ],
            }],
            nodeSelector: this.dataNodeSelectorParams,
            volumes: [{
              name: 'config',
              secret: {
                secretName: `${name}-es-config`,
              },
            }],
          },
        },
        volumeClaimTemplates: [{
          metadata: {
            name: 'data',
            annotations: undefined,
          },
          spec: {
            accessModes: ['ReadWriteOnce'],
            resources: {
              requests: {
                storage: this.dataVolumeSize,
              },
            },
          },
        }],
      },
    });

  }

}