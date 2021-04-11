# API Reference

**Classes**

Name|Description
----|-----------
[MyElasticSearch](#opencdk8s-cdk8s-opendistro-for-elasticsearch-myelasticsearch)|*No description*


**Structs**

Name|Description
----|-----------
[EsOpts](#opencdk8s-cdk8s-opendistro-for-elasticsearch-esopts)|*No description*
[ResourceQuantity](#opencdk8s-cdk8s-opendistro-for-elasticsearch-resourcequantity)|*No description*
[ResourceRequirements](#opencdk8s-cdk8s-opendistro-for-elasticsearch-resourcerequirements)|*No description*



## class MyElasticSearch 🔹 <a id="opencdk8s-cdk8s-opendistro-for-elasticsearch-myelasticsearch"></a>



__Implements__: [IConstruct](#constructs-iconstruct)
__Extends__: [Construct](#constructs-construct)

### Initializer




```ts
new MyElasticSearch(scope: Construct, name: string, opts: EsOpts)
```

* **scope** (<code>[Construct](#constructs-construct)</code>)  *No description*
* **name** (<code>string</code>)  *No description*
* **opts** (<code>[EsOpts](#opencdk8s-cdk8s-opendistro-for-elasticsearch-esopts)</code>)  *No description*
  * **clientNodeSelectorParams** (<code>Map<string, string></code>)  *No description* __*Optional*__
  * **clientReplicas** (<code>number</code>)  *No description* __*Optional*__
  * **clientResources** (<code>[ResourceRequirements](#opencdk8s-cdk8s-opendistro-for-elasticsearch-resourcerequirements)</code>)  *No description* __*Optional*__
  * **clientVolumeSize** (<code>string</code>)  *No description* __*Optional*__
  * **createElasticsearchSecret** (<code>boolean</code>)  *No description* __*Optional*__
  * **dataNodeSelectorParams** (<code>Map<string, string></code>)  *No description* __*Optional*__
  * **dataReplicas** (<code>number</code>)  *No description* __*Optional*__
  * **dataResources** (<code>[ResourceRequirements](#opencdk8s-cdk8s-opendistro-for-elasticsearch-resourcerequirements)</code>)  *No description* __*Optional*__
  * **dataVolumeSize** (<code>string</code>)  *No description* __*Optional*__
  * **image** (<code>string</code>)  *No description* __*Optional*__
  * **kibanaImage** (<code>string</code>)  *No description* __*Optional*__
  * **kibanaNodeSelectorParams** (<code>Map<string, string></code>)  *No description* __*Optional*__
  * **kibanaReplicas** (<code>number</code>)  *No description* __*Optional*__
  * **kibanaResources** (<code>[ResourceRequirements](#opencdk8s-cdk8s-opendistro-for-elasticsearch-resourcerequirements)</code>)  *No description* __*Optional*__
  * **masterNodeSelectorParams** (<code>Map<string, string></code>)  *No description* __*Optional*__
  * **masterReplicas** (<code>number</code>)  *No description* __*Optional*__
  * **masterResources** (<code>[ResourceRequirements](#opencdk8s-cdk8s-opendistro-for-elasticsearch-resourcerequirements)</code>)  *No description* __*Optional*__
  * **masterVolumeSize** (<code>string</code>)  *No description* __*Optional*__
  * **name** (<code>string</code>)  *No description* __*Optional*__
  * **namespace** (<code>string</code>)  *No description* __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**createElasticsearchSecret**?🔹 | <code>boolean</code> | __*Optional*__
**image**?🔹 | <code>string</code> | __*Optional*__
**kibanaImage**?🔹 | <code>string</code> | Namespace.<br/>__*Default*__: elasticsearch
**name**?🔹 | <code>string</code> | __*Optional*__
**namespace**?🔹 | <code>string</code> | __*Optional*__



## struct EsOpts 🔹 <a id="opencdk8s-cdk8s-opendistro-for-elasticsearch-esopts"></a>






Name | Type | Description 
-----|------|-------------
**clientNodeSelectorParams**?🔹 | <code>Map<string, string></code> | __*Optional*__
**clientReplicas**?🔹 | <code>number</code> | __*Optional*__
**clientResources**?🔹 | <code>[ResourceRequirements](#opencdk8s-cdk8s-opendistro-for-elasticsearch-resourcerequirements)</code> | __*Optional*__
**clientVolumeSize**?🔹 | <code>string</code> | __*Optional*__
**createElasticsearchSecret**?🔹 | <code>boolean</code> | __*Optional*__
**dataNodeSelectorParams**?🔹 | <code>Map<string, string></code> | __*Optional*__
**dataReplicas**?🔹 | <code>number</code> | __*Optional*__
**dataResources**?🔹 | <code>[ResourceRequirements](#opencdk8s-cdk8s-opendistro-for-elasticsearch-resourcerequirements)</code> | __*Optional*__
**dataVolumeSize**?🔹 | <code>string</code> | __*Optional*__
**image**?🔹 | <code>string</code> | __*Optional*__
**kibanaImage**?🔹 | <code>string</code> | __*Optional*__
**kibanaNodeSelectorParams**?🔹 | <code>Map<string, string></code> | __*Optional*__
**kibanaReplicas**?🔹 | <code>number</code> | __*Optional*__
**kibanaResources**?🔹 | <code>[ResourceRequirements](#opencdk8s-cdk8s-opendistro-for-elasticsearch-resourcerequirements)</code> | __*Optional*__
**masterNodeSelectorParams**?🔹 | <code>Map<string, string></code> | __*Optional*__
**masterReplicas**?🔹 | <code>number</code> | __*Optional*__
**masterResources**?🔹 | <code>[ResourceRequirements](#opencdk8s-cdk8s-opendistro-for-elasticsearch-resourcerequirements)</code> | __*Optional*__
**masterVolumeSize**?🔹 | <code>string</code> | __*Optional*__
**name**?🔹 | <code>string</code> | __*Optional*__
**namespace**?🔹 | <code>string</code> | __*Optional*__



## struct ResourceQuantity 🔹 <a id="opencdk8s-cdk8s-opendistro-for-elasticsearch-resourcequantity"></a>






Name | Type | Description 
-----|------|-------------
**cpu**?🔹 | <code>string</code> | __*Default*__: no limit
**memory**?🔹 | <code>string</code> | __*Default*__: no limit



## struct ResourceRequirements 🔹 <a id="opencdk8s-cdk8s-opendistro-for-elasticsearch-resourcerequirements"></a>






Name | Type | Description 
-----|------|-------------
**limits**?🔹 | <code>[ResourceQuantity](#opencdk8s-cdk8s-opendistro-for-elasticsearch-resourcequantity)</code> | Maximum resources for the web app.<br/>__*Default*__: CPU = 400m, Mem = 512Mi
**requests**?🔹 | <code>[ResourceQuantity](#opencdk8s-cdk8s-opendistro-for-elasticsearch-resourcequantity)</code> | Required resources for the web app.<br/>__*Default*__: CPU = 200m, Mem = 256Mi



