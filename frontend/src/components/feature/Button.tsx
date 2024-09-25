import { useNavigate } from 'react-router-dom';
import styles from '@components/feature/Button.module.css';

interface PropsType {
  name: string;
  color: string;
  path?: string;
}

export const Button = ({ name, color, path }: PropsType) => {
  const nav = useNavigate();

  return (
    <button
      onClick={() => path !== null && nav(path!)}
      className={`${styles.button} ${styles.text}`}
      style={{ backgroundColor: color }}
    >
      {name}
    </button>
  );
};
