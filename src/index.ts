import { Construct } from 'constructs';
import { MyClient } from './components/constructs/client';
import { MyData } from './components/constructs/data';
import { MyMaster } from './components/constructs/master';
import { MyMisc } from './components/constructs/misc';
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

    new MyMisc(this, `${name}`, {
      namespace: this.namespace,
    });

  }
}