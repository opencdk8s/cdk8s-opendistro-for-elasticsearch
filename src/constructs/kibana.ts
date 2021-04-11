import * as cdk8s from 'cdk8s';
import { Construct } from 'constructs';
import { ResourceRequirements, convertQuantity } from '../util';

export interface KibanaOpts {

  readonly name?: string;
  readonly namespace?: string;
  readonly kibanaImage?: string;
  readonly kibanaReplicas?: number;
  readonly kibanaResources?: ResourceRequirements;
  readonly kibanaNodeSelectorParams?: { [name: string]: string };
}

export class MyKibana extends Construct {

  /**
   * Namespace
   *
   * @default - elasticsearch
   */

  public readonly name?: string;
  public readonly namespace?: string;
  public readonly kibanaImage?: string;
  public readonly kibanaResources?: ResourceRequirements;
  public readonly kibanaNodeSelectorParams?: { [name: string]: string };
  public readonly kibanaReplicas?: number;

  constructor(scope: Construct, name: string, opts: KibanaOpts) {
    super(scope, name);

    this.name = opts.name ?? 'elasticsearch';
    this.kibanaNodeSelectorParams = opts.kibanaNodeSelectorParams ?? undefined;
    this.namespace = opts.namespace ?? 'elasticsearch';
    this.kibanaReplicas = opts.kibanaReplicas ?? 1;
    this.kibanaImage = opts.kibanaImage ?? 'docker.io/amazon/opendistro-for-elasticsearch-kibana:1.13.2';
    this.kibanaResources = {
      limits: convertQuantity(opts.kibanaResources?.limits, {
        cpu: '400m',
        memory: '512Mi',
      }),
      requests: convertQuantity(opts.kibanaResources?.requests, {
        cpu: '200m',
        memory: '256Mi',
      }),
    };

    new cdk8s.ApiObject(this, 'kibana-svc', {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        annotations: {},
        labels: {
          app: this.name,
          role: 'kibana',
        },
        name: `${this.name}-kibana-svc`,
      },
      spec: {
        ports: [{
          name: 'kibana-svc',
          port: 443,
          targetPort: 5601,
        }],
        selector: {
          role: 'kibana',
        },
        type: 'ClusterIP',
      },
    });

    new cdk8s.ApiObject(this, 'kibana-deployment', {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: this.name,
        labels: {
          app: this.name,
          role: 'kibana',
        },
      },
      spec: {
        replicas: this.kibanaReplicas,
        selector: {
          matchLabels: {
            app: this.name,
            role: 'kibana',
          },
        },
        template: {
          metadata: {
            labels: {
              app: this.name,
              role: 'kibana',
            },
          },
        },
        spec: {
          containers: [{
            name: `${this.name}-kibana`,
            env: [
              {
                name: 'CLUSTER_NAME',
                value: 'elasticsearch',
              },
              {
                name: 'ELASTICSEARCH_HOSTS',
                value: `${this.name}-client-service:9200`,
              },
            ],
            image: this.kibanaImage,
            imagePullPolicy: 'Always',
            resources: this.kibanaResources,
            ports: [{
              containerPort: 5601,
            }],
          }],
          nodeSelectors: this.kibanaNodeSelectorParams,
          serviceAccountName: `${this.name}-kibana`,
          restartPolicy: 'Always',
        },
      },
    });

  }
}