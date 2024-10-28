import express, { Request, Response } from 'express';
import { detectFlashLoanAttack } from './api/FLD'; // Adjust path as needed
import * as dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

// Define the request handler as an async function with typed parameters
const detectAttackHandler = async (req: Request, res: Response): Promise<void> => {
    const { blockNumber } = req.body;

    if (!blockNumber) {
        res.status(400).json({ error: "Missing blockNumber in request body" });
        return;
    }

    try {
        const result = await detectFlashLoanAttack(blockNumber);
        res.json(result);
    } catch (error) {
        console.error("Error detecting flash loan attack:", error);
        res.status(500).json({ error: "An error occurred while detecting the attack" });
    }
};

// POST /detectFlashLoanAttack
app.post('/detectFlashLoanAttack', detectAttackHandler);

// Start the server on the specified port or 3000 by default
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
