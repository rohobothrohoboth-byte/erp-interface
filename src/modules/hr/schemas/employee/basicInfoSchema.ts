import { z } from 'zod';

// ==================== Helper Functions ====================

/**
 * Creates a validation schema for a required text field
 * @param label - The display name of the field
 * @param maxLength - Optional maximum length
 */
const requiredField = (label: string, maxLength?: number) => {
    let schema = z
        .string()
        .min(1, `Please enter ${label}`)
        .max(maxLength || 100, `${label} cannot exceed ${maxLength || 100} characters`);

    return schema;
};

/**
 * Creates a validation schema for a name field (no numbers allowed)
 * @param label - The display name of the field
 */
const nameField = (label: string) =>
    z
        .string()
        .min(1, `Please enter ${label}`)
        .regex(/^[a-zA-Z\s'-]+$/, `${label} can only contain letters, spaces, apostrophes, and hyphens`)
        .transform((val) => val.trim());

/**
 * Creates a validation schema for an Amharic text field
 * @param label - The display name of the field
 */
const amharicField = (label: string) =>
    z
        .string()
        .min(1, `Please enter ${label}`)
        .regex(/^[\u1200-\u137F\s]+$/, `${label} must be written in Amharic characters`)
        .transform((val) => val.trim());

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
 * Validates email addresses
 * Requirements: exactly one @, domain has at least one dot, no spaces
 */
const emailValidator = z
    .string()
    .min(1, 'Please enter an email address')
    .email('Please enter a valid email address (e.g., name@example.com)')
    .refine(
        (val) => !val.includes(' '),
        'Email address cannot contain spaces'
    );

/**
 * Validates optional email field
 */
const optionalEmail = z
    .string()
    .optional()
    .refine(
        (val) => !val || (!val.includes(' ') && val.includes('@') && val.includes('.')),
        'Please enter a valid email address'
    );

/**
 * Validates date of birth (must be at least 18 years old)
 */
const getMinAgeDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
};

const birthDateValidator = z
    .string()
    .min(1, 'Please enter a date of birth')
    .refine((val) => !isNaN(new Date(val).getTime()), 'Please enter a valid date')
    .refine(
        (val) => new Date(val) <= getMinAgeDate(),
        'Employee must be at least 18 years old'
    );

/**
 * Validates employment date (cannot be in the future)
 */
const employmentDateValidator = z
    .string()
    .min(1, 'Please enter an employment date')
    .refine((val) => !isNaN(new Date(val).getTime()), 'Please enter a valid date')
    .refine(
        (val) => new Date(val) <= new Date(),
        'Employment date cannot be in the future'
    );

/**
 * Validates UUID format
 */
const uuidValidator = z
    .string()
    .min(1, 'Please select a valid option')
    .regex(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        'Invalid selection'
    );

/**
 * Validates selection fields
 */
const requiredSelect = (label: string) =>
    z.string().min(1, `Please select ${label}`);

/**
 * Validates file upload (optional)
 */
const fileValidator = z
    .instanceof(File)
    .nullable()
    .refine(
        (file) => !file || file.size <= 5 * 1024 * 1024,
        'File size must be less than 5MB'
    )
    .refine(
        (file) => !file || ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
        'Only JPEG and PNG images are allowed'
    );

// ==================== Main Schema ====================

export const basicInfoSchema = z.object({
    // Personal Information
    firstName: nameField('first name'),
    firstNameAm: amharicField('first name in Amharic'),
    middleName: nameField('middle name'),
    middleNameAm: amharicField('middle name in Amharic'),
    lastName: nameField('last name'),
    lastNameAm: amharicField('last name in Amharic'),
    nationality: nameField('nationality'),
    gender: requiredSelect('gender'),
    birthDate: birthDateValidator,
    maritalStatus: requiredSelect('marital status'),

    // Employment Details
    employmentDate: employmentDateValidator,
    branchId: uuidValidator,
    departmentId: uuidValidator,
    positionId: uuidValidator,
    jobGradeId: uuidValidator,
    jgStepId: uuidValidator,
    employmentType: requiredSelect('employment type'),
    employmentNature: requiredSelect('employment nature'),
    workArrangement: requiredSelect('work arrangement'),

    // Address Information
    addressType: requiredSelect('address type'),
    country: requiredField('country'),
    region: requiredField('region'),
    subcity: requiredField('subcity'),
    zone: z.string().optional(),
    woreda: requiredField('woreda'),
    kebele: z.string().optional(),
    houseNo: requiredField('house number'),
    poBox: z.string().optional(),
    fax: z.string().optional(),

    // Contact Information
    telephone: ethiopianPhone,
    email: emailValidator,
    website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),

    // Profile Picture
    File: fileValidator,
});

// ==================== Type Export ====================

export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

// ==================== Partial Schema for Edit Mode ====================

export const basicInfoEditSchema = basicInfoSchema.partial();

export type BasicInfoEditValues = z.infer<typeof basicInfoEditSchema>;

// ==================== Validation Helpers ====================

export const validationHelpers = {
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
     * Checks if a value is a valid UUID
     */
    isValidUUID: (value: string): boolean => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
    },

    /**
     * Formats a phone number to Ethiopian standard
     */
    formatPhoneNumber: (phone: string): string => {
        const cleaned = phone.replace(/\s/g, '');
        if (cleaned.startsWith('+251')) return cleaned;
        if (cleaned.startsWith('251')) return `+${cleaned}`;
        if (cleaned.startsWith('09')) return `+251${cleaned.slice(1)}`;
        return phone;
    },

    /**
     * Calculates age from birth date
     */
    calculateAge: (birthDate: string): number => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },

    /**
     * Checks if employee is at least 18 years old
     */
    isAdult: (birthDate: string): boolean => {
        return validationHelpers.calculateAge(birthDate) >= 18;
    },
};

// ==================== Custom Error Messages ====================

export const errorMessages = {
    required: (field: string) => `${field} is required`,
    minLength: (field: string, length: number) => `${field} must be at least ${length} characters`,
    maxLength: (field: string, length: number) => `${field} cannot exceed ${length} characters`,
    invalidEmail: 'Please enter a valid email address',
    invalidPhone: 'Please enter a valid phone number',
    invalidDate: 'Please enter a valid date',
    futureDate: 'Date cannot be in the future',
    pastDate: (years: number) => `Date must be at least ${years} years ago`,
    invalidFileType: (types: string[]) => `File must be of type: ${types.join(', ')}`,
    fileTooLarge: (maxMB: number) => `File size must be less than ${maxMB}MB`,
    invalidUUID: 'Invalid selection',
    invalidAmharic: 'Please use Amharic characters only',
    invalidName: 'Name can only contain letters, spaces, and basic punctuation',
};

// ================= = Schema for Different Form Sections ==================

export const personalInfoSchema = basicInfoSchema.pick({
    firstName: true,
    firstNameAm: true,
    middleName: true,
    middleNameAm: true,
    lastName: true,
    lastNameAm: true,
    nationality: true,
    gender: true,
    birthDate: true,
    maritalStatus: true,
});

export const employmentInfoSchema = basicInfoSchema.pick({
    employmentDate: true,
    branchId: true,
    departmentId: true,
    positionId: true,
    jobGradeId: true,
    jgStepId: true,
    employmentType: true,
    employmentNature: true,
    workArrangement: true,
});

export const addressInfoSchema = basicInfoSchema.pick({
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

export const contactInfoSchema = basicInfoSchema.pick({
    telephone: true,
    email: true,
    website: true,
});

// ==================== Export All ====================

export default basicInfoSchema;