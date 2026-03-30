# ⚡ QUICK START - 5 Minutes

## Database
```bash
createdb photohub_pro
psql photohub_pro < backend/database/schema.sql
```

## Backend
```bash
cd backend && cp .env.example .env
# Edit .env with your credentials
npm install && npm run dev
```

## Frontend (new terminal)
```bash
cd frontend && cp .env.example .env
npm install && npm run dev
```

## Visit
```
http://localhost:5173
```

## Test Features
1. Sign up
2. Create project  
3. Upload photos
4. Create slideshow (Feature #1)
5. Add timeline (Feature #2)
6. Tag people (Feature #3)
7. Generate stories (Feature #4)
8. Test anniversary (Features #5&6)

See README.md for full documentation.
