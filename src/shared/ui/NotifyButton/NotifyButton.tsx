import notificationIcon from '../../assets/images/notification.svg'
import notificationDot from '../../assets/images/notification-dot.svg'
import './NotifyButton.css'

interface NotifyButtonProps {
  hasNotifications: boolean
  onClick?: () => void
}

export function NotifyButton({ hasNotifications, onClick }: NotifyButtonProps) {
  return (
    <button className="notify-button" type="button" onClick={onClick} aria-label="Уведомления">
      <img src={notificationIcon} alt="" aria-hidden="true" />
      {hasNotifications && (
        <img className="notify-button__dot" src={notificationDot} alt="" aria-hidden="true" />
      )}
    </button>
  )
}
