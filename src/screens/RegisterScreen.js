import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, RadioButton } from 'react-native-paper';
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
    <ScrollView contentContainerStyle={styles.container}>
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

        {/* Indicadores visuales de requisitos de contraseña */}
        <HelperText type="info" visible={true} style={styles.helpText}>
            * Mínimo 12 caracteres, incluir mayúscula, minúscula, número y carácter especial (!@#$%^&*).
        </HelperText>

        {/* para seleccionar el rol */}

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
    </ScrollView>
    );
}
  
  const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    justifyContent: 'center',
    flexGrow: 1,
    backgroundColor: '#fff' },

  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#6200ee' },

  input: {
    marginBottom: 10 },

  helpText: {
    marginBottom: 15,
    lineHeight: 16 },

  labelRol: {
    marginTop: 10,
    marginBottom: 5 },

  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20 },

  radioItem: {
    flexDirection: 'row',
    alignItems: 'center' },

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