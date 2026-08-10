import type { UUID } from 'crypto';
import type { JobGradeListDto } from '@/modules/hr/types/jobgrade';

// Function to generate UUID (simplified for mock data)
const generateUUID = (): UUID => {
  return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }) as UUID;
};

// Base grade names and structures
const gradeLevels = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'
];

const gradeCategories = [
  'Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Principal', 'Director', 'Executive'
];

const specialtyAreas = [
  'Technical', 'Administrative', 'Professional', 'Management', 'Support', 
  'Operations', 'Sales', 'Marketing', 'Finance', 'HR', 'IT', 'Engineering'
];

// Generate 120 job grades
export const jobGradeMockData: JobGradeListDto[] = Array.from({ length: 120 }, (_, index) => {
  const category = gradeCategories[Math.floor(Math.random() * gradeCategories.length)];
  const level = gradeLevels[Math.floor(Math.random() * gradeLevels.length)];
  const specialty = specialtyAreas[Math.floor(Math.random() * specialtyAreas.length)];
  
  // Determine base salary based on category and level
  let baseSalary = 0;
  switch (category) {
    case 'Entry':
      baseSalary = 30000 + (index * 500);
      break;
    case 'Junior':
      baseSalary = 40000 + (index * 600);
      break;
    case 'Mid':
      baseSalary = 55000 + (index * 800);
      break;
    case 'Senior':
      baseSalary = 75000 + (index * 1000);
      break;
    case 'Lead':
      baseSalary = 95000 + (index * 1200);
      break;
    case 'Principal':
      baseSalary = 120000 + (index * 1500);
      break;
    case 'Director':
      baseSalary = 150000 + (index * 2000);
      break;
    case 'Executive':
      baseSalary = 200000 + (index * 3000);
      break;
  }
  
  // Add specialty premium
  const specialtyPremium = baseSalary * 0.1;
  baseSalary += specialtyPremium;
  
  const startSalary = Math.round(baseSalary / 1000) * 1000;
  const maxSalary = Math.round((baseSalary * (1.3 + Math.random() * 0.3)) / 1000) * 1000;
  
  // Create grade name with variations
  const nameVariations = [
    `${category} Grade ${level}`,
    `Grade ${level} - ${specialty}`,
    `${specialty} Grade ${level}`,
    `Level ${level} ${category}`,
    `${category} ${specialty} Grade`
  ];
  
  const name = nameVariations[Math.floor(Math.random() * nameVariations.length)];
  
  return {
    id: generateUUID(),
    name,
    startSalary,
    maxSalary,
    rowVersion: (Math.floor(Math.random() * 10) + 1).toString()
  };
});

// Sort by start salary for better organization
jobGradeMockData.sort((a, b) => a.startSalary - b.startSalary);

// Grouped data for different use cases
export const jobGradeDataByCategory = {
  entryLevel: jobGradeMockData.filter(grade => grade.name.includes('Entry')),
  juniorLevel: jobGradeMockData.filter(grade => grade.name.includes('Junior')),
  midLevel: jobGradeMockData.filter(grade => grade.name.includes('Mid')),
  seniorLevel: jobGradeMockData.filter(grade => grade.name.includes('Senior')),
  leadLevel: jobGradeMockData.filter(grade => grade.name.includes('Lead')),
  principalLevel: jobGradeMockData.filter(grade => grade.name.includes('Principal')),
  directorLevel: jobGradeMockData.filter(grade => grade.name.includes('Director')),
  executiveLevel: jobGradeMockData.filter(grade => grade.name.includes('Executive'))
};

// Salary range statistics
export const jobGradeSalaryStats = {
  lowestSalary: Math.min(...jobGradeMockData.map(grade => grade.startSalary)),
  highestSalary: Math.max(...jobGradeMockData.map(grade => grade.maxSalary)),
  averageStartSalary: Math.round(jobGradeMockData.reduce((sum, grade) => sum + grade.startSalary, 0) / jobGradeMockData.length),
  averageMaxSalary: Math.round(jobGradeMockData.reduce((sum, grade) => sum + grade.maxSalary, 0) / jobGradeMockData.length),
  totalGrades: jobGradeMockData.length
};

// Utility to get grades by salary range
export const getGradesBySalaryRange = (minSalary: number, maxSalary: number): JobGradeListDto[] => {
  return jobGradeMockData.filter(grade => 
    grade.startSalary >= minSalary && grade.maxSalary <= maxSalary
  );
};

// Utility to search grades by name
export const searchGradesByName = (searchTerm: string): JobGradeListDto[] => {
  return jobGradeMockData.filter(grade =>
    grade.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Sample usage and verification
console.log('Generated Job Grade Statistics:');
console.log(`Total Grades: ${jobGradeSalaryStats.totalGrades}`);
console.log(`Salary Range: $${jobGradeSalaryStats.lowestSalary.toLocaleString()} - $${jobGradeSalaryStats.highestSalary.toLocaleString()}`);
console.log(`Average Start: $${jobGradeSalaryStats.averageStartSalary.toLocaleString()}`);
console.log(`Average Max: $${jobGradeSalaryStats.averageMaxSalary.toLocaleString()}`);

console.log('\nSample Grades:');
jobGradeMockData.slice(0, 5).forEach(grade => {
  console.log(`${grade.name}: $${grade.startSalary.toLocaleString()} - $${grade.maxSalary.toLocaleString()}`);
});