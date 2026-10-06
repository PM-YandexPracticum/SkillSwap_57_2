import notificationIcon from '../../assets/images/notification.svg'
import notificationDot from '../../assets/images/notification-dot.svg'
import './NotifyButton.css'

interface NotifyButtonProps {
  hasNotifications: boolean
}

export function NotifyButton({ hasNotifications }: NotifyButtonProps) {
  return (
    <button className="notify-button" type="button">
      <img src={notificationIcon} alt="Уведомления" />

      {hasNotifications && <img className="notify-button__dot" src={notificationDot} alt="" />}
    </button>
  )
}
