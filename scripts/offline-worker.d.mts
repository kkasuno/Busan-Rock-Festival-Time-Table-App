export function createOfflineWorker(config: {
  cacheName: string;
  assets: string[];
  shell: string;
  shellHash: string;
  timeout?: number;
}): string;
