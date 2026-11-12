// Importar moongose para definir esquemas y modelos 
import mongoose from 'mongoose';

// Funcion para establecer la conexion con mongo 
// Se exporta para poder ser llamada desde index.js al iniciar el servidor
export const connectMongo = async () => {
  try {
	  // mongoose.connect intenta establecer la conexion con la URI del env
    // await para pausar la funcion hasta que se confirme los datos validos
    await mongoose.connect(process.env.MONGO_URI);
    // Si la promesa se resuelve sin errores se confirma conexion
    console.log('Conectado a MongoDB');
    // Si hay problema se captura error y se muestra
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
		// No se hace process.exit(1) para no tumbar el servidor entero   
	  // si Mongo falla temporalmente: Postgre seguira funcionando 
  }
};