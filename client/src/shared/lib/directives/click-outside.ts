import type { Directive } from 'vue';

type ClickOutsideElement = HTMLElement & { _clickOutsideHandler?: (e: MouseEvent) => void };

export const vClickOutside: Directive<ClickOutsideElement, () => void> = {
  mounted(el, binding) {
    el._clickOutsideHandler = (event: MouseEvent) => {
      if (!el.contains(event.target as Node)) {
        binding.value();
      }
    };
    document.addEventListener('mousedown', el._clickOutsideHandler);
  },
  unmounted(el) {
    if (el._clickOutsideHandler) {
      document.removeEventListener('mousedown', el._clickOutsideHandler);
      delete el._clickOutsideHandler;
    }
  },
};
