# 💡 Mini Palantir Gotham

**A powerful data intelligence dashboard inspired by Palantir's Gotham platform**

![Python](https://img.shields.io/badge/python-v3.8+-blue.svg)
![React](https://img.shields.io/badge/react-v18+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🔍 Overview

Mini Palantir Gotham is a full-stack data intelligence dashboard that ingests structured data (like NYC crime data), stores it in a database, serves it through a RESTful API, and visualizes it in a rich and interactive frontend dashboard.

### ✨ Features

- 📊 **Interactive Data Visualization**: Maps, charts, and tables
- 🗺️ **Geospatial Analysis**: Crime mapping with Leaflet
- 🔍 **Advanced Filtering**: Filter by borough, date, offense type
- 📈 **Real-time Analytics**: Live data insights and trends
- 🔒 **Authentication Ready**: JWT-based security (optional)
- 🚀 **Production Ready**: Docker support and deployment guides

## ⚙️ Tech Stack

| Layer        | Technology                          | Purpose                 |
| ------------ | ----------------------------------- | ----------------------- |
| **Frontend** | React.js, TailwindCSS, Leaflet      | UI, maps, visualization |
| **Backend**  | FastAPI, SQLAlchemy                 | API, ORM, routing       |
| **Database** | SQLite (dev) → PostgreSQL (prod)    | Data storage            |
| **Data**     | CSV or API (e.g., NYC Open Data)    | Input                   |
| **Tools**    | Uvicorn, Pydantic, Postman, Swagger | Testing, validation     |

## 📁 Project Structure

```
mini-palantir-gotham/
│
├── backend/
│   ├── main.py               # FastAPI app entrypoint
│   ├── db.py                 # Database connection setup
│   ├── models.py             # SQLAlchemy ORM models
│   ├── nyc_ingest.py         # Data ingestion script
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment variables
│
├── frontend/
│   ├── public/               # Static files
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page views
│   │   ├── services/         # API services
│   │   ├── App.js            # App root
│   │   └── index.js          # Entry point
│   ├── package.json          # Frontend dependencies
│   └── tailwind.config.js    # Tailwind configuration
│
├── data/
│   └── sample_crime_data.csv # Sample NYC crime data
│
├── docker-compose.yml        # Docker setup
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/mini-palantir-gotham.git
cd mini-palantir-gotham

# Run the setup script
./setup.sh

# Start the development server
./start_dev.sh
```

### Manual Setup

#### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Ingest sample data
python nyc_ingest.py

# Start backend server
uvicorn main:app --reload
```

#### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Test Installation

```bash
./test_installation.sh
```

### Access the Application

- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Interactive API**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## 🔧 Development

### Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=sqlite:///./gotham.db
# For production PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/gotham
```

### API Endpoints

| Method | Endpoint        | Description               |
| ------ | --------------- | ------------------------- |
| GET    | `/`             | Health check              |
| GET    | `/crimes`       | Get all crime records     |
| GET    | `/crimes/{id}`  | Get specific crime record |
| GET    | `/stats`        | Get crime statistics      |
| GET    | `/boroughs`     | Get borough statistics    |

## 🚀 Deployment

### Backend (Render/Railway)

1. Push to GitHub
2. Connect to Render/Railway
3. Set environment variables
4. Deploy with: `uvicorn main:app --host=0.0.0.0 --port=$PORT`

### Frontend (Vercel/Netlify)

1. Build: `npm run build`
2. Deploy build folder
3. Set API URL in environment variables

### Docker Deployment

#### Development with Docker

```bash
# Start all services in development mode
docker-compose up --build

# Start only specific services
docker-compose up postgres backend
```

#### Production with Docker

```bash
# Build and start production services
docker-compose --profile production up --build

# Or use individual services
docker-compose up postgres backend nginx
```

#### Docker Services

| Service    | Port | Description                      |
| ---------- | ---- | -------------------------------- |
| Frontend   | 3000 | React development server         |
| Backend    | 8000 | FastAPI application              |
| PostgreSQL | 5432 | Database (production)            |
| Nginx      | 80   | Web server (production)          |

## 📊 Sample Data

The project includes sample NYC crime data. To use real data:

1. Download from [NYC Open Data](https://data.cityofnewyork.us/)
2. Replace `data/sample_crime_data.csv`
3. Run `python nyc_ingest.py`

## 🛠️ Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


