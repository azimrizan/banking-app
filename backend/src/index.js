import express from 'express';
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

import accountRoutes from './routes/accountRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import { typeDefs, resolvers } from './graphql/schema.js';
import { authMiddleware } from "./middleware/auth.js";

dotenv.config();

const app = express();
app.use(express.json());

// Allow CORS (Angular dev server + production frontend)
app.use(cors({
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200', process.env.FRONTEND_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'apollo-require-preflight']
}));

// Setup __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve Angular static files from "public/browserfile"
app.use(express.static(path.join(__dirname, '../public/browserfile')));

// REST routes
app.use("/api/accounts", accountRoutes);
app.use("/api/loans", loanRoutes);

// Apollo Server setup
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const startServer = async () => {
    await server.start();

    // GraphQL endpoint with auth middleware
    app.use(
        '/graphql',
        expressMiddleware(server, {
            context: async ({ req, res }) => {
                authMiddleware(req, res, () => {});
                return { user: req.user };
            },
        })
    );

    // ✅ Catch-all route to serve Angular index.html
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});
    
    // Connect to MongoDB and start server
    mongoose.connect(process.env.MONGO_URL)
        .then(() => {
            console.log("✅ MongoDB Connected");
            const PORT = process.env.PORT || 4000;
            app.listen(PORT, () => {
                console.log(`🚀 Server ready at http://localhost:${PORT}`);
            });
        })
        .catch(err => {
            console.error("❌ MongoDB connection error:", err);
        });
};

startServer();
