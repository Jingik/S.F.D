import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';

interface User {
  nickname: string;
  email: string;
  phoneNumber: string;
  name: string;
}

interface UserContextProps {
  user: User;
  setUser: (user: User) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser는 UserProvider 하위에서 쓰여야합니다.');
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser
      ? JSON.parse(storedUser)
      : { nickname: '', email: '', phoneNumber: '', name: '' };
  });

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const clearUser = () => {
    setUser({
      nickname: '',
      email: '',
      phoneNumber: '',
      name: '',
    });
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};
