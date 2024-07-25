import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import MongoDB from '../db/MongoDB';
import userRoutes from '../routes/UserRoutes';
import orgRoutes from '../routes/OrgRoutes';
import adminRoutes from '../routes/adminRoutes';

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
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS', 
    allowedHeaders: 'Content-Type,Authorization'
}));

app.use(express.json());

// Use routes
app.use('/users', userRoutes);
app.use('/organizer', orgRoutes);
app.use('/admin', adminRoutes);



// Start server function
export const startServer = (port: number) => {
    console.log('starting server on port' , port)
    app.listen(port, () => {
        console.log(`Server running on port http://localhost:${port}`);
    });
};

