//import React from 'react';
import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, ScrollView, Platform, Alert } from 'react-native';
import { Text, Card, Button, TextInput, RadioButton, ActivityIndicator, IconButton, Portal, Dialog } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api'
import { styles } from '../../../../../Downloads/gemini-code-1779918107706';

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

    // mostrar un formulario en blanco para agregar Nuevo o 
    // mostrarlo con campos completados para Editarlo 
    const abrirFormulario = (recurso = null) => {
      if (recurso) {
        setEditandoId(recurso.id);
        setTitulo(recurso.titulo || '');
        setDescripcion(recurso.descripcion || '');
        setImagen(recurso.imagen || '');
        setTipo(recurso.tipo || 'Libro');
        setEnlace(recurso.enlace || '');
      }
      else {
        setEditandoId(null);
        setTitulo('');
        setDescripcion('');
        setImagen('');
        setTipo('Libro');
        setEnlace('');
      }
      setVisibleDialog(true);
    };

    //para Guardar --POST o PUT
    const handleGuardar = async () => {
      // si algún campo o todos están vacios, se alerta según Plataforma (alert->Web // Alert.alert->Movil)
      if (!titulo.trim() || !descripcion.trim() || !enlace.trim()) {
        if (Platform.OS === 'web') {
          alert("Por favor completa los campos obligatorios (Título, Descripción y Enlace)");
        } 
        else {
          Alert.alert("Campos incompletos", "Por favor completa los campos obligatorios.");
        }
        return;
      }

      //si no inserta una imagen de referencia, se deja una por defecto
      const urlImagen = imagen.trim() ? imagen : 'https://png.pngtree.com/png-vector/20241225/ourmid/pngtree-smart-education-apps-for-seamless-virtual-learning-png-image_14889552.png';

      const datosRecurso = {
      titulo,
      descripcion,
      imagen: urlImagen,
      tipo,
      enlace,
      // como es Nuevo, se agrega el campo rating y se inicializa en 0, pero si Editar, no se modifica su valor
      ...(editandoId ? {} : { rating: 0 }) 
    };

    try {
          if (editandoId) {
            // Si estamos editando, entonces -> PUT{id}
            await api.put(`/recursos/${editandoId}`, datosRecurso);
          } 
          else {
            // de lo contrario, estamos Creando -> POST
            await api.post('/recursos', datosRecurso);
          }
          setVisibleDialog(false);
          fetchRecursos(); // obtiene nuevamente los recusrsos para mantenerlos listos y mostrarlos
        } catch (error) {
          console.error("Error al guardar el recurso:", error);
        }
      };

      //Eliminando un recurso
      const handleEliminar = async (id, tituloRecurso) => {
        const borrarElemento = async () => {
          try {
            await api.delete(`/recursos/${id}`);
            fetchRecursos();  // funcion para refrescar listado de API
          } 
          catch (error) {
            console.error("Error al Eliminar recurso:", error);
          }
        };

        //alerta segun plataforma
        if (Platform.OS === 'web') {
          if (window.confirm(`¿Estás seguro de que deseas eliminar el recurso: "${tituloRecurso}"?`)) {
            borrarElemento();
          }
        } 
        else {
          Alert.alert(
            "Eliminar Recurso",
            `¿Estás seguro de eliminar "${tituloRecurso}"?`,
            [
              { text: "Cancelar", style: "cancel" }, //boton cancel no ejecuta nada
              { text: "Eliminar", style: "destructive", onPress: borrarElemento }
            ]
          );
        }
      };

      //mientras carga...
      if (loading) {
        return (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text style={{ marginTop: 10 }}>Cargando panel de gestión...</Text>
          </View>
        );
      }

  //--------------------------------------------------------------
  
  return (
    <View style={styles.mainWrapper}>
      <View style={styles.container}>
        
        {/* boton para Añadir */}
        <Button 
          mode="contained" 
          icon="plus" 
          onPress={() => abrirFormulario()} 
          style={styles.addButton}
        >
          Nuevo Recurso Educativo
        </Button>
        
        <Text variant="titleMedium" style={styles.listTitle}>
          Lista de Recursos Didácticos
        </Text>

        {/* lista sencilla con botones para Edicion y Borrado */}
        <FlatList
          data={recursos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <Card style={styles.cardItem}>
              <Card.Title
                title={item.titulo}
                subtitle={`Tipo: ${item.tipo} | Rating actual: ⭐ ${item.rating == 0 ? 'N/A' : item.rating}`}
                
                left={(props) => (
                  <MaterialCommunityIcons 
                    name={item.tipo?.toLowerCase() === 'video' ? "video" : "book-open-variant"} 
                    size={26} 
                    color="#6200ee" 
                    style={{ marginTop: 10, marginLeft: 5 }}
                  />
                )}

                right={(props) => (
                  <View style={styles.actionRow}>
                    <IconButton
                      icon="pencil"
                      iconColor="#3498db"
                      size={22}
                      onPress={() => abrirFormulario(item)}
                    />
                    <IconButton
                      icon="delete"
                      iconColor="#e74c3c"
                      size={22}
                      onPress={() => handleEliminar(item.id, item.titulo)}
                    />
                  </View>
                )}
              />
            </Card> 
          )}
        />
      </View>
    </View>
  );

        
      