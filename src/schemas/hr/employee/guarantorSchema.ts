import { z } from 'zod';

const nameField = (label: string) =>
  z
    .string()
    .min(1, `Please enter ${label}`)
    .regex(/^[^\d]+$/, `${label} cannot contain numbers`);

const ethPhone = z
  .string()
  .min(1, 'Please enter a phone number')
  .refine(
    (val) => /^(09\d{8}|2519\d{8}|\+2519\d{8})$/.test(val.replace(/\s/g, '')),
    'Phone number must be in format 09XXXXXXXX or +2519XXXXXXXX'
  );

const emailField = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true;
      const parts = val.split('@');
      if (parts.length !== 2) return false;
      const [local, domain] = parts;
      if (!local || !domain) return false;
      if (!domain.includes('.')) return false;
      const dotParts = domain.split('.');
      if (dotParts.some((p) => p === '')) return false;
      return true;
    },
    'Please enter a valid email address (e.g. name@example.com)'
  );

export const guarantorSchema = z.object({
  firstName:   nameField('first name'),
  middleName:  nameField('middle name'),
  lastName:    nameField('last name'),
  nationality: nameField('nationality'),
  gender:      z.string().min(1, 'Please select a gender'),
  relation:    z.string().min(1, 'Please select a relation'),
  employeeId:  z.string().min(1, 'Employee ID is required'),
  addressType: z.string().min(1, 'Please select an address type'),
  country:     z.string().min(1, 'Please enter a country'),
  region:      z.string().min(1, 'Please enter a region'),
  telephone:   ethPhone,
  subcity:     z.string().optional(),
  zone:        z.string().optional(),
  woreda:      z.string().optional(),
  kebele:      z.string().optional(),
  houseNo:     z.string().optional(),
  poBox:       z.string().optional(),
  fax:         z.string().optional(),
  email:       emailField,
  website:     z.string().optional(),
  File:        z.instanceof(File).nullable().optional(),
});

export type GuarantorFormValues = z.infer<typeof guarantorSchema>;
