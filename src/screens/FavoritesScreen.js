import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';

export default function FavoritesScreen() {
  const { user, logout } = useContext(AuthContext);
  
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Mis Favoritos</Text>
      <Text>Hola, {user?.nombre} ({user?.rol})</Text>
      <Button mode="outlined" onPress={logout} style={{ marginTop: 20 }}>
        Cerrar Sesión
      </Button>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{ 
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center' }
  });