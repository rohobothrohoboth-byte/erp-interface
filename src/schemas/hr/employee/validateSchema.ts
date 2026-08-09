import type { ZodSchema, ZodError } from 'zod';

/**
 * Configuration options for the Zod validation adapter
 */
interface ZodValidateOptions {
  /**
   * Whether to show raw Zod type errors (default: false)
   */
  showRawTypeErrors?: boolean;

  /**
   * Custom error message for missing required fields
   */
  requiredMessage?: string;

  /**
   * Whether to include all field errors or just the first per field (default: true)
   */
  firstErrorOnly?: boolean;

  /**
   * Custom error transformer function
   */
  transformError?: (field: string, message: string, code: string) => string;
}

/**
 * Default error messages
 */
const DEFAULT_ERROR_MESSAGES = {
  required: 'This field is required',
  invalidType: 'Please enter a valid value',
  invalidFormat: 'Please enter the value in the correct format',
  tooSmall: 'Value is too short',
  tooBig: 'Value is too long',
  invalidEmail: 'Please enter a valid email address',
  invalidUrl: 'Please enter a valid URL',
  invalidDate: 'Please enter a valid date',
  custom: 'Please fill in this field',
};

/**
 * Maps Zod error codes to user-friendly messages
 */
const getDefaultMessageForCode = (code: string): string => {
  const messageMap: Record<string, string> = {
    'too_small': DEFAULT_ERROR_MESSAGES.tooSmall,
    'too_big': DEFAULT_ERROR_MESSAGES.tooBig,
    'invalid_string': DEFAULT_ERROR_MESSAGES.invalidFormat,
    'invalid_type': DEFAULT_ERROR_MESSAGES.invalidType,
    'invalid_enum_value': 'Please select a valid option',
    'custom': DEFAULT_ERROR_MESSAGES.custom,
  };
  return messageMap[code] || DEFAULT_ERROR_MESSAGES.custom;
};

/**
 * Checks if an error indicates a missing required field
 */
const isMissingRequiredError = (issue: z.ZodIssue): boolean => {
  return (
      (issue.code === 'invalid_type' && issue.received === 'undefined') ||
      (issue.code === 'too_small' && issue.minimum === 1 && issue.type === 'string')
  );
};

/**
 * Converts a Zod schema into a Formik-compatible validate function.
 * Maps all zod errors to user-friendly messages with enhanced error handling.
 *
 * @param schema - The Zod schema to validate against
 * @param options - Configuration options for the validator
 * @returns A Formik validation function
 *
 * @example
 * ```tsx
 * const validate = zodValidate(userSchema, {
 *   requiredMessage: 'Please fill this field',
 *   firstErrorOnly: true
 * });
 *
 * <Formik
 *   initialValues={initialData}
 *   validate={validate}
 *   onSubmit={handleSubmit}
 * >
 *   ...
 * </Formik>
 * ```
 */
export function zodValidate<T>(
    schema: ZodSchema<T>,
    options: ZodValidateOptions = {}
): (values: T) => Record<string, string> {
  const {
    showRawTypeErrors = false,
    requiredMessage = DEFAULT_ERROR_MESSAGES.required,
    firstErrorOnly = true,
    transformError,
  } = options;

  return (values: T): Record<string, string> => {
    const result = schema.safeParse(values);

    // Return empty errors if validation passed
    if (result.success) {
      return {};
    }

    const errors: Record<string, string> = {};

    for (const issue of result.error.issues) {
      const field = issue.path.join('.');

      // Skip if no field path or if we already have an error and only want first
      if (!field || (firstErrorOnly && errors[field])) {
        continue;
      }

      let message = issue.message;

      // Handle missing required fields
      if (isMissingRequiredError(issue)) {
        message = requiredMessage;
      }
      // Handle raw type errors (undefined/null)
      else if (!showRawTypeErrors && issue.code === 'invalid_type' && issue.received === 'undefined') {
        message = requiredMessage;
      }
      // Handle other Zod errors - use default message if message is generic
      else if (message === 'Required' || message === 'Invalid input') {
        message = getDefaultMessageForCode(issue.code);
      }

      // Apply custom transformation if provided
      if (transformError) {
        message = transformError(field, message, issue.code);
      }

      errors[field] = message;
    }

    return errors;
  };
}

/**
 * Creates a validation function that validates only specific fields
 * Useful for partial form validation (e.g., multi-step forms)
 *
 * @param schema - The Zod schema to validate against
 * @param fields - Array of field names to validate (empty = validate all)
 * @param options - Configuration options
 */
export function zodValidatePartial<T>(
    schema: ZodSchema<T>,
    fields: string[] = [],
    options: ZodValidateOptions = {}
): (values: Partial<T>) => Record<string, string> {
  const validator = zodValidate(schema, options);

  return (values: Partial<T>): Record<string, string> => {
    const allErrors = validator(values as T);

    // If fields specified, filter errors to only those fields
    if (fields.length > 0) {
      const filteredErrors: Record<string, string> = {};
      for (const field of fields) {
        if (allErrors[field]) {
          filteredErrors[field] = allErrors[field];
        }
      }
      return filteredErrors;
    }

    return allErrors;
  };
}

/**
 * Validates a single field against a Zod schema
 * Useful for real-time field validation
 *
 * @param schema - The Zod schema for the field
 * @param value - The value to validate
 * @returns Error message or null if valid
 */
export async function validateField<T>(
    schema: ZodSchema<T>,
    value: unknown
): Promise<string | null> {
  const result = await schema.safeParseAsync(value);

  if (result.success) {
    return null;
  }

  const firstIssue = result.error.issues[0];
  if (!firstIssue) {
    return 'Invalid value';
  }

  // Handle missing required fields
  if (isMissingRequiredError(firstIssue)) {
    return DEFAULT_ERROR_MESSAGES.required;
  }

  return firstIssue.message;
}

/**
 * Validates multiple fields at once
 *
 * @param schema - The Zod schema
 * @param values - Object containing field values to validate
 * @returns Object with field errors
 */
export async function validateFields<T extends Record<string, unknown>>(
    schema: ZodSchema<T>,
    values: T
): Promise<Record<string, string>> {
  const result = await schema.safeParseAsync(values);

  if (result.success) {
    return {};
  }

  const errors: Record<string, string> = {};

  for (const issue of result.error.issues) {
    const field = issue.path.join('.');
    if (!field) continue;

    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

/**
 * Checks if a value is valid according to the schema
 *
 * @param schema - The Zod schema
 * @param value - The value to check
 * @returns Boolean indicating validity
 */
export function isValid<T>(schema: ZodSchema<T>, value: unknown): value is T {
  return schema.safeParse(value).success;
}

/**
 * Creates a validation function that debounces validation calls
 * Useful for real-time validation in input fields
 *
 * @param schema - The Zod schema
 * @param delay - Debounce delay in milliseconds (default: 300)
 * @returns Debounced validation function
 */
export function createDebouncedValidator<T>(
    schema: ZodSchema<T>,
    delay: number = 300
): (value: unknown) => Promise<string | null> {
  let timeoutId: NodeJS.Timeout;
  let lastPromise: Promise<string | null> | null = null;

  return (value: unknown): Promise<string | null> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const promise = new Promise<string | null>((resolve) => {
      timeoutId = setTimeout(async () => {
        const result = await validateField(schema, value);
        resolve(result);
      }, delay);
    });

    lastPromise = promise;
    return promise;
  };
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  public fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Throws a ValidationError if the data is invalid
 *
 * @param schema - The Zod schema
 * @param data - The data to validate
 * @throws ValidationError
 */
export function validateOrThrow<T>(schema: ZodSchema<T>, data: unknown): asserts data is T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join('.');
      if (field) {
        errors[field] = issue.message;
      }
    }
    throw new ValidationError('Validation failed', errors);
  }
}

// ==================== Export All ====================

export default zodValidate;