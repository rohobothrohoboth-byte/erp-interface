import { motion } from 'framer-motion'
import { ClipboardList, GitBranch, ClipboardCheck, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SettingCard from '@/modules/settings/components/SettingCard'
import { Button } from '@/shared/components/ui/button'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, when: 'beforeChildren' },
  },
}

const recruitmentCards = [
  {
    id: 1,
    title: 'Evaluation Types',
    description: 'Configure evaluation types and scoring criteria for recruitment',
    icon: ClipboardList,
    href: '/settings/hr/evaluation-types',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    id: 2,
    title: 'Evaluation Flows',
    description: 'Define evaluation flows and step sequences for the hiring process',
    icon: GitBranch,
    href: '/settings/hr/evaluation-flows',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: 3,
    title: 'Onboarding Tasks',
    description: 'Define onboarding task templates and sequences for new hires',
    icon: ClipboardCheck,
    href: '/settings/hr/onboarding-tasks',
    color: 'from-teal-500 to-green-600',
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
]

function PageHrRecruitmentSettings() {
  const navigate = useNavigate()

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col space-y-6 bg-gray-50"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Recruitment Settings
            </span>
          </h1>
        </div>
      </div>

      <div className="mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recruitmentCards.map((card, index) => (
            <SettingCard key={card.id} {...card} index={index} />
          ))}
        </div>
      </div>
    </motion.section>
  )
}

export default PageHrRecruitmentSettings
