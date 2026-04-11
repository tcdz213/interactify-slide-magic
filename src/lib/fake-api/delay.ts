/** Configurable delay simulator for fake API calls */
let globalDelay = 300;

export function setApiDelay(ms: number) {
  globalDelay = ms;
}

export function delay(ms?: number): Promise<void> {
  const duration = ms ?? globalDelay;
  return new Promise((resolve) => setTimeout(resolve, duration));
}
