import axios from 'axios';

// configuración de la instancia central de Axios
const api = axios.create({
  // URL base generada por MockAPI donde se encuentran lo recursos
  baseURL: 'https://6a13dbc76c7db8aac0537076.mockapi.io', 
  timeout: 10000, // antes de mostrar error, se espera 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;