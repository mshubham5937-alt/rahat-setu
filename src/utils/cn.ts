import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Custom font-size utilities defined via @theme in index.css.
// tailwind-merge doesn't know them and would otherwise treat e.g.
// `text-label-lg` as a text *color*, silently dropping real text colors
// (like `text-white`) that appear earlier in a cn() call.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-lg',
            'headline-xl',
            'headline-lg',
            'headline-md',
            'headline-sm',
            'body-lg',
            'body-md',
            'body-sm',
            'label-lg',
            'label-md',
            'label-sm',
            'data-metric',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}