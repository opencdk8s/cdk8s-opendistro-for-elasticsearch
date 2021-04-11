
import * as cdk8s from 'cdk8s';
import { Construct } from 'constructs';
import { ResourceRequirements, convertQuantity } from '../util';

export interface ClientOpts {

  readonly name?: string;
  readonly namespace?: string;
  readonly image?: string;
  readonly clientVolumeSize?: string;
  readonly clientReplicas?: number;
  readonly clientResources?: ResourceRequirements;
  readonly clientNodeSelectorParams?: { [name: string]: string };
}

export class MyClient extends Construct {

  /**
     * Namespace
     *
     * @default - elasticsearch
     */

  public readonly name?: string;
  public readonly namespace?: string;
  public readonly image?: string;
  public readonly clientVolumeSize?: string;
  public readonly clientResources?: ResourceRequirements;
  public readonly clientReplicas?: number;
  public readonly clientNodeSelectorParams?: { [name: string]: string };

  constructor(scope: Construct, name: string, opts: ClientOpts) {
    super(scope, name);

    this.name = opts.name ?? 'elasticsearch';
    this.clientReplicas = opts.clientReplicas ?? 1;
    this.clientNodeSelectorParams = opts.clientNodeSelectorParams ?? undefined;
    this.namespace = opts.namespace ?? 'elasticsearch';
    this.clientVolumeSize = opts.clientVolumeSize ?? '8Gi';
    this.image = opts.image ?? 'docker.io/amazon/opendistro-for-elasticsearch:1.13.2';
    this.clientResources = {
      limits: convertQuantity(opts.clientResources?.limits, {
        cpu: '400m',
        memory: '512Mi',
      }),
      requests: convertQuantity(opts.clientResources?.requests, {
        cpu: '200m',
        memory: '256Mi',
      }),
    };

    new cdk8s.ApiObject(this, 'client-svc', {
      kind: 'Service',
      apiVersion: 'v1',
      metadata: {
        labels: {
          app: this.name,
          role: 'client',
        },
        name: `${this.name}-client-service`,
        namespace: this.namespace,
      },
      spec: {
        ports: [
          {
            name: 'http',
            port: 9200,
          },
          {
            name: 'transport',
            port: 9300,
          },
          {
            name: 'metrics',
            port: 9600,
          },
          {
            name: 'rca',
            port: 9650,
          },
        ],
        selector: {
          role: 'client',
        },
        type: 'ClusterIP',
      },
    });

    new cdk8s.ApiObject(this, 'client-sts', {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        labels: {
          app: this.name,
          role: 'client',
        },
        name: `${this.name}-client`,
        namespace: this.namespace,
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: this.name,
          },
        },
        template: {
          metadata: {
            labels: {
              app: this.name,
            },
            annotations: undefined,
          },
          spec: {
            serviceAccountName: `${this.name}-es`,
            initContainers: [{
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
            }],
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
                  value: 'true',
                },
                {
                  name: 'node.data',
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
                  value: `${this.name}-discovery`,
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
              resources: this.clientResources,
              image: 'docker.io/amazon/opendistro-for-elasticsearch:1.13.2',
              imagePullPolicy: 'Always',
              ports: [
                {
                  containerPort: 9200,
                  name: 'http',
                },
                {
                  containerPort: 9300,
                  name: 'transport',
                },
                {
                  containerPort: 9600,
                  name: 'metrics',
                },
                {
                  containerPort: 9650,
                  name: 'rca',
                },
              ],
              livenessProbe: {
                initialDelaySeconds: 60,
                periodSeconds: 10,
                tcpSocket: {
                  port: 'transport',
                },
              },
              volumeMounts: [{
                mountPath: '/usr/share/elasticsearch/config/logging.yml',
                name: 'config',
                subPath: 'logging.yml',
              }],
            }],
            nodeSelectors: this.clientNodeSelectorParams,
            volumes: [{
              name: 'config',
              secret: {
                secretName: `${this.name}-es-config`,
              },
            }],
          },
        },
      },
    });

  }
}