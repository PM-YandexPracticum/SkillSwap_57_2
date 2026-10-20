import { FC, useEffect, useState } from 'react'
import styles from './RegisterPage.module.css'
import { initialStepTwoValue, StepTwo, StepTwoValue } from './ui/StepTwo'
import authIdea from '@/shared/assets/images/auth-idea.svg'
import authPresentation from '@/shared/assets/images/auth-presentation.svg'
import authProfile from '@/shared/assets/images/auth-profile.svg'
import { AuthInfoCard } from '@/shared/ui/Form/AuthInfoCard'
import { Steps } from '@/shared/ui/Form/Steps'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loadCities } from '@/entities/city/model/citiesSlice'
import { initialStepOneValue, StepOne, StepOneValue } from './ui/StepOne'
import { initialStepThreeValue, StepThree, StepThreeValue } from './ui/StepThree'
import { Logo } from '@/shared/ui/logo'
import { Button } from '@/shared/ui/Button'
import crossIcon from '@/shared/assets/images/cross.svg'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/lib/constants'
import { RegistrationCompletion } from './ui/RegistrationCompletion'
import { skills } from '@/shared/ui/SkillCategoryGroupList/model/SkillGroupList'

type StepIndex = 1 | 2 | 3

export const RegisterPage: FC = () => {
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState<StepIndex>(1)
  // 1 шаг
  const [stepOneValue, setStepOneValue] = useState<StepOneValue>(initialStepOneValue)

  // 2 шаг
  const [stepTwoValue, setStepTwoValue] = useState<StepTwoValue>(initialStepTwoValue)

  // 3 шаг
  const [stepThreeValue, setStepThreeValue] = useState<StepThreeValue>(initialStepThreeValue)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const dispatch = useAppDispatch()

  const cities = useAppSelector((state) => state.cities.items)

  useEffect(() => {
    dispatch(loadCities())
  }, [dispatch])

  const handleStepOneContinue = (value: StepOneValue) => {
    setStepOneValue(value)
    setCurrentStep(2)
  }
  const handleStepTwoContinue = (value: StepTwoValue) => {
    setStepTwoValue(value)
    setCurrentStep(3)
  }

  const handleStepThreeContinue = (value: StepThreeValue) => {
    setStepThreeValue(value)
    setIsModalOpen(true)
  }

  const handleEdit = () => {
    setIsModalOpen(false)
    setCurrentStep(3)
  }

  const handleStepBack = () => {
    setCurrentStep((prevStep) => (prevStep - 1) as StepIndex)
  }

  const cardInfo =
    currentStep === 1
      ? {
          title: 'Добро пожаловать в SkillSwap!',
          description:
            'Присоединяйтесь к SkillSwap и обменивайтесь знаниями и навыками с другими людьми',
          illustration: authIdea,
        }
      : currentStep === 2
        ? {
            title: 'Расскажите немного о себе',
            description: 'Это поможет другим людям лучше вас узнать, чтобы выбрать для обмена',
            illustration: authProfile,
          }
        : {
            title: 'Укажите, чем вы готовы поделиться',
            description: 'Так другие люди смогут увидеть ваши предложения и предложить вам обмен!',
            illustration: authPresentation,
          }

  const selectedCategory = skills.find((s) => s.id === stepThreeValue.offer.categoryId)

  return (
    <>
      <header className={styles.header}>
        <Logo />
        <Link className={styles.closeButton} to={ROUTES.HOME}>
          <Button variant="tertiary" className={styles.crossButton}>
            Закрыть <img src={crossIcon} alt="Закрыть"></img>
          </Button>
        </Link>
      </header>
      <main className={styles.registerPage}>
        <div className={styles.steps}>
          <Steps currentStep={currentStep} />
        </div>
        <div className={styles.content}>
          {currentStep === 1 && (
            <StepOne
              value={stepOneValue}
              onChange={setStepOneValue}
              onContinue={handleStepOneContinue}
            />
          )}
          {currentStep === 2 && (
            <StepTwo
              value={stepTwoValue}
              cities={cities}
              onChange={setStepTwoValue}
              onBack={handleStepBack}
              onContinue={handleStepTwoContinue}
            ></StepTwo>
          )}
          {currentStep === 3 && (
            <StepThree
              value={stepThreeValue}
              onChange={setStepThreeValue}
              onBack={handleStepBack}
              onContinue={handleStepThreeContinue}
            ></StepThree>
          )}
          <AuthInfoCard
            title={cardInfo.title}
            description={cardInfo.description}
            illustration={cardInfo.illustration}
          />
        </div>
      </main>
      {isModalOpen && (
        <RegistrationCompletion
          data={{
            ...stepOneValue,
            profile: {
              ...stepTwoValue,
              learningSubcategoryIds: stepTwoValue.likes.subcategoryIds,
            },
            offer: {
              ...stepThreeValue,
              category: selectedCategory!.title,
              subcategory: selectedCategory!.skills.find(
                (s) => s.id === stepThreeValue.offer.subcategoryId,
              )!.title,
            },
          }}
          onEdit={handleEdit}
          onFinished={() => {
            setIsModalOpen(false)
            navigate(ROUTES.HOME)
          }}
        />
      )}
    </>
  )
}
