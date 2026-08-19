import { motion } from 'framer-motion'
import { 
  Target, 
  BarChart3, 
  Building,
  FileText,
  Mail,
  MessageSquare,
  GitBranch,
  Award,
  Ticket
} from 'lucide-react'
import SettingsHeader from '@/modules/settings/components/SettingsHeader'
import SettingCard from '@/modules/settings/components/SettingCard'

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

// CRM specific settings card data - Only required settings
const crmSettingsCards = [
  {
    id: 1,
    title: "Lead Routing",
    description: "Configure automatic lead routing and assignment rules",
    icon: GitBranch,
    href: "/settings/crm/routing-rules",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600"
  },
  {
    id: 2,
    title: "Lead Scoring Rule",
    description: "Set up lead scoring rules and criteria for qualification",
    icon: Award,
    href: "/settings/crm/lead-scoring",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600"
  },
  {
    id: 3,
    title: "Lead Sources",
    description: "Manage and configure lead source options for tracking lead origins",
    icon: Target,
    href: "/settings/crm/lead-sources",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600"
  },
  {
    id: 4,
    title: "Quotation Templates",
    description: "Create and manage quotation templates for sales proposals",
    icon: FileText,
    href: "/settings/crm/quotation-templates",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600"
  },
  {
    id: 5,
    title: "Email Templates",
    description: "Design and manage email templates for campaigns and communication",
    icon: Mail,
    href: "/settings/crm/email-templates",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600"
  },
  {
    id: 6,
    title: "SMS Templates",
    description: "Create and manage SMS templates for quick messaging",
    icon: MessageSquare,
    href: "/settings/crm/sms-templates",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600"
  },
  {
    id: 7,
    title: "Lead Status",
    description: "Configure lead status options and workflow progression stages",
    icon: BarChart3,
    href: "/settings/crm/lead-statuses",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600"
  },
  {
    id: 8,
    title: "Lead Industry",
    description: "Set up industry categories for lead classification",
    icon: Building,
    href: "/settings/crm/industries",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600"
  },
  // {
  //   id: 9,
  //   title: "Ticket Status",
  //   description: "Manage ticket status options for customer support workflow",
  //   icon: Ticket,
  //   href: "/settings/crm/ticket-status",
  //   color: "from-orange-500 to-orange-600",
  //   bgColor: "bg-orange-50",
  //   iconColor: "text-orange-600"
  // }
]

function PageCrmSettings() {
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
            {crmSettingsCards.map((card, index) => (
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

export default PageCrmSettings