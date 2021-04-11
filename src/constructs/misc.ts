
import * as cdk8s from 'cdk8s';
import { Construct } from 'constructs';

export interface MiscOpts {
  readonly name?: string;
  readonly namespace?: string;
}
export class MyMisc extends Construct {


  public readonly name?: string;
  public readonly namespace?: string;

  constructor(scope: Construct, name: string, opts: MiscOpts) {
    super(scope, name);

    this.name = opts.name ?? 'elasticsearch';
    this.namespace = opts.namespace ?? 'elasticsearch';

    // Namespace
    new cdk8s.ApiObject(this, 'namespace', {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name: this.namespace,
        labels: {
          name: this.name,
        },
      },
    });

    // Service Account
    new cdk8s.ApiObject(this, 'service-account-es', {
      apiVersion: 'v1',
      kind: 'ServiceAccount',
      metadata: {
        labels: {
          app: this.name,
        },
        name: `${this.name}-es`,
        namespace: this.namespace,
      },
    });

    new cdk8s.ApiObject(this, 'service-account-kibana', {
      apiVersion: 'v1',
      kind: 'ServiceAccount',
      metadata: {
        labels: {
          app: this.name,
        },
        name: `${this.name}-kibana`,
        namespace: this.namespace,
      },
    });

    // Pod Security Policy
    new cdk8s.ApiObject(this, 'psp', {
      apiVersion: 'policy/v1beta1',
      kind: 'PodSecurityPolicy',
      metadata: {
        labels: {
          app: this.name,
        },
        name: `${this.name}-psp`,
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
        name: `${this.name}-es`,
        namespace: this.namespace,
        labels: {
          app: this.name,
        },
      },
      rules: [{
        apiGroups: ['extensions'],
        resources: ['podsecuritypolicies'],
        verbs: ['use'],
        resourceNames: [`${this.name}-ps`],
      }],
    });

    new cdk8s.ApiObject(this, 'role-binding-es', {
      kind: 'RoleBinding',
      apiVersion: 'rbac.authorization.k8s.io/v1',
      metadata: {
        labels: {
          app: this.name,
        },
        name: `${this.name}-elastic-rolebinding`,
      },
      roleRef: {
        kind: 'Role',
        name: `${this.name}-es`,
        apiGroup: 'rbac.authorization.k8s.io',
      },
      subjects: [{
        kind: 'ServiceAccount',
        name: `${this.name}-es`,
        namespace: this.namespace,
      }],
    });

    new cdk8s.ApiObject(this, 'role-kibana', {
      apiVersion: 'rbac.authorization.k8s.io/v1beta1',
      kind: 'Role',
      metadata: {
        name: `${this.name}-kibana`,
        namespace: this.namespace,
        labels: {
          app: this.name,
        },
      },
      rules: [{
        apiGroups: ['extensions'],
        resources: ['podsecuritypolicies'],
        verbs: ['use'],
        resourceNames: [`${this.name}-ps`],
      }],
    });

    new cdk8s.ApiObject(this, 'role-binding-kibana', {
      kind: 'RoleBinding',
      apiVersion: 'rbac.authorization.k8s.io/v1',
      metadata: {
        labels: {
          app: this.name,
        },
        name: `${this.name}-kibana-rolebinding`,
      },
      roleRef: {
        kind: 'Role',
        name: `${this.name}-kibana`,
        apiGroup: 'rbac.authorization.k8s.io',
      },
      subjects: [{
        kind: 'ServiceAccount',
        name: `${this.name}-kibana`,
        namespace: this.namespace,
      }],
    });

  }
}