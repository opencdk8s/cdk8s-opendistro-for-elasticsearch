import { Construct } from 'constructs';
import { MyClient } from './constructs/client';
import { MyData } from './constructs/data';
import { MyKibana } from './constructs/kibana';
import { MyMaster } from './constructs/master';
import { MyMisc } from './constructs/misc';
import { ResourceRequirements } from './util';
export * from './util';

export interface EsOpts {
  // Common
  readonly name?: string;
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
  // Kibana
  readonly kibanaImage?: string;
  readonly kibanaResources?: ResourceRequirements;
  readonly kibanaNodeSelectorParams?: { [name: string]: string };
  readonly kibanaReplicas?: number;
}

export class MyElasticSearch extends Construct {

  /**
   * Namespace
   *
   * @default - elasticsearch
   */
  public readonly kibanaImage?: string;
  public readonly name?: string;
  public readonly namespace?: string;
  public readonly image?: string;

  constructor(scope: Construct, name: string, opts: EsOpts) {
    super(scope, name);

    this.name = opts.name ?? 'elasticsearch';
    this.namespace = opts.namespace ?? 'elasticsearch';
    this.image = opts.image ?? 'docker.io/amazon/opendistro-for-elasticsearch:1.13.2';
    this.kibanaImage = opts.kibanaImage ?? 'docker.io/amazon/opendistro-for-elasticsearch-kibana:1.13.2';

    new MyMaster(this, `${this.name}-master`, {
      masterReplicas: opts.masterReplicas,
      masterVolumeSize: opts.masterVolumeSize,
      masterNodeSelectorParams: opts.masterNodeSelectorParams,
      masterResources: opts.masterResources,
      namespace: this.namespace,
      image: this.image,
      name: this.name,
    });

    new MyClient(this, `${this.name}-client`, {
      clientReplicas: opts.clientReplicas,
      clientVolumeSize: opts.clientVolumeSize,
      clientNodeSelectorParams: opts.clientNodeSelectorParams,
      clientResources: opts.clientResources,
      namespace: this.namespace,
      image: this.image,
      name: this.name,
    });

    new MyData(this, `${this.name}-data`, {
      dataReplicas: opts.dataReplicas,
      dataVolumeSize: opts.dataVolumeSize,
      dataNodeSelectorParams: opts.dataNodeSelectorParams,
      dataResources: opts.dataResources,
      namespace: this.namespace,
      image: this.image,
      name: this.name,
    });

    new MyMisc(this, `${this.name}`, {
      namespace: this.namespace,
    });

    new MyKibana(this, `${this.name}-kibana`, {
      kibanaReplicas: opts.kibanaReplicas,
      kibanaImage: opts.kibanaImage,
      kibanaNodeSelectorParams: opts.kibanaNodeSelectorParams,
      kibanaResources: opts.kibanaResources,
      namespace: this.namespace,
      name: this.name,
    });

  }
}