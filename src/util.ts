
import * as k8s from './imports/k8s';

export interface ResourceRequirements {
  /**
     * Maximum resources for the web app.
     * @default - CPU = 400m, Mem = 512Mi
     */
  readonly limits?: ResourceQuantity;

  /**
     * Required resources for the web app.
     * @default - CPU = 200m, Mem = 256Mi
     */
  readonly requests?: ResourceQuantity;
}

export interface ResourceQuantity {
  /**
   * @default - no limit
   */
  readonly cpu?: string;

  /**
   * @default - no limit
   */
  readonly memory?: string;
}

export function convertQuantity(
  user: ResourceQuantity | undefined,
  defaults: { cpu: string; memory: string },
): { [key: string]: k8s.Quantity } {
  // defaults
  if (!user) {
    return {
      cpu: k8s.Quantity.fromString(defaults.cpu),
      memory: k8s.Quantity.fromString(defaults.memory),
    };
  }

  const result: { [key: string]: k8s.Quantity } = {};

  if (user.cpu) {
    result.cpu = k8s.Quantity.fromString(user.cpu);
  }

  if (user.memory) {
    result.memory = k8s.Quantity.fromString(user.memory);
  }

  return result;
}