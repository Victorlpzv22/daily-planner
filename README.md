# Daily Planner 📅

Aplicación de agenda digital con arquitectura cliente-servidor para gestionar tareas diarias y semanales.

## 📋 Descripción

Daily Planner es una aplicación completa que permite organizar y gestionar tareas con las siguientes características:

- ✅ Crear, editar y eliminar tareas
- 📅 Organización por fechas y horarios
- 🎯 Sistema de prioridades (alta, media, baja)
- 📊 Tareas diarias y semanales
- ✔️ Marcar tareas como completadas
- 🔄 Sincronización en tiempo real con base de datos

## 🏗️ Arquitectura

```
┌─────────────┐          HTTP/REST API          ┌──────────────┐
│   Cliente   │ ◄──────────────────────────────► │   Servidor   │
│  (Frontend) │         JSON requests            │   (Backend)  │
└─────────────┘                                  └───────┬──────┘
                                                         │
                                                         │ SQL
                                                         ▼
                                                  ┌──────────────┐
                                                  │  PostgreSQL  │
                                                  │   (Docker)   │
                                                  └──────────────┘
```

### Tecnologías Utilizadas

**Backend:**
- Python 3.13
- Flask 3.0.0 (Framework web)
- SQLAlchemy (ORM)
- PostgreSQL 15 (Base de datos)
- Docker (Contenedorización)

**Frontend:** (En desarrollo)
- Por definir

## 🚀 Inicio Rápido

### Prerrequisitos

- Python 3.8 o superior
- Docker y Docker Compose
- Git

### Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/tu-usuario/daily-planner.git
cd daily-planner
```

2. **Configurar el backend:**
```bash
cd server
python -m venv venv
source venv/bin/activate  # En Linux/Mac
# venv\Scripts\activate   # En Windows
pip install -r requirements.txt
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env.development
# Editar .env.development si es necesario
```

4. **Levantar la base de datos:**
```bash
docker-compose up -d
```

5. **Ejecutar el servidor:**
```bash
python src/app.py
```

El servidor estará disponible en `http://localhost:5000`

## 📁 Estructura del Proyecto

```
daily-planner/
├── server/                 # Backend (API REST)
│   ├── src/
│   │   ├── app.py         # Aplicación principal Flask
│   │   ├── database/      # Configuración de BD
│   │   ├── models/        # Modelos de datos
│   │   ├── controllers/   # Lógica de negocio
│   │   └── routes/        # Endpoints de la API
│   ├── tests/             # Tests unitarios
│   ├── docker-compose.yml # PostgreSQL en Docker
│   └── requirements.txt   # Dependencias Python
├── client/                # Frontend (En desarrollo)
└── README.md             # Este archivo
```

## 🔧 Desarrollo

### Backend

Ver documentación completa en [server/README.md](server/README.md)

### Variables de Entorno

El proyecto usa diferentes archivos de configuración:

- `.env.development` - Desarrollo local
- `.env.production` - Producción
- `.env.example` - Plantilla

**Nunca subas los archivos `.env.*` a Git** (ya están en `.gitignore`)

## 🧪 Testing

```bash
cd server
pytest tests/
```

## 📚 API Endpoints

### Base URL: `http://localhost:5000/api`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/tasks` | Listar todas las tareas |
| GET | `/tasks/:id` | Obtener tarea específica |
| POST | `/tasks` | Crear nueva tarea |
| PUT | `/tasks/:id` | Actualizar tarea |
| DELETE | `/tasks/:id` | Eliminar tarea |

Ver documentación completa de la API en [server/README.md](server/README.md)

## 🐳 Docker

### Comandos útiles:

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down

# Parar y eliminar datos (⚠️ CUIDADO)
docker-compose down -v

# Ver estado
docker-compose ps
```

## 🗄️ Base de Datos

### Modelo de Datos - Task

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Integer | ID único (auto-incremental) |
| titulo | String(200) | Título de la tarea |
| descripcion | Text | Descripción detallada |
| fecha | Date | Fecha de la tarea |
| hora | Time | Hora específica (opcional) |
| completada | Boolean | Estado de completitud |
| prioridad | String(20) | alta, media, baja |
| tipo | String(20) | diaria, semanal |
| created_at | DateTime | Fecha de creación |
| updated_at | DateTime | Última actualización |

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👤 Autor

**Victor**

- GitHub: [@tu-usuario](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- Flask community
- PostgreSQL team
- Docker team

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub!