import { useNavigate } from 'react-router-dom';
import styles from '@/pages/Pages.module.css';

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
      className={styles.button}
      style={{ backgroundColor: color }}
    >
      {name}
    </button>
  );
};
