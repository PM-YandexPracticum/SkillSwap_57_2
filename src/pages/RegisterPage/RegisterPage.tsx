import { FC, useEffect, useState } from 'react'
import styles from './RegisterPage.module.css'
import { initialStepTwoValue, StepTwo, StepTwoValue } from './ui/StepTwo'
import { City } from '@/shared/types'
import { fetchCities } from '@/api/cities'
import authIdea from '@/shared/assets/images/auth-idea.svg'
import authPresentation from '@/shared/assets/images/auth-presentation.svg'
import authProfile from '@/shared/assets/images/auth-profile.svg'
import { AuthInfoCard } from '@/shared/ui/Form/AuthInfoCard'
import { Steps } from '@/shared/ui/Form/Steps'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loadCities } from '@/entities/city/model/citiesSlice'

type StepIndex = 1 | 2 | 3

export const RegisterPage: FC = () => {
  const [currentStep, setCurrentStep] = useState<StepIndex>(2)
  // 1 шаг
  // const [stepOneValue, setstepOneValue] = useState<StepOneValue>(initialStepOneValue)

  // 2 шаг
  const [stepTwoValue, setstepTwoValue] = useState<StepTwoValue>(initialStepTwoValue)

  // 3 шаг
  // const [stepThreeValue, setstepThreeValue] = useState<StepThreeValue>(initialstepThreeValue)

  const dispatch = useAppDispatch()

  const cities = useAppSelector((state) => state.cities.items)

  useEffect(() => {
    dispatch(loadCities())
  }, [])

  // const handleStepOneContinue = (value:StepOneValue) => {
  //   setstepOneValue(value);
  //   setCurrentStep(2)
  // }
  const handleStepTwoContinue = (value: StepTwoValue) => {
    setstepTwoValue(value)
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
            title: 'Расскажите о себе',
            description:
              'Заполните информацию о себе, чтобы другие участники могли узнать вас лучше',
            illustration: authPresentation,
          }
        : {
            title: 'Последний шаг',
            description: 'Завершите заполнение данных для регистрации в SkillSwap',
            illustration: authProfile,
          }

  return (
    <main className={styles.registerPage}>
      <div className={styles.steps}>
        <Steps currentStep={currentStep}></Steps>
      </div>
      <div className={styles.content}>
        {currentStep === 1 && (
          // <StepOne></StepOne>
          <p>Шаг 1</p>
        )}
        {currentStep === 2 && (
          <StepTwo
            value={stepTwoValue}
            cities={cities}
            onChange={setstepTwoValue}
            onBack={handleStepBack}
            onContinue={handleStepTwoContinue}
          ></StepTwo>
        )}
        <AuthInfoCard
          title={cardInfo.title}
          description={cardInfo.description}
          illustration={cardInfo.illustration}
        />
      </div>
    </main>
  )
}
