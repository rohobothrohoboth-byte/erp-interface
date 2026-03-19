import { motion } from 'framer-motion'
import { 
  GraduationCap, 
  Users, 
  Award,
  Building,
  Calendar,
  ClipboardList,
  GitBranch,
  FileText,
  ClipboardCheck,
} from 'lucide-react'
import SettingsHeader from '../../../components/settings/SettingsHeader'
import SettingCard from '../../../components/settings/SettingCard'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren",
    },
  },
}

// HR specific settings card data
const hrSettingsCards = [
  {
    id: 1,
    title: "Benefit Settings",
    description: "Manage employee benefits, insurance plans, and compensation packages",
    icon: Award,
    href: "/settings/hr/benefitset",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600"
  },
  {
    id: 2,
    title: "Educational Qualification",
    description: "Configure educational qualifications and certification requirements",
    icon: GraduationCap,
    href: "/settings/hr/educationqual",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    iconColor: "text-green-600"
  },
  {
    id: 3,
    title: "Job Grade",
    description: "Set up job grades, levels, and career progression frameworks",
    icon: Building,
    href: "/settings/hr/jobgrade",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600"
  },
  {
    id: 4,
    title: "Position Settings",
    description: "Manage job positions, roles, and organizational structure",
    icon: Users,
    href: "/settings/hr/position",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600"
  },
  {
    id: 5,
    title: "Annual Leave",
    description: "Set up annual leave policies, accruals, and entitlements",
    icon: Calendar,
    href: "/settings/hr/annualleave",
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600"
  },
  {
    id: 6,
    title: "Evaluation Types",
    description: "Configure evaluation types and scoring criteria for recruitment",
    icon: ClipboardList,
    href: "/settings/hr/evaluation-types",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    iconColor: "text-green-600"
  },
  {
    id: 7,
    title: "Evaluation Flows",
    description: "Define evaluation flows and step sequences for the hiring process",
    icon: GitBranch,
    href: "/settings/hr/evaluation-flows",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600"
  },
  {
    id: 8,
    title: "Job Descriptions",
    description: "Create and manage job description templates for open positions",
    icon: FileText,
    href: "/settings/hr/job-descriptions",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    iconColor: "text-green-600"
  },
  {
    id: 9,
    title: "Onboarding Tasks",
    description: "Define onboarding task templates and sequences for new hires",
    icon: ClipboardCheck,
    href: "/settings/hr/onboarding-tasks",
    color: "from-teal-500 to-green-600",
    bgColor: "bg-teal-50",
    iconColor: "text-teal-600"
  }
]

function PageHrSettings() {
  return (
    <>
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col space-y-6 bg-gray-50"
      >
        <SettingsHeader />
        
        <div className="mx-auto w-full">          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hrSettingsCards.map((card, index) => (
              <SettingCard
                key={card.id}
                {...card}
                index={index}
              />
            ))}
          </div>
        </div>
      </motion.section>
    </>
  )
}

export default PageHrSettings