import React, { useState, useEffect, useCallback, useContext } from 'react';
import { StyleSheet, View, FlatList, Linking } from 'react-native';
import { Text, Card, Button, TextInput, Chip, ActivityIndicator, IconButton, Portal, Dialog, RadioButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext'; // para verificar autenticacion
import api from '../services/api';

export default function HomeScreen() {
  const { user, logout } = useContext(AuthContext); //obtiene el usuario y sus propiedades
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [favoritosIds, setFavoritosIds] = useState([]);

  // estados para modificar la calificación
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [recursoSeleccionado, setRecursoSeleccionado] = useState(null);
  const [nuevaCalificacion, setNuevaCalificacion] = useState(5);

  // obtener y cargar los recursos de MockAPI y los favoritos locales de AsyncStorage
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/recursos');
      setRecursos(response.data || []);

      const favsGuardados = await AsyncStorage.getItem('@mis_favoritos'); // leyendo variable localStorage para favoritos
      if (favsGuardados) {
        setFavoritosIds(JSON.parse(favsGuardados));
      }
    }
    catch (error) {
      console.error("Error, no se pueden obtener los recursos:", error);
    }

    finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // manejo de favoritos localStorage
  const toggleFavorito = async (id) => {
    let listaActualizada = [...favoritosIds];

    if (listaActualizada.includes(id)) {
      listaActualizada = listaActualizada.filter(favId => favId !== id);
    } 
    else {
      listaActualizada.push(id);
    }
    setFavoritosIds(listaActualizada);
    await AsyncStorage.setItem('@mis_favoritos', JSON.stringify(listaActualizada));
  };

  const abrirDialogoCalificar = (recurso) => {
    setRecursoSeleccionado(recurso);
    setNuevaCalificacion(5);
    setVisibleDialog(true);
  };

  // subir calificación y calcular un promedio de la calificacion para actualizar la api (el campo rating)
  const enviarCalificacion = async () => {
    if (!recursoSeleccionado) return;
    setVisibleDialog(false);
    
    try {
      let nuevoRating = parseFloat(nuevaCalificacion);
      if (recursoSeleccionado.rating > 0) {
        nuevoRating = parseFloat(((parseFloat(recursoSeleccionado.rating) + nuevoRating) / 2).toFixed(1));
      }

      await api.put(`/recursos/${recursoSeleccionado.id}`, {
        rating: nuevoRating
      });

      fetchData();
      alert('¡Gracias por tu opinion!');
    } 
    catch (error) {
      console.error("Error en la operacion para calificar:", error);
      alert('Hubo un problema al guardar tu calificación');
    }
  };

  // filtros
  const recursosFiltrados = recursos.filter(item => {
    const cumpleBusqueda = item.titulo?.toLowerCase().includes(search.toLowerCase()) || item.descripcion?.toLowerCase().includes(search.toLowerCase());
    const cumpleFiltro = filtroTipo === 'Todos' || item.tipo?.toLowerCase() === filtroTipo.toLowerCase();
    return cumpleBusqueda && cumpleFiltro;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={{ marginTop: 10 }}>Cargando recursos...</Text>
      </View>
    );
  }

  //------------------------------------------------------------

  return (
    <View style={styles.container}>
      
      
      {/* barra de Búsqueda en tiempo real*/}
      <TextInput
        placeholder="Buscar por título o descripción..."
        value={search}
        onChangeText={setSearch}
        mode="outlined"
        left={<TextInput.Icon icon="magnify" />}
        style={styles.searchBar}
      />

      {/* selector de categorias utilizando 'Chips' de react-native-paper*/}
      <View style={styles.chipContainer}>
        {['Todos', 'Libro', 'Video', 'Artículo', 'Tutorial'].map((tipo) => (
          <Chip
            key={tipo}
            selected={filtroTipo === tipo}
            onPress={() => setFiltroTipo(tipo)}
            style={styles.chip}
            selectedColor="#000000"
            background={filtroTipo === tipo ? { color: '#6700f8' } : undefined}
          >
            {tipo}
          </Chip>
        ))}
      </View>

      {/* listado de Tarjetas */}
      <FlatList
        data={recursosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const esFav = favoritosIds.includes(item.id);
          return (
            <Card style={styles.card}>
              <Card.Cover source={{ uri: item.imagen || 'https://via.placeholder.com/150' }} />
              
              <Card.Content style={styles.cardContent}>
                <View style={styles.rowJustified}>
                  <Text variant="titleMedium" style={styles.cardTitle}>{item.titulo}</Text>
                  <Chip compact style={styles.typeChip}>{item.tipo}</Chip>
                </View>
                <Text variant="bodyMedium" style={styles.description}>{item.descripcion}</Text>
                
                <View style={styles.ratingRow}>
                  <IconButton icon="star" iconColor="#f1c40f" size={20} style={{ margin: 0 }} />
                  <Text style={styles.ratingText}>
                    {item.rating == 0 ? 'Sin calificaciones' : `${item.rating} / 5.0`}
                  </Text>
                </View>
              </Card.Content>

              <Card.Actions>
                <IconButton
                  icon={esFav ? "heart" : "heart-outline"}
                  iconColor={esFav ? "red" : "gray"}
                  size={24}
                  onPress={() => toggleFavorito(item.id)}
                />
                <Button mode="outlined" onPress={() => abrirDialogoCalificar(item)}>
                  Calificar
                </Button>
                <Button mode="contained" onPress={() => Linking.openURL(item.enlace)}>
                  Ver Recurso
                </Button>
              </Card.Actions>
            </Card>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron recursos disponibles.</Text>
        }
      />

      {/* cuadro de dialogo para Ratings */}
      <Portal>
        <Dialog visible={visibleDialog} onDismiss={() => setVisibleDialog(false)}>
          <Dialog.Title>Calificar Recurso</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
              ¿Qué puntuación le otorgas a: "{recursoSeleccionado?.titulo}"?
            </Text>
            <RadioButton.Group onValueChange={value => setNuevaCalificacion(value)} value={nuevaCalificacion}>
              {[1, 2, 3, 4, 5].map((estrella) => (
                <View key={estrella} style={styles.dialogRadioItem}>
                  <RadioButton value={estrella} />
                  <Text>{estrella} {estrella === 1 ? 'Estreha' : 'Estrellas'}</Text>
                </View>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisibleDialog(false)}>Cancelar</Button>
            <Button mode="contained" onPress={enviarCalificacion}>Guardar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 5 },
  welcomeText: { fontWeight: 'bold', color: '#6200ee' },
  logoutButton: { margin: 0 },
  searchBar: { marginBottom: 10, backgroundColor: '#fff' },
  chipContainer: { flexDirection: 'row', marginBottom: 15 },
  chip: { marginRight: 8 },
  card: { marginBottom: 15, backgroundColor: '#fff', elevation: 2 },
  cardContent: { marginTop: 10 },
  rowJustified: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' },
  cardTitle: { fontWeight: 'bold', maxWidth: '70%' },
  typeChip: { backgroundColor: '#e1d5f9' },
  description: { color: '#555', marginTop: 5 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  ratingText: { marginLeft: 5, fontWeight: 'bold', color: '#666' },
  emptyText: { textAlign: 'center', marginTop: 30, color: 'gray' },
  dialogRadioItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 }
});