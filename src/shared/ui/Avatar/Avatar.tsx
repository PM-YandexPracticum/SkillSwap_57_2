import  styles  from './Avatar.module.scss'

type avatarSize = 'small' | 'middle' | 'big';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: avatarSize;
}

export function Avatar({
  src,
  alt = 'Аватар пользователя',
  size = 'middle',
}: AvatarProps) {
  return (
    <div className={`${styles.avatar} ${styles[size]}`}>
      {src ? (
        <img
          className={styles.image}
          src={src}
          alt={alt}
        />): 
        (
        <div className={styles.placeholder} />
      )}
    </div>
  );
}