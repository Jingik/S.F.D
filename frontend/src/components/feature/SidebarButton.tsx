import { useNavigate } from 'react-router-dom';
import styles from '@components/feature/Feature.module.css';

interface PropsType {
  imgName: string;
  name: string;
  isSelected: boolean;
  goto: string;
}

export const SidebarButton = ({
  imgName,
  name,
  isSelected,
  goto,
}: PropsType) => {
  const nav = useNavigate();
  const selectColor = isSelected ? 'bg-[#FFB625] rounded-[10px]' : '';

  function handleClick() {
    if (name === '로그아웃') {
      localStorage.removeItem('token');
    }

    nav(goto);
  }

  return (
    <>
      <button
        className={`${styles.sidebarbutton} ${selectColor}`}
        onClick={handleClick}
      >
        <div className={styles.sidebarLocation}>
          <img
            src={`images/${imgName}`}
            alt="iconImg"
            className="w-[2rem] h-auto m-2 items-center justify-center"
          />
          <p className="flex items-center ml-2">{name}</p>
        </div>
      </button>
    </>
  );
};
