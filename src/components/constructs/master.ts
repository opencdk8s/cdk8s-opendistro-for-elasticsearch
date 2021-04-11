import * as cdk8s from 'cdk8s';
import { Construct } from 'constructs';
import { ResourceRequirements, convertQuantity } from '../../util';

export interface MasterOpts {

  readonly namespace?: string;
  readonly image?: string;
  readonly masterReplicas?: number;
  readonly masterVolumeSize?: string;
  readonly masterResources?: ResourceRequirements;
  readonly masterNodeSelectorParams?: { [name: string]: string };
}

export class MyMaster extends Construct {

  /**
   * Namespace
   *
   * @default - elasticsearch
   */

  public readonly namespace?: string;
  public readonly image?: string;
  public readonly masterResources?: ResourceRequirements;
  public readonly masterVolumeSize?: string;
  public readonly masterNodeSelectorParams?: { [name: string]: string };
  public readonly masterReplicas?: number;

  constructor(scope: Construct, name: string, opts: MasterOpts) {
    super(scope, name);

    this.masterNodeSelectorParams = opts.masterNodeSelectorParams ?? undefined;


    this.namespace = opts.namespace ?? 'elasticsearch';
    this.masterVolumeSize = opts.masterVolumeSize ?? '8Gi';
    this.masterReplicas = opts.masterReplicas ?? 1;
    this.image = opts.image ?? 'docker.io/amazon/opendistro-for-elasticsearch:1.13.2';
    this.masterResources = {
      limits: convertQuantity(opts.masterResources?.limits, {
        cpu: '400m',
        memory: '512Mi',
      }),
      requests: convertQuantity(opts.masterResources?.requests, {
        cpu: '200m',
        memory: '256Mi',
      }),
    };

    new cdk8s.ApiObject(this, 'master-svc', {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        labels: {
          app: name,
          role: 'master',
        },
        name: `${name}-discovery`,
        namespace: this.namespace,
      },
      spec: {
        ports: [{
          port: 9300,
          protocol: 'TCP',
        }],
        clusterIP: 'None',
        selector: {
          role: 'master',
        },
      },
    });

    new cdk8s.ApiObject(this, 'master-sts', {
      apiVersion: 'apps/v1',
      kind: 'StatefulSet',
      metadata: {
        labels: {
          app: name,
          role: 'master',
        },
        name: `${name}-master`,
        namespace: this.namespace,
      },
      spec: {
        replicas: this.masterReplicas,
        selector: {
          matchLabels: {
            app: name,
            role: 'master',
          },
        },
        updateStrategy: {
          type: 'RollingUpdate',
        },
        serviceName: `${name}-discovery`,
        template: {
          metadata: {
            labels: {
              app: name,
            },
            annotations: undefined,
          },
          spec: {
            serviceAccountName: `${name}-es`,
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
                  name: 'cluster.initial_master_nodes',
                  value: `${name}-master-0,`,
                },
                {
                  name: 'node.master',
                  value: 'true',
                },
                {
                  name: 'node.ingest',
                  value: 'false',
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
              resources: this.masterResources,
              livenessProbe: {
                initialDelaySeconds: 60,
                periodSeconds: 10,
                tcpSocket: {
                  port: 'transport',
                },
              },
              image: this.image,
              imagePullPolicy: 'Always',
              ports: [
                {
                  containerPort: 9300,
                  name: 'transport',
                },
                {
                  containerPort: 9200,
                  name: 'http',
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
            nodeSelector: this.masterNodeSelectorParams,
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
                storage: this.masterVolumeSize,
              },
            },
          },
        }],
      },
    });
  }
}
