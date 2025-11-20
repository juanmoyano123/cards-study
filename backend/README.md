# StudyMaster Backend

FastAPI backend for StudyMaster - AI-powered flashcard platform.

## Tech Stack

- **Framework:** FastAPI
- **Database:** PostgreSQL 16
- **ORM:** SQLAlchemy 2.0
- **Validation:** Pydantic v2
- **Migrations:** Alembic
- **Testing:** Pytest
- **AI:** OpenAI GPT-4o-mini

## Quick Start

### Prerequisites

- Python 3.11+
- Docker & Docker Compose
- pip or uv

### 1. Setup Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env and fill in your values
# At minimum, you need:
# - DATABASE_URL (defaults to local Docker PostgreSQL)
# - OPENAI_API_KEY (get from https://platform.openai.com)
```

### 3. Start Database

```bash
# From project root directory
cd ..
docker-compose up -d postgres

# Verify database is running
docker-compose ps
```

### 4. Run Migrations

```bash
# Initialize Alembic (only needed once)
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head
```

### 5. Start Development Server

```bash
# Run with uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or run main.py directly
python -m app.main
```

The API will be available at:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 6. Access Database Admin (Optional)

pgAdmin is available at http://localhost:5050

```
Email: admin@studymaster.local
Password: admin
```

Add server connection:
```
Host: postgres
Port: 5432
Database: studymaster
Username: studymaster
Password: devpass
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment configuration
│   ├── models/              # SQLAlchemy ORM models
│   ├── schemas/             # Pydantic schemas
│   ├── routes/              # API route handlers
│   ├── services/            # Business logic
│   ├── utils/               # Utilities
│   └── middleware/          # Middleware
├── tests/                   # Pytest tests
├── alembic/                 # Database migrations
├── requirements.txt         # Python dependencies
├── .env.example            # Example environment variables
└── README.md
```

## Development

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v
```

### Code Quality

```bash
# Format code with black
black app/ tests/

# Lint with pylint
pylint app/

# Type check with mypy
mypy app/
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Add new table"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1

# Show migration history
alembic history
```

### Useful Commands

```bash
# Stop database
docker-compose down

# Stop and remove volumes (DELETES DATA)
docker-compose down -v

# View database logs
docker-compose logs postgres -f

# Connect to database with psql
docker-compose exec postgres psql -U studymaster -d studymaster
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

See `.env.example` for all available configuration options.

**Required:**
- `OPENAI_API_KEY`: Your OpenAI API key
- `DATABASE_URL`: PostgreSQL connection string

**Optional:**
- `SUPABASE_URL`: Supabase project URL (for production)
- `SUPABASE_KEY`: Supabase anon key (for production)
- `DEBUG`: Enable debug mode (default: False)

## Troubleshooting

### Database Connection Error

```bash
# Make sure PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Import Errors

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use a different port
uvicorn app.main:app --port 8001
```

## Production Deployment

For production deployment instructions, see `/docs/architecture.md`.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `pytest`
4. Format code: `black app/`
5. Commit and push
6. Create pull request

## License

Proprietary - StudyMaster
