# AGRIAI-IMPROVED

Full-stack Agriculture AI Application with Crop Prediction, Fertilizer Recommendation, and Plant Disease Detection.

## Features
- **Crop Prediction**: Suggests the best crop based on soil NPK and weather data.
- **Fertilizer Recommendation**: Recommends fertilizer for specific soil and crop types.
- **Disease Detection**: Upload plant leaf images to detect diseases (Simulated AI for MVP).
- **Dashboard**: View history and analytics.
- **Secure Auth**: Powered by Replit Auth.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express
- **AI/ML**: Python (Scikit-Learn, NumPy)
- **Database**: PostgreSQL (Drizzle ORM)

## Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:5000 for running this project.

## ML Models
The Python scripts in `server/ml/` train simple models on-the-fly for demonstration. For production, replace the mock training data with real datasets and save the models using `joblib` or `pickle`.

## Deployment
- **Frontend**: Can be deployed to Vercel (see `vercel.json`).
- **Backend**: Can be deployed to Render or Heroku.
