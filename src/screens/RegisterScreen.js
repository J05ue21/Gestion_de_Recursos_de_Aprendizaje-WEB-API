import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, RadioButton } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import api from '../services/api';

export default function RegisterScreen({ navigation }) {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('Estudiante'); // rol predeterminado

    const [secureText, setSecureText] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorGeneral, setErrorGeneral] = useState('');

    /** REgex para validar contraseña
     * Mínimo 12 caracteres.
     * Al menos una letra mayúscula.
     * Al menos una letra minúscula.
     * Al menos un número.
     * Al menos un carácter especial ( !@#$%^&* ) 
     **/
    const validarContrasena = (pass) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{12,}$/;
        //const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[A-Za-z\d!@#\$%\^&\*]{12,}$/;
        return regex.test(pass);
    };

    const handleRegister = async () => {
        setErrorGeneral('');

        //validacion de campos vacios
        if (!nombre.trim() || !email.trim() || !password.trim()) {
            setErrorGeneral('Por favor, complete todos los campos');
            return;
        }

        //validacion de la contraseña
        if (!validarContrasena(password)) {
            setErrorGeneral('La contraseña debe tener al menos 12 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial');
            return;
        }

        setLoading(true);
        try {
            //recuperando lista de usuarios de MockAPI
            const response = await api.get('/usuarios');
            const listaUsuarios = response.data || [];
            
            //verificar si el email ya existe
            const correoExiste = listaUsuarios.some((user) => user.email?.toLowerCase() === email.toLowerCase().trim()
            );

            if(correoExiste) {
                setErrorGeneral('El correo electronico ingresado ya está registrado');
                setLoading(false);
                return;
            }
            
            //guarda el nuevo usuario en MockAPI
            await api.post('/usuarios', {
                nombre: nombre.trim(),
                email: email.toLowerCase().trim(),
                password: password,
                rol: rol,
            });

            alert('¡Usuario registrado con éxito! Ahora puedes iniciar sesión.');
            navigation.navigate('Login');

        } catch (error) {
            console.error("Detalle del error en el registro:", error.response?.data || error.message);
            setErrorGeneral('Hubo un error al conectar con el servidor. Inténtalo más tarde.');
        } finally {
            setLoading(false);
        }
  };

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
                        Crear Cuenta
                    </Text>

                    {errorGeneral ? <Text style={styles.errorText}>{errorGeneral}</Text> : null}

                    <TextInput
                        label="Nombre Completo"
                        value={nombre}
                        onChangeText={setNombre}
                        mode="outlined"
                        style={styles.input}
                    />

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

                    <HelperText type="info" visible={true} style={styles.helpText}>
                        * Mínimo 12 caracteres, incluir mayúscula, minúscula, número y carácter especial (!@#$%^&*).
                    </HelperText>

                    <Text variant="titleMedium" style={styles.labelRol}>Selecciona tu Rol:</Text>
                    <RadioButton.Group onValueChange={value => setRol(value)} value={rol}>
                        <View style={styles.radioContainer}>
                            <View style={styles.radioItem}>
                                <RadioButton value="Estudiante" />
                                <Text>Estudiante</Text>
                            </View>
                            <View style={styles.radioItem}>
                                <RadioButton value="Docente" />
                                <Text>Docente</Text>
                            </View>
                        </View>
                    </RadioButton.Group>

                    <Button 
                        mode="contained" 
                        onPress={handleRegister} 
                        loading={loading} 
                        disabled={loading}
                        style={styles.button}
                    >
                        Registrarse
                    </Button>

                    <Button mode="text" onPress={() => navigation.navigate('Login')}>
                        ¿Ya tienes cuenta? Inicia Sesión
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
    padding: 24, 
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    backgroundColor: '#fff',
  },
    // Contenedor dinamico: en Web usa filas y en móvil se apila en columnas
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
  // manejo del espacio del logo
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        flex: 1,
        marginRight: 50,    //separacion respoecto al formulario
        marginBottom: 0,
      },
      default: {
        marginBottom: 20,
        marginTop: Platform.OS === 'ios' ? 0 : 20,
      }
    })
  },
  // seccion del formulario
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
    textAlign: Platform.OS === 'web' ? 'left' : 'center', // Alineado a la izquierda en Web
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  input: {
    marginBottom: 10 
  },
  helpText: {
    marginBottom: 10,
    lineHeight: 14 
  },
  labelRol: {
    marginTop: 5,
    marginBottom: 5,
    fontWeight: '600'
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20 
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center' 
  },
  button: {
    marginTop: 5,
    marginBottom: 5,
    paddingVertical: 3 
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold' 
  }
});