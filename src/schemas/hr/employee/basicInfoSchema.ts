import { z } from 'zod';

const nameField = (label: string) =>
  z
    .string()
    .min(1, `Please enter ${label}`)
    .regex(/^[^\d]+$/, `${label} cannot contain numbers`);

const amharicField = (label: string) =>
  z
    .string()
    .min(1, `Please enter ${label}`)
    .regex(/^[\u1200-\u137F\s]+$/, `${label} must be written in Amharic`);

// Ethiopian phone: 09XXXXXXXX or 2519XXXXXXXX or +2519XXXXXXXX
const ethPhone = z
  .string()
  .min(1, 'Please enter a phone number')
  .refine(
    (val) => /^(09\d{8}|2519\d{8}|\+2519\d{8})$/.test(val.replace(/\s/g, '')),
    'Phone number must be in format 09XXXXXXXX or +2519XXXXXXXX'
  );

// Email: must contain exactly one @, at least one . after @, no spaces
const emailField = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true; // optional
      const parts = val.split('@');
      if (parts.length !== 2) return false;       // must have exactly one @
      const [local, domain] = parts;
      if (!local || !domain) return false;         // nothing before or after @
      if (!domain.includes('.')) return false;     // domain must have a dot
      const dotParts = domain.split('.');
      if (dotParts.some((p) => p === '')) return false; // no empty parts like "gmail."
      return true;
    },
    'Please enter a valid email address (e.g. name@example.com)'
  );

const minAgeDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d;
};

export const basicInfoSchema = z.object({
  firstName:        nameField('first name'),
  firstNameAm:      amharicField('first name in Amharic'),
  middleName:       nameField('middle name'),
  middleNameAm:     amharicField('middle name in Amharic'),
  lastName:         nameField('last name'),
  lastNameAm:       amharicField('last name in Amharic'),
  nationality:      nameField('nationality'),
  gender:           z.string().min(1, 'Please select a gender'),
  birthDate: z
    .string()
    .min(1, 'Please enter a birth date')
    .refine((val) => !isNaN(new Date(val).getTime()), 'Please enter a valid date')
    .refine(
      (val) => new Date(val) <= minAgeDate(),
      'Employee must be at least 18 years old'
    ),
  maritalStatus:    z.string().min(1, 'Please select a marital status'),
  employmentDate:   z.string().min(1, 'Please enter an employment date'),
  branchId:         z.string().min(1, 'Please select a branch'),
  departmentId:     z.string().min(1, 'Please select a department'),
  positionId:       z.string().min(1, 'Please select a position'),
  jobGradeId:       z.string().min(1, 'Please select a job grade'),
  jgStepId:         z.string().min(1, 'Please select a job grade step'),
  employmentType:   z.string().min(1, 'Please select an employment type'),
  employmentNature: z.string().min(1, 'Please select an employment nature'),
  workArrangement:  z.string().optional(),
  addressType:      z.string().min(1, 'Please select an address type'),
  country:          z.string().min(1, 'Please enter a country'),
  region:           z.string().min(1, 'Please enter a region'),
  telephone:        ethPhone,
  subcity:          z.string().optional(),
  zone:             z.string().optional(),
  woreda:           z.string().optional(),
  kebele:           z.string().optional(),
  houseNo:          z.string().optional(),
  poBox:            z.string().optional(),
  fax:              z.string().optional(),
  email:            emailField,
  website:          z.string().optional(),
  File:             z.instanceof(File).nullable().optional(),
});

export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;
