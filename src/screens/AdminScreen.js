import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api'

export default function AdminScreen() {
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);  

  // estados para el Formulario (Crear / Editar)
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // null para Crear; si hay ID, entoncer es Editar

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');
  const [tipo, setTipo] = useState('Libro');
  const [enlace, setEnlace] = useState('');

  // se cargan los recursos de la API
    const fetchRecursos = async () => {
      try {
        setLoading(true);
        const response = await api.get('/recursos');
        setRecursos(response.data || []);
      } 
      catch (error) {
        console.error("Hubo un error al cargar recursos en AdminScreen:", error);
      }
      finally {
        setLoading(false);
      }
    };

    useFocusEffect(
        useCallback(() => {
          fetchRecursos();
        }, [])
      );
      
  //--------------------------------------------------------------
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Administrar Recursos</Text>
      <Text>Hola, {user?.nombre} ({user?.rol})</Text>
      <Button mode="outlined" onPress={logout} style={{ marginTop: 20 }}>
        Cerrar Sesión
      </Button>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center' }
});