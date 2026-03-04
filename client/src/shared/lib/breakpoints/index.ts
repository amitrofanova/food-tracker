import { useBreakpoints as useVueUseBreakpoints } from '@vueuse/core';

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export function useBreakpoints() {
  const breakpoints = useVueUseBreakpoints(BREAKPOINTS);

  return {
    ...breakpoints,
    isMobile: breakpoints.smaller('tablet'),
    isTablet: breakpoints.between('tablet', 'desktop'),
    isDesktop: breakpoints.greaterOrEqual('desktop'),

    current: breakpoints.active(),
  };
}
