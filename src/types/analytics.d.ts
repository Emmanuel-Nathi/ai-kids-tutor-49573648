interface Window {
  posthog?: {
    identify: (distinctId: string, properties?: Record<string, any>) => void;
    capture: (event: string, properties?: Record<string, any>) => void;
    reset: () => void;
  };
  gtag?: (...args: any[]) => void;
}
