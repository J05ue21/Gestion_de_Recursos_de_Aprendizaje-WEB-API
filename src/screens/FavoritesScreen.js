//import React from 'react';
import React, { useState, useCallback, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';


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
      const favsNuevos = favsGuardados ? JSON.parse(favsGuardados) : [];

      if (favsNuevos.length === 0) {
        setFavoritos([]);
        return;
      }

      // peticion para todos los recursos de la API
      const response = await api.get('/recursos');
      const todosLosRecursos = response.data || [];

      // filtrando para dejar solo los que coincidan con los [id] guardados en laclStorage
      const recursosFavoritos = todosLosRecursos.filter(recurso => 
        favsNuevos.includes(recurso.id)
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

  // se permite eliminar favoritos desde esta pantalla
  const removerFavorito = async (id) => {
    try {
      const favsGuardados = await AsyncStorage.getItem('@mis_favoritos');
      let favsNuevos = favsGuardados ? JSON.parse(favsGuardados) : [];  //JSON.parse() para convertir a Objeto JS
      
      // quitamos el ID seleccionado y asignamos los nuevos favoritos a favsNuevos
      favsNuevos = favsNuevos.filter(favId => favId !== id);
      
      // guardamos la nueva lista en el almacenamiento local
      await AsyncStorage.setItem('@mis_favoritos', JSON.stringify(favsNuevos)); //lo inverso a JSON.parse(), de objeto JS a JSON
      
      // se actualizamos el estado de la pantalla con el favorito quitado de la lista actual
      setFavoritos(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Hubo un error al quitar el favorito:", error);
    }
  };

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