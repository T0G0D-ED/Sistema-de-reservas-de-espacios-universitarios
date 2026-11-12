// Importar mongoose para definir la estructura de los documentos y crear el modelo
import mongoose from 'mongoose';

// Definir el esquema que actua como un molde que valida los datos 
// antes de que se guarden en la coleccion de mongo  
const eventoReservaSchema = new mongoose.Schema({

	// Vinculacion con Postgre guardando el id 
	// index: true acelera las consultas cuando se busquen todos los eventos de una reserva
  reservaId: { 
	  type: Number, 
	  required: true, 
	  index: true }, 
	  
	// Define que ocurrio en el ciclo de vida de la reserva
	// enum para restringir el valor a solo esas 4 palabras  
  tipoEvento: { 
    type: String, 
    enum: ['CREADA', 'APROBADA', 'RECHAZADA', 'CANCELADA'], 
    required: true 
  },
  
  // Identificador id de quien realizo la accion 
  // correo del usuario tambien 
  actorId: { 
  type: Number, 
  required: true }, 
  
  actorEmail: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  
	  // Ventaja de NOSQL con el mixed el cual permite guardar cualquier objeto JSON
	  // con estructura variable 
	  // mixed no se valida, mongoose lo guarda tal cual 
	  // deafult para que siempre exista 
  metadata: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  }
}, {
 
	// Opciones generales del esquema 
  collection: 'eventos_reserva', // Nombre explicito de la colección
  timestamps: true // Agrega createdAt y updatedAt automaticamente
});

// Se compila el esquema en un modelo EventoReserva y se exporta
// Este objeto se usara para ejecutar create y find en el service y repo
export const EventoReserva = mongoose.model('EventoReserva', eventoReservaSchema);