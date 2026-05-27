import React, { useContext } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../context/AuthContext';

// importando las pantallas
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import AdminScreen from '../screens/AdminScreen';

// para los iconos React native Paper de Vector Icons
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Control del flujo de pantallas luego de iniciar sesion
function HomeTabs() {
    const { user, logout } = useContext(AuthContext); //accion de cerrar sesion global, ahora en cabecera de AppNavigation

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#6200ee',
                tabBarInactiveTintColor: 'gray',
                headerStyle: { backgroundColor: '#6200ee' },
                headerTintColor: '#fff',
                
                // ahora el saludo y boton de cierre de sesion se muestra en la parte superior derecha
                headerRight: () => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
                        <Text style={{ color: '#fff', marginRight: 12, fontSize: 14, fontWeight: '500' }}>
                            Hola, {user?.nombre?.split(' ')[0]} 
                        </Text>
                        <TouchableOpacity onPress={logout} activeOpacity={0.7}>
                            <MaterialCommunityIcons name="logout" color="#fff" size={22} />
                        </TouchableOpacity>
                    </View>
                ),
            }}
        >
           
            {/* esta pantalla será visible para Docente y Estudiante */}
            <Tab.Screen 
                name="Recursos" 
                component={HomeScreen} 
                options={{
                    title: 'Recursos de Aprendizaje',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="book-open-page-variant" color={color} size={size} />
                    ),
                }}
            />

            {/* si es Estudiante, muestra su pantalla con los Favoritos */}
            {user?.rol === 'Estudiante' && (
                <Tab.Screen 
                    name="Favoritos" 
                    component={FavoritesScreen} 
                    options={{
                        title: 'Mis Favoritos',
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="heart" color={color} size={size} />
                        ),
                    }}
                />
            )}

            {/* pero si es Docente, muestra el Panel CRUD de Gestión */}
            {user?.rol === 'Docente' && (
                <Tab.Screen 
                    name="Gestion" 
                    component={AdminScreen} 
                    options={{
                        title: 'Gestionar',
                        tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="database-edit" color={color} size={size} />
                        ),
                    }}
                />
            )}
        </Tab.Navigator>
    );
}

// controlador ppal. que evalua el contexto
export default function AppNavigation() {
  const { user, loading } = useContext(AuthContext);

  // Muestra una animacion tipo Spinner de carga mientras lee el AsyncStorage
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false}}>
        { user == null ? ( //No hay sesión iniciada?, entonces habilita pantallas Login y Registro solamente
            // flujo de Autenticación
            <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
            </>
        ) : (

            //flujo de navegacion con un usuario logueado
            <Stack.Screen name="AppHome" component={HomeTabs} />
        )}
    </Stack.Navigator>
  );
}