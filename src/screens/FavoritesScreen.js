import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import api from '../services/api';

export default function FavoritesScreen() {
  const { user } = useContext(AuthContext);

  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);

  // cada vez que la pantalla se muestra, se leen los favoritos
  const fetchFavoritos = async () => {
    try {
      setLoading(true);
      
      // obtener la lista de [id] guardados localmente
      const favsGuardados = await AsyncStorage.getItem('@mis_favoritos');
      const idsIds = favsGuardados ? JSON.parse(favsGuardados) : [];

      if (idsIds.length === 0) {
        setFavoritos([]);
        return;
      }

      // peticion para todos los recursos de la API
      const response = await api.get('/recursos');
      const todosLosRecursos = response.data || [];

      // filtrando para dejar solo los que coincidan con los [id] guardados en laclStorage
      const recursosFavoritos = todosLosRecursos.filter(recurso => 
        idsIds.includes(recurso.id)
      );

      setFavoritos(recursosFavoritos);
    } catch (error) {
      console.error("Hubo un problema al cargar favoritos: ", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavoritos();
    }, [])
  );

  //-----------------------------------------------------------------------------------
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