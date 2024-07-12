import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import MongoDB from '../db/MongoDB';
import userRoutes from '../routes/UserRoutes';
import orgRoutes from '../routes/OrgRoutes';

dotenv.config();

const app = express();

// Initialize MongoDB connection
const mongoDB = new MongoDB();
mongoDB.connect()
.then(() => {
    // console.log('Connected to MongoDB');
    startServer(3000); 
})
.catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});

// Middleware to connect CORS
app.use(cors({
    origin:'http://localhost:5173',
}));

app.use(express.json());

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/organizer', orgRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.send('hello world');
});

// Start server function
export const startServer = (port: number) => {
    console.log('starting server on port' , port)
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};

