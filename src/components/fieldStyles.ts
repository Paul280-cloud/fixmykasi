// Shared look for text fields and dropdowns (PRD 8.3 Text field).
export const inputClass = (invalid: boolean) =>
  `h-12 w-full rounded-input border bg-white px-3.5 text-base text-text placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 disabled:bg-surface ${
    invalid
      ? 'border-error focus:border-error focus:ring-error/20'
      : 'border-border focus:border-primary focus:ring-primary/20'
  }`;
