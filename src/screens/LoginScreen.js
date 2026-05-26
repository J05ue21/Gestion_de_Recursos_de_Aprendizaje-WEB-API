import React, { useState, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
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
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Iniciar Sesión</Text>

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
        right={<TextInput.Icon icon={secureText ? "eye" : "eye-off"} onPress={() => setSecureText(!secureText)} />}
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
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center', 
    backgroundColor: '#fff' },

  title: { 
    textAlign: 'center', 
    marginBottom: 25, 
    fontWeight: 'bold', 
    color: '#6200ee' },

  input: { 
    marginBottom: 15 },

  button: { 
    marginTop: 10, 
    marginBottom: 10, 
    paddingVertical: 5 },

  errorText: { 
    color: 'red', 
    textAlign: 'center', 
    marginBottom: 15, 
    fontWeight: 'bold' }
});