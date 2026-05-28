import React, { useState, useContext } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    try {
          //recuperando lista de usuarios de MockAPI
          const response = await api.get('/usuarios');
          const listaUsuarios = response.data || [];
          
          // verificar si el email ya existe
          const usuarioEncontrado = listaUsuarios.find((usuario) => usuario.email?.toLowerCase() === email.toLowerCase().trim()
          );

          // existe el usuario y que coincida la contraseña?
          if (usuarioEncontrado && usuarioEncontrado.password === password) {
              
            // Si todo coincide, iniciamos sesión en el contexto global
              await login(usuarioEncontrado);

          } else {
              // mensaje si falló el correo o la contraseña)
              setError('Credenciales incorrectas');
          }
            
    } catch (err) {
      console.error(err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };  //fin handleLogin----------------------------------

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
    >
        <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            {/* contenedor principal Adaptativo */}
            <View style={styles.mainLayout}>
                
                {/* el Logo en la columna izquierda en Web, en movil se muestra arriba */}
                <View style={styles.logoSection}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="school" size={65} color="#6200ee" />
                    </View>
                    <Text variant="titleLarge" style={styles.logoText}>RECURSOS EDUCATIVOS</Text>
                </View>

                {/* el Formulario en la columna derecha en Web, en movil se muestra abajo */}
                <View style={styles.formSection}>
                    <Text variant="headlineMedium" style={styles.title}>
                        Iniciar Sesión
                    </Text>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TextInput
                        label="Correo Electrónico"
                        value={email}
                        onChangeText={setEmail}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                    />

                    <TextInput
                        label="Contraseña"
                        value={password}
                        onChangeText={setPassword}
                        mode="outlined"
                        secureTextEntry={secureText}
                        right={
                          <TextInput.Icon 
                            icon={secureText ? "eye" : "eye-off"} 
                            onPress={() => setSecureText(!secureText)} 
                          />
                        }
                        style={styles.input}
                    />

                    <Button 
                        mode="contained" 
                        onPress={handleLogin} 
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                    >
                        Ingresar
                    </Button>

                    <Button mode="text" onPress={() => navigation.navigate('Register')}>
                        ¿No tienes cuenta? Regístrate aquí
                    </Button>
                </View>

            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  container: { 
    flexGrow: 1, 
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center', 
    backgroundColor: '#fff' 
  },

  mainLayout: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...Platform.select({
      web: {
        maxWidth: 850,
        paddingVertical: 10,
      }
    })
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        flex: 1,
        marginRight: 50, 
        marginBottom: 0,
      },
      default: {
        marginBottom: 25,
        marginTop: Platform.OS === 'ios' ? 0 : 20,
      }
    })
  },
  formSection: {
    width: '100%',
    ...Platform.select({
      web: {
        flex: 1.2, 
      }
    })
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3e8ff', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoText: {
    fontWeight: 'bold',
    color: '#6200ee',
    letterSpacing: 1.5,
    textAlign: 'center'
  },
  title: {
    textAlign: Platform.OS === 'web' ? 'left' : 'center',
    marginBottom: 25,
    fontWeight: 'bold',
    color: '#333'
  },
  input: {
    marginBottom: 12 
  },
  button: {
    marginTop: 10,
    marginBottom: 5,
    paddingVertical: 4 
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold' 
  }
});