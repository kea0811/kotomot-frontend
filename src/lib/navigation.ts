// Navigation cache to prevent redundant navigations
const navigationCache = new Map<string, number>();
const NAVIGATION_DEBOUNCE = 300; // ms

type NavigateFunction = (to: string) => void;

export class NavigationOptimizer {
  private static navigateFn: NavigateFunction | null = null;
  private static preloadedRoutes = new Set<string>();
  private static navigationInProgress = false;

  static setNavigate(navigate: NavigateFunction) {
    this.navigateFn = navigate;
  }

  static async navigate(href: string) {
    if (!this.navigateFn) {
      console.warn('Navigate function not initialized');
      window.location.href = href;
      return;
    }

    // Prevent duplicate navigations
    const now = Date.now();
    const lastNavigation = navigationCache.get(href);
    if (lastNavigation && now - lastNavigation < NAVIGATION_DEBOUNCE) {
      return;
    }

    // Prevent concurrent navigations
    if (this.navigationInProgress) {
      return;
    }

    navigationCache.set(href, now);
    this.navigationInProgress = true;

    try {
      this.navigateFn(href);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location if navigate fails
      window.location.href = href;
    } finally {
      this.navigationInProgress = false;
    }
  }

  static preload(_href: string) {
    // React Router does not have built-in prefetching like Next.js
    // This is a no-op placeholder for compatibility
  }

  static isNavigating() {
    return this.navigationInProgress;
  }
}

// Utility function to handle navigation with optimistic UI
export function optimisticNavigate(
  href: string,
  navigate: NavigateFunction,
  callbacks?: {
    onStart?: () => void;
    onComplete?: () => void;
  }
) {
  callbacks?.onStart?.();

  try {
    navigate(href);
    callbacks?.onComplete?.();
  } catch (error) {
    console.error('Navigation failed:', error);
    callbacks?.onComplete?.();
  }
}
