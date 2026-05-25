import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

//se comprueba si ya hay una sesion iniciada al abrir la app (persistente)
useEffect(() => {
  const checkLoginStatus = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('@user_session');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }catch (error) {
      console.error('Error al cargar la sesion local:', error);
    } finally {
      setLoading(false);
    }
  };

  checkLoginStatus();
}, []);

// funcion para inicio de sesion 
const login = async (userData) => {
    serUser(userData);
    await AsyncStorage.setItem('@user_session', JSON.stringify(userData));
};


//funcion para cerrar sesion
const logout = async () => {
  setUser(null);
  await AsyncStorage.removeItem('@user_session');
};

return (
    <AuthContext.Provider value={{ user, loading, login ,logout}}>
      {children}
    </AuthContext.Provider>
  );
};