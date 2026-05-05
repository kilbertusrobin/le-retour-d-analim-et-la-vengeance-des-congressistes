import { createContext, useContext, useEffect, useState } from 'react';


export type ApiHotel = {
  id: number;
  name: string;
  address: string;
  category: string;
  night_price: number;
  breakfast_price: number;
  description?: string;
};

export type ApiHotelBooking = {
  id: number;
  hotel: ApiHotel;
  nights: number;
  breakfast: boolean;
  check_in_date: string | null;
};

export type ApiActivity = {
  id: number;
  label: string;
  date_time: string;
  price: number;
  description?: string;
  category?: string;
  duration?: string;
};

export type ApiSession = {
  id: number;
  label: string;
  start_date: string;
  duration_half_days: number;
  price: number;
  max_attendees?: number;
  attendees?: { id: number }[];
};

export type AuthUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  breakfast: boolean;
  deposit: number;
  roles: string[];
  hotel_bookings: ApiHotelBooking[];
  activity_registration: ApiActivity[];
  session_registration: ApiSession[];
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (jwt: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  loginWithToken: () => {},
  logout: () => {},
  updateUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const fetchMe = async (jwt: string): Promise<AuthUser> => {
    const res = await fetch('http://localhost:8000/api/me', {
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  };

  const login = async (email: string, password: string) => {
    const res = await fetch('http://localhost:8000/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data: { token: string } = await res.json();
    const jwt = data.token;
    localStorage.setItem('token', jwt);
    setToken(jwt);
    const me = await fetchMe(jwt);
    localStorage.setItem('user', JSON.stringify(me));
    setUser(me);
  };

  const loginWithToken = (jwt: string, userData: AuthUser) => {
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = async () => {
    if (!token) return;
    try {
      const me = await fetchMe(token);
      localStorage.setItem('user', JSON.stringify(me));
      setUser(me);
    } catch {
      logout();
    }
  };

  // Revalidate token on mount
  useEffect(() => {
    if (token && !user) {
      fetchMe(token).then(me => {
        localStorage.setItem('user', JSON.stringify(me));
        setUser(me);
      }).catch(logout);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithToken, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
