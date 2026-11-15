VERIFICAR SERVICIOS: docker compose --env-file backend/.env ps 

API-DOCS SWAGGER: http://localhost:3000/api-docs 

PGADMIN: docker exec -it sistema-de-reservas-de-espacios-universitarios-postgres-1 psql -U admin_user -d reservas_db
\dt                             //Tablas creadas
SELECT * FROM reservas;         //Datos guardados


MONGO COMPASS: docker exec -it sistema-de-reservas-de-espacios-universitarios-mongo-1 mongosh -u mongo_admin -p mongo_pass123  --authenticationDatabase admin 
use auditoria_db                //Seleccionar db
show collections                //Coleccion
db.eventos_reserva.find().pretty()      //Historial eventos
