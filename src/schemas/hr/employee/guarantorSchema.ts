import { z } from 'zod';

// ==================== Helper Functions ====================

/**
 * Creates a validation schema for a required name field (no numbers allowed)
 * @param label - The display name of the field
 */
const nameField = (label: string) =>
    z
        .string()
        .min(1, `Please enter ${label}`)
        .regex(/^[a-zA-Z\s'-]+$/, `${label} can only contain letters, spaces, apostrophes, and hyphens`)
        .transform((val) => val.trim());

/**
 * Creates a validation schema for an optional name field
 * @param label - The display name of the field
 */
const optionalNameField = (label: string) =>
    z
        .string()
        .optional()
        .refine(
            (val) => !val || /^[a-zA-Z\s'-]+$/.test(val),
            `${label} can only contain letters, spaces, apostrophes, and hyphens`
        )
        .transform((val) => val?.trim());

/**
 * Validates Ethiopian phone numbers
 * Formats: 09XXXXXXXX, 2519XXXXXXXX, +2519XXXXXXXX
 */
const ethiopianPhone = z
    .string()
    .min(1, 'Please enter a phone number')
    .refine(
        (val) => {
            const cleaned = val.replace(/\s/g, '');
            return /^(09\d{8}|2519\d{8}|\+2519\d{8})$/.test(cleaned);
        },
        'Phone number must be in format 09XXXXXXXX or +251XXXXXXXXX'
    );

/**
 * Validates optional phone number
 */
const optionalPhone = z
    .string()
    .optional()
    .refine(
        (val) => !val || /^(09\d{8}|2519\d{8}|\+2519\d{8})$/.test(val.replace(/\s/g, '')),
        'Phone number must be in format 09XXXXXXXX or +251XXXXXXXXX'
    );

/**
 * Validates email address (optional)
 */
const optionalEmail = z
    .string()
    .optional()
    .refine(
        (val) => {
            if (!val || val.trim() === '') return true;
            const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
            return emailRegex.test(val);
        },
        'Please enter a valid email address (e.g., name@example.com)'
    );

/**
 * Validates required email address
 */
const requiredEmail = z
    .string()
    .min(1, 'Please enter an email address')
    .email('Please enter a valid email address (e.g., name@example.com)')
    .refine((val) => !val.includes(' '), 'Email address cannot contain spaces');

/**
 * Validates URL (optional)
 */
const optionalUrl = z
    .string()
    .optional()
    .refine(
        (val) => !val || /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(val),
        'Please enter a valid URL'
    );

/**
 * Validates required select field
 */
const requiredSelect = (label: string) =>
    z.string().min(1, `Please select ${label}`);

/**
 * Validates UUID format
 */
const uuidValidator = z
    .string()
    .min(1, 'Invalid employee ID')
    .regex(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        'Invalid employee ID format'
    );

/**
 * Validates file upload (optional)
 */
const optionalFile = z
    .instanceof(File)
    .nullable()
    .optional()
    .refine(
        (file) => !file || file.size <= 5 * 1024 * 1024,
        'File size must be less than 5MB'
    )
    .refine(
        (file) => !file || ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type),
        'Only JPEG, PNG, and PDF files are allowed'
    );

// ==================== Main Guarantor Schema ====================

export const guarantorSchema = z.object({
    // Personal Information
    firstName: nameField('first name'),
    middleName: nameField('middle name'),
    lastName: nameField('last name'),
    nationality: nameField('nationality'),
    gender: requiredSelect('gender'),
    relation: requiredSelect('relation'),

    // Employee Association
    employeeId: uuidValidator,

    // Address Information
    addressType: requiredSelect('address type'),
    country: nameField('country'),
    region: nameField('region'),
    subcity: z.string().optional(),
    zone: z.string().optional(),
    woreda: z.string().optional(),
    kebele: z.string().optional(),
    houseNo: z.string().optional(),
    poBox: z.string().optional(),
    fax: optionalPhone,

    // Contact Information
    telephone: ethiopianPhone,
    email: optionalEmail,
    website: optionalUrl,

    // Document Upload
    File: optionalFile,
});

// ==================== Type Export ====================

export type GuarantorFormValues = z.infer<typeof guarantorSchema>;

// ==================== Partial Schema for Edit Mode ====================

export const guarantorEditSchema = guarantorSchema.partial();

export type GuarantorEditValues = z.infer<typeof guarantorEditSchema>;

// ==================== Validation Helpers ====================

export const guarantorValidationHelpers = {
    /**
     * Validates a single field
     */
    validateField: async <T extends z.ZodTypeAny>(
        schema: T,
        value: unknown
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await schema.parseAsync(value);
            return { success: true };
        } catch (error) {
            if (error instanceof z.ZodError) {
                return { success: false, error: error.errors[0].message };
            }
            return { success: false, error: 'Validation failed' };
        }
    },

    /**
     * Formats phone number to Ethiopian standard
     */
    formatPhoneNumber: (phone: string): string => {
        const cleaned = phone.replace(/\s/g, '');
        if (cleaned.startsWith('+251')) return cleaned;
        if (cleaned.startsWith('251')) return `+${cleaned}`;
        if (cleaned.startsWith('09')) return `+251${cleaned.slice(1)}`;
        return phone;
    },

    /**
     * Validates complete guarantor form
     */
    validateForm: async (data: unknown): Promise<{
        success: boolean;
        errors?: Record<string, string>;
        data?: GuarantorFormValues
    }> => {
        try {
            const validated = await guarantorSchema.parseAsync(data);
            return { success: true, data: validated };
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors: Record<string, string> = {};
                error.errors.forEach((err) => {
                    if (err.path) {
                        errors[err.path.join('.')] = err.message;
                    }
                });
                return { success: false, errors };
            }
            return { success: false, errors: { _form: 'Validation failed' } };
        }
    },
};

// ==================== Schema for Different Form Sections ====================

export const guarantorPersonalInfoSchema = guarantorSchema.pick({
    firstName: true,
    middleName: true,
    lastName: true,
    nationality: true,
    gender: true,
    relation: true,
});

export const guarantorAddressInfoSchema = guarantorSchema.pick({
    addressType: true,
    country: true,
    region: true,
    subcity: true,
    zone: true,
    woreda: true,
    kebele: true,
    houseNo: true,
    poBox: true,
    fax: true,
});

export const guarantorContactInfoSchema = guarantorSchema.pick({
    telephone: true,
    email: true,
    website: true,
});

export const guarantorDocumentSchema = guarantorSchema.pick({
    File: true,
});

// ==================== Custom Error Messages ====================

export const guarantorErrorMessages = {
    required: (field: string) => `${field} is required`,
    invalidName: 'Name can only contain letters, spaces, and basic punctuation',
    invalidPhone: 'Please enter a valid Ethiopian phone number',
    invalidEmail: 'Please enter a valid email address',
    invalidUrl: 'Please enter a valid URL',
    invalidUUID: 'Invalid employee ID format',
    fileTooLarge: 'File size must be less than 5MB',
    invalidFileType: 'Only JPEG, PNG, and PDF files are allowed',
};

// ==================== Validation Rules Documentation ====================

export const guarantorValidationRules = {
    nameFields: {
        pattern: /^[a-zA-Z\s'-]+$/,
        message: 'Only letters, spaces, apostrophes, and hyphens are allowed',
        transform: 'Trims whitespace',
    },
    phone: {
        pattern: /^(09\d{8}|2519\d{8}|\+2519\d{8})$/,
        formats: ['09XXXXXXXX', '2519XXXXXXXX', '+2519XXXXXXXX'],
        message: 'Must be a valid Ethiopian phone number',
    },
    email: {
        pattern: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
        message: 'Must be a valid email address',
    },
    file: {
        maxSize: '5MB',
        allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
        message: 'Only JPEG, PNG, and PDF files up to 5MB are allowed',
    },
};

// ==================== Export All ====================

export default guarantorSchema;