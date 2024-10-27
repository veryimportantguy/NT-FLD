"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const FLD_1 = require("./api/FLD"); // Adjust path as needed
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const app = (0, express_1.default)();
app.use(express_1.default.json()); // Middleware to parse JSON request bodies
// Define the request handler with specific types for req and res
const detectAttackHandler = (req, res) => {
    const { blockNumber } = req.body;
    if (!blockNumber) {
        res.status(400).json({ error: "Missing blockNumber in request body" });
        return;
    }
    (0, FLD_1.detectFlashLoanAttack)(blockNumber)
        .then((result) => {
        res.json(result); // Simply call res.json without returning
    })
        .catch((error) => {
        console.error("Error detecting flash loan attack:", error);
        res.status(500).json({ error: "An error occurred while detecting the attack" });
    });
};
// POST /detectFlashLoanAttack
app.post('/detectFlashLoanAttack', detectAttackHandler);
// Start the server on the specified port or 3000 by default
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));