//import React from 'react';
import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, ScrollView, Platform, Alert } from 'react-native';
import { Text, Card, Button, TextInput, RadioButton, ActivityIndicator, IconButton, Portal, Dialog } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

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
                
                left={(props) => {
                  let iconName = "book-open-variant"; // icono predeterminado

                  if(item.tipo?.toLowerCase() === 'video'){
                    iconName = "video";
                  }
                  else if (item.tipo?.toLowerCase() === 'articulo') {
                    iconName = "file-document-outline"  // el icono para un articulo
                  }

                  return (
                    <MaterialCommunityIcons 
                      name={iconName} 
                      size={26} 
                      color="#6200ee" 
                      style={{ marginTop: 10, marginLeft: 5 }}
                    />
                  );
                }}

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

          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No se encontraron recursos disponibles ¡Crea el primero!
            </Text>
          }
        />

        {/* pantalla secundarias para Crear o Editar */}
        <Portal>
          <Dialog visible={visibleDialog} onDismiss={() => setVisibleDialog(false)} style={styles.dialogSize}>
            <Dialog.Title style={styles.dialogTitle}>
              {editandoId ? '✏️ Editar Recurso' : '🚀 Registrar Nuevo Recurso'}
            </Dialog.Title>
            
            <Dialog.ScrollArea style={{ paddingHorizontal: 10 }}>
              <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
                <TextInput
                  label="Título del Recurso *"
                  value={titulo}
                  onChangeText={setTitulo}
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="Reseña o descripción breve *"
                  value={descripcion}
                  onChangeText={setDescripcion}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />

                <TextInput
                  label="URL de la Imagen (opcional)"
                  value={imagen}
                  onChangeText={setImagen}
                  mode="outlined"
                  placeholder="https://.../imagen.jpg"
                  style={styles.input}
                />

                <TextInput
                  label="URL del Recurso Educativo *"
                  value={enlace}
                  onChangeText={setEnlace}
                  mode="outlined"
                  placeholder="https://..."
                  keyboardType="url"
                  autoCapitalize="none"
                  style={styles.input}
                />

                {/* elija el tipo de recurso que está ingresando */}
                <Text style={styles.labelRadio}>
                  Tipo de Formato:
                </Text>
                <RadioButton.Group onValueChange={value => setTipo(value)} value={tipo}>
                  <View style={styles.radioRow}>
                    <View style={styles.radioOption}>
                      <RadioButton value="Libro" />
                      <Text>Libro / PDF</Text>
                    </View>
                    <View style={styles.radioOption}>
                      <RadioButton value="Video" />
                      <Text>Vídeo / Tutorial</Text>
                    </View>
                    <View style={styles.radioOption}>
                      <RadioButton value="Articulo" />
                      <Text>Artículo / Publicación</Text>
                    </View>
                  </View>
                </RadioButton.Group>

              </ScrollView>
            </Dialog.ScrollArea>

            <Dialog.Actions>
              <Button onPress={() => setVisibleDialog(false)} textColor="gray">
                Cancelar
              </Button>
              <Button mode="contained" onPress={handleGuardar} style={{ marginLeft: 10 }}>
                {editandoId ? 'Actualizar' : 'Publicar'}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
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
  addButton: {
    marginVertical: 10,
    backgroundColor: '#6200ee',
    paddingVertical: 4
  },
  listTitle: {
    fontWeight: 'bold',
    color: '#555',
    marginVertical: 10,
    marginLeft: 5
  },
  cardItem: {
    marginBottom: 10,
    backgroundColor: '#fff',
    elevation: 1
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: 'gray'
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff'
  },
  labelRadio: {
    marginTop: 8,
    fontWeight: 'bold',
    color: '#666'
  },
  radioRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',  //los RadioButton se muestran en una sola fila 
                                                              // si es version WEB; si es pantalla Movil,
                                                              // se muestran en columnas (cada uno en su propia fila)
    justifyContent: 'flex-start',
    marginTop: 5,
    marginBottom: 10
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30,
    marginVertical: Platform.OS === 'web' ? 0 : 4 //para darle separacion entre cada RadioButton
  },
  dialogTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#6200ee'
  },
  dialogSize: {
    ...Platform.select({
      web: {
        maxWidth: 550,
        alignSelf: 'center',
        width: '90%'
      }
    })
  }
});

        
      