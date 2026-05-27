//import React from 'react';
import React, { useState, useCallback, useContext } from 'react';
import { StyleSheet, View, FlatList, Linking, Platform } from 'react-native';
import { Text, Card, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
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

  if (loading) {  //indicador de espera mientras carga
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={{ marginTop: 10 }}>Cargando tus favoritos...</Text>
        </View>
      );
    }

  //-----------------------------------------------------------------------------------
  return (
      <View style={styles.mainWrapper}>
        <View style={styles.container}>
          
          <Text variant="headlineSmall" style={styles.titlePage}>
            ⭐ Mis Favoritos guardados
          </Text>
  
          <FlatList
            data={favoritos}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <Card.Cover source={{ uri: item.imagen || 'https://cdni.iconscout.com/illustration/premium/thumb/error-de-carga-illustration-svg-download-png-8257063.png' }} />
                
                <Card.Content style={styles.cardContent}>
                  <View style={styles.rowJustified}>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      {item.titulo}
                    </Text>
                  
                    <Text style={styles.ratingText}>⭐
                      {item.rating == 0 ? 'N/A' : item.rating}
                    </Text>
                  </View>
                  <Text variant="bodyMedium" style={styles.description}>{item.descripcion}</Text>
                </Card.Content>
  
                <Card.Actions>
                  {/* boton para funcion de quitar de favoritos */}
                  <IconButton
                    icon="heart"
                    iconColor="red"
                    size={24}
                    onPress={() => removerFavorito(item.id)}
                  />
  
                  <Button mode="contained" onPress={() => Linking.openURL(item.enlace)}>
                    Ver Recurso
                  </Button>
                </Card.Actions>
              </Card>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aún no has agregado favoritos</Text>
              </View>
            }
          />
        </View>
      </View>
    );
  }

const styles = StyleSheet.create({
  mainWrapper: { 
    flex: 1, 
    backgroundColor: '#eaeaea' 
  },
  container: { 
    flex: 1, 
    padding: 15, 
    backgroundColor: '#f5f5f5',
    ...Platform.select({
      web: {
        maxWidth: 750,
        width: '100%',
        alignSelf: 'center',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
      }
    })
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titlePage: {
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 15,
    textAlign: 'center'
  },
  card: { marginBottom: 15, backgroundColor: '#fff', elevation: 2 },
  cardContent: { marginTop: 10 },
  rowJustified: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontWeight: 'bold', maxWidth: '80%' },
  ratingText: { fontWeight: 'bold', color: '#666' },
  description: { color: '#555', marginTop: 5 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { textAlign: 'center', color: 'gray', fontSize: 15 }
});