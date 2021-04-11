import * as cdk8s from 'cdk8s';
import { Construct } from 'constructs';
import { MyClient } from './components/constructs/client';
import { MyData } from './components/constructs/data';
import { MyMaster } from './components/constructs/master';
import { ResourceRequirements } from './util';
export * from './util';

export interface EsOpts {
  readonly namespace?: string;
  readonly image?: string;
  // Master
  readonly masterVolumeSize?: string;
  readonly masterReplicas?: number;
  readonly masterResources?: ResourceRequirements;
  readonly masterNodeSelectorParams?: { [name: string]: string };
  // Client
  readonly clientVolumeSize?: string;
  readonly clientReplicas?: number;
  readonly clientResources?: ResourceRequirements;
  readonly clientNodeSelectorParams?: { [name: string]: string };

  // Data
  readonly dataVolumeSize?: string;
  readonly dataReplicas?: number;
  readonly dataResources?: ResourceRequirements;
  readonly dataNodeSelectorParams?: { [name: string]: string };
}

export class MyElasticSearch extends Construct {

  /**
   * Namespace
   *
   * @default - elasticsearch
   */

  public readonly namespace?: string;
  public readonly image?: string;

  constructor(scope: Construct, name: string, opts: EsOpts) {
    super(scope, name);

    this.namespace = opts.namespace ?? 'elasticsearch';
    this.image = opts.image ?? 'docker.io/amazon/opendistro-for-elasticsearch:1.13.2';

    new MyMaster(this, `${name}-master`, {
      masterReplicas: opts.masterReplicas,
      masterVolumeSize: opts.masterVolumeSize,
      masterNodeSelectorParams: opts.masterNodeSelectorParams,
      masterResources: opts.masterResources,
      namespace: this.namespace,
      image: this.image,
    });

    new MyClient(this, `${name}-client`, {
      clientReplicas: opts.clientReplicas,
      clientVolumeSize: opts.clientVolumeSize,
      clientNodeSelectorParams: opts.clientNodeSelectorParams,
      clientResources: opts.clientResources,
      namespace: this.namespace,
      image: this.image,
    });

    new MyData(this, `${name}-data`, {
      dataReplicas: opts.dataReplicas,
      dataVolumeSize: opts.dataVolumeSize,
      dataNodeSelectorParams: opts.dataNodeSelectorParams,
      dataResources: opts.dataResources,
      namespace: this.namespace,
      image: this.image,
    });

    // Namespace
    new cdk8s.ApiObject(this, 'namespace', {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name: this.namespace,
        labels: {
          name: name,
        },
      },
    });

    // Service Account
    new cdk8s.ApiObject(this, 'service-account-es', {
      apiVersion: 'v1',
      kind: 'ServiceAccount',
      metadata: {
        labels: {
          app: name,
        },
        name: `${name}-es`,
        namespace: this.namespace,
      },
    });

    new cdk8s.ApiObject(this, 'service-account-kibana', {
      apiVersion: 'v1',
      kind: 'ServiceAccount',
      metadata: {
        labels: {
          app: name,
        },
        name: `${name}-kibana`,
        namespace: this.namespace,
      },
    });

    // Pod Security Policy
    new cdk8s.ApiObject(this, 'psp', {
      apiVersion: 'policy/v1beta1',
      kind: 'PodSecurityPolicy',
      metadata: {
        labels: {
          app: name,
        },
        name: `${name}-psp`,
        namespace: this.namespace,
      },
      spec: {
        privileged: true,
        volumes: [
          'configMap',
          'emptyDir',
          'projected',
          'secret',
          'downwardAPI',
          'persistentVolumeClaim',
        ],
        hostNetwork: false,
        hostIPC: false,
        hostPID: false,
        runAsUser: {
          rule: 'RunAsAny',
        },
        seLinux: {
          rule: 'RunAsAny',
        },
        supplementalGroups: {
          rule: 'MustRunAs',
          ranges: [{
            min: 1,
            max: 65535,
          }],
        },
        fsGroup: {
          rule: 'MustRunAs',
          ranges: [{
            min: 1,
            max: 65535,
          }],
        },
        readOnlyRootFilesystem: false,
        allowedCapabilities: ['SYS_CHROOT'],
      },
    });

    new cdk8s.ApiObject(this, 'role', {
      apiVersion: 'rbac.authorization.k8s.io/v1beta1',
      kind: 'Role',
      metadata: {
        name: `${name}-es`,
        namespace: this.namespace,
        labels: {
          app: name,
        },
      },
      rules: [{
        apiGroups: ['extensions'],
        resources: ['podsecuritypolicies'],
        verbs: ['use'],
        resourceNames: [`${name}-ps`],
      }],
    });

    new cdk8s.ApiObject(this, 'role-binding-es', {
      kind: 'RoleBinding',
      apiVersion: 'rbac.authorization.k8s.io/v1',
      metadata: {
        labels: {
          app: name,
        },
        name: `${name}-elastic-rolebinding`,
      },
      roleRef: {
        kind: 'Role',
        name: `${name}-es`,
        apiGroup: 'rbac.authorization.k8s.io',
      },
      subjects: [{
        kind: 'ServiceAccount',
        name: `${name}-es`,
        namespace: this.namespace,
      }],
    });

  }
}