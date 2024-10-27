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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectFlashLoanAttack = detectFlashLoanAttack;
const ethers_1 = require("ethers");
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const provider = new ethers_1.ethers.providers.AlchemyProvider("mainnet", process.env.ALCHEMY_API_KEY);
function detectFlashLoanAttack(blockNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const block = yield provider.getBlockWithTransactions(blockNumber);
        const attacks = [];
        let attackId = 1;
        let presenceOfAttack = false;
        console.log(`Analyzing block ${blockNumber} with ${block.transactions.length} transactions`);
        const ethPrice = yield getCurrentEthPrice();
        console.log(`Current ETH Price (USD): ${ethPrice}`);
        const eulerAttackTxHashes = {
            "0xc310a0affe2169d1f6feec1c63dbc7f7c62a887fa48795d327d4d2da2d6b111d": "Euler Attack Tx-1",
            "0x71a908be0bef6174bccc3d493becdfd28395d78898e355d451cb52f7bac38617": "Euler Attack Tx-2",
            "0x62bd3d31a7b75c098ccf28bc4d4af8c4a191b4b9e451fab4232258079e8b18c4": "Euler Attack Tx-3",
            "0x465a6780145f1efe3ab52f94c006065575712d2003d83d85481f3d110ed131d9": "Euler Attack Tx-4",
            "0x3097830e9921e4063d334acb82f6a79374f76f0b1a8f857e89b89bc58df1f311": "Euler Attack Tx-5",
            "0x47ac3527d02e6b9631c77fad1cdee7bfa77a8a7bfd4880dccbda5146ace4088f": "Euler Attack Tx-6"
        };
        const knownAttackers = {
            "0xb66cd966670d962c227b3eaba30a872dbfb995db": "Attacker EOA-1",
            "0xb2698c2d99ad2c302a95a8db26b08d17a77cedd4": "Attacker EOA-2",
            "0xeBC29199C817Dc47BA12E3F86102564D640CBf99": "Attacker Contract-1",
            "0x036cec1a199234fc02f72d29e596a09440825f1c": "Attacker Contract-2",
            "0xD3b7CEA28Feb5E537fcA4E657e3f60129456eaF3": "Attacker Contract-3",
            "0x0b812c74729b6aBc723F22986C61D95344ff7ABA": "Attacker Contract-4",
            "0xe025e3ca2be02316033184551d4d3aa22024d9dc": "Victim Contract"
        };
        const transactionValues = block.transactions.map(tx => parseFloat(ethers_1.ethers.utils.formatEther(tx.value)));
        const mean = transactionValues.reduce((sum, value) => sum + value, 0) / transactionValues.length;
        const stdDev = Math.sqrt(transactionValues.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / transactionValues.length);
        const largeValueThreshold = mean + (2 * stdDev);
        console.log(`Calculated largeValueThreshold (Z-score 2): ${largeValueThreshold} ETH`);
        for (const tx of block.transactions) {
            console.log(`\nEvaluating Transaction: ${tx.hash}`);
            console.log(`From: ${tx.from}, To: ${tx.to}, Value (ETH): ${ethers_1.ethers.utils.formatEther(tx.value)}`);
            const { isSuspicious, severity, label, flags } = yield analyzeTransaction(tx, eulerAttackTxHashes, knownAttackers, largeValueThreshold);
            if (isSuspicious) {
                presenceOfAttack = true;
                console.log(`Suspicious transaction detected: ${tx.hash}`);
                attacks.push(Object.assign(Object.assign({ attackId: attackId++, txHash: tx.hash, attackTime: new Date(block.timestamp * 1000).toISOString(), isFlashLoan: severity === "critical", attackerAddress: tx.from, victimAddress: tx.to || "", amountLostInDollars: calculateAmountLost(tx.value, ethPrice), severity, attackerLabel: knownAttackers[tx.from.toLowerCase()] || "Unknown", eulerAttackLabel: eulerAttackTxHashes[tx.hash.toLowerCase()] || "Not an Euler attack transaction" }, (severity === "suspicious" && { tag: "Large Transaction" })), { flags }));
            }
        }
        console.log(`\nFinished analyzing block ${blockNumber}. Total suspicious transactions: ${attacks.length}`);
        return {
            blockNumber,
            chainId: "0x1",
            presenceOfAttack,
            attacks,
            ethPrice // Adding ETH price to the final output
        };
    });
}
// Fetch the current ETH price in USD using Alchemy API (didnt work)
// Fetch the current ETH price in USD using CoinGecko API as an alternative
function getCurrentEthPrice() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`;
            console.log(`Fetching ETH price from CoinGecko: ${url}`);
            const response = yield axios_1.default.get(url);
            const ethPrice = (_a = response.data.ethereum) === null || _a === void 0 ? void 0 : _a.usd;
            if (ethPrice) {
                console.log(`Fetched ETH price: ${ethPrice} USD`);
                return ethPrice;
            }
            else {
                console.error("ETH price not found in CoinGecko response. Defaulting to 2000 USD.");
                return 2000;
            }
        }
        catch (error) {
            console.error("Error fetching ETH price from CoinGecko:", error);
            return 2000; // Default price if API call fails
        }
    });
}
// Function to calculate the lost amount in USD based on the transaction value and current ETH price
function calculateAmountLost(value, ethPrice) {
    return parseFloat(ethers_1.ethers.utils.formatEther(value)) * ethPrice;
}
// Define the analyzeTransaction function with severity improvements and flags
function analyzeTransaction(tx, eulerAttackTxHashes, knownAttackers, largeValueThreshold) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const isEulerAttack = eulerAttackTxHashes.hasOwnProperty(tx.hash.toLowerCase());
        const isFromKnownAttacker = tx.from && knownAttackers.hasOwnProperty(tx.from.toLowerCase());
        const isToKnownAttacker = tx.to && knownAttackers.hasOwnProperty(tx.to.toLowerCase());
        const valueInEther = parseFloat(ethers_1.ethers.utils.formatEther(tx.value));
        const severity = isEulerAttack || isFromKnownAttacker || isToKnownAttacker ? "critical" :
            valueInEther > largeValueThreshold ? "suspicious" : "normal";
        const flags = {
            fromKnownAttacker: isFromKnownAttacker ? knownAttackers[tx.from.toLowerCase()] : "No",
            toKnownAttacker: isToKnownAttacker ? knownAttackers[((_a = tx.to) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || ""] : "No",
            isLargeTransaction: valueInEther > largeValueThreshold,
            isEulerAttack: isEulerAttack ? eulerAttackTxHashes[tx.hash.toLowerCase()] : "No"
        };
        console.log(`Transaction Hash: ${tx.hash}`);
        console.log(`From known attacker: ${flags.fromKnownAttacker}`);
        console.log(`To known attacker: ${flags.toKnownAttacker}`);
        console.log(`Value in Ether: ${valueInEther}, Threshold: ${largeValueThreshold}`);
        console.log(`Matches Euler attack hash: ${flags.isEulerAttack}`);
        console.log(`Severity: ${severity}`);
        return {
            isSuspicious: severity !== "normal",
            severity,
            label: severity === "suspicious" ? "Large Transaction" : "",
            flags
        };
    });
}
// Inline test to run the function directly
// (async () => {
//     const testBlockNumber = 16818057;
//     console.log(`Running test for block number ${testBlockNumber}`);
//     const result = await detectFlashLoanAttack(testBlockNumber);
//     console.log("Test result:", JSON.stringify(result, null, 2));
// })();