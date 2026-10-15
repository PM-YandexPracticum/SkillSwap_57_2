import type { Skill } from '@/shared/types'
import { SkillDetails } from '@/shared/ui/SkillDetails'
import { useRequireAuth } from '../model/useRequireAuth'

interface AuthenticatedSkillDetailsProps {
  skill: Skill
  onExchange: () => void
}

/** Готовый блок для страницы навыка: гостю не передаём управление обменом. */
export function AuthenticatedSkillDetails({ skill, onExchange }: AuthenticatedSkillDetailsProps) {
  const { requireAuth } = useRequireAuth()

  const handleExchange = () => {
    if (requireAuth()) onExchange()
  }

  return <SkillDetails {...skill} variant="skill" onExchange={handleExchange} />
}
