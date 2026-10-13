import { Button } from '@/shared/ui/Button'
import { AuthInfoCard } from '@/shared/ui/Form/AuthInfoCard'
import { CorpsButton } from '@/shared/ui/Form/CorpsButton'
import { Steps } from '@/shared/ui/Form/Steps'
import { Input } from '@/shared/ui/Input'
import { FC } from 'react'
import authIdeaIcon from '@/shared/assets/images/auth-idea.svg'
import { Logo } from '@/shared/ui/logo'

interface StepOneProps {}
export const StepOne: FC<StepOneProps> = () => {
  return (
    <main>
      <header>
        <Logo />
        <Steps currentStep={1}></Steps>
        <Button variant='tertiary'>Закрыть</Button>
      </header>

      <div>
        <section>
          <CorpsButton></CorpsButton>
          <form>
            <Input label="email" type="email" placeholder="Введите email"></Input>
            <Input label="Пароль" type="password" placeholder="Придумайте надёжный пароль"></Input>
            <Button type="submit">Далее</Button>
          </form>
          <p>
            Уже есть аккаунт?<a>Войти</a>
          </p>
        </section>
        <AuthInfoCard
          description="Присоединяйтесь к SkillSwap и обменивайтесь знаниями и навыками с другими людьми"
          title="Добро пожаловать в SkillSwap!"
          illustration={authIdeaIcon}
        ></AuthInfoCard>
      </div>
    </main>
  )
}
