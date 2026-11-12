import jwt from 'jsonwebtoken';

//next como boton de paso adelante para la sgte funcion 
export const authMiddleware = (req, res, next) => {
  // 1. Obtener el token del header
  // Busca la credencial en los encabezados de la peticion
  // Por estandar web, el frontend envia el token en un header Authorization
  const authHeader = req.headers['authorization'];
  
  // 2. Limpiar el texto del token 
  // El header llega en formato Bearer TOKEN
  // Con split se corta por el espacio y queda solo el token 
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

	// 3. Si no viene ningun header o no hay token, se corta el paso 
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  // 4. Verificar que el token sea autentico y no este vencido 
  try {
	  // jwt.verify revisa si el token esta firmado con la clave secreta del env y que siga vigente
	  // Si sale bien, devuelve los datos que se guardaron dentro del token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    //5. Guardar datos del usuario dentro de la peticion req
    // ahora cualquier ruta que venga despues sabra que usario esta reservando
    req.usuario = decoded; 
    
    // 6. llamar a next para que la peticion continue hacia la ruta que se solicito
    next();
  } catch (error) {
	  // si se inventa el token, se modifica o ya paso el tiempo valido, cae aqui
    res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};