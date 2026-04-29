import type { ZodSchema } from 'zod';

/**
 * Converts a Zod schema into a Formik-compatible validate function.
 * Maps all zod errors to user-friendly messages, suppressing raw type errors.
 */
export function zodValidate<T>(schema: ZodSchema<T>) {
  return (values: T): Record<string, string> => {
    const result = schema.safeParse(values);
    if (result.success) return {};

    const errors: Record<string, string> = {};

    for (const issue of result.error.issues) {
      const field = issue.path.join('.');
      if (!field) continue;

      // Skip raw zod type errors — these happen when a field is undefined/null
      // and we already have a "required" message from .min(1) or .refine()
      if (issue.code === 'invalid_type' && issue.received === 'undefined') {
        if (!errors[field]) {
          errors[field] = `Please fill in this field`;
        }
        continue;
      }

      if (!errors[field]) {
        errors[field] = issue.message;
      }
    }

    return errors;
  };
}
