export function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  let originalMethod = descriptor.value;
  let adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjustedDescriptor;
}
