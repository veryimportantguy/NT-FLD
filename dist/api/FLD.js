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
const knownFlashLoanProviders = {
    "0x3dfd1280a46d91e27b89a1d8cd26289a58b73d5d": "Aave V2 Lending Pool",
    "0x7BeA39867e4169DBe237d4AAfD348AE8A02F9FC8": "Aave V2 Lending Pool Core",
    "0xb53c1a33016b2dc2ff3653530bff1848a515c8c5": "Aave V2 Pool Addresses Provider",
    "0x1c6bf4d245dcd204dcec92a4083c526d35202354": "Aave V3 Pool Proxy",
    "0xbcca60bb61934080951369a648fb03df4f96263c": "Aave V3 Lending Pool Proxy",
    "0x1f98431c8ad98523631ae4a59f267346ea31f984": "Uniswap V3 Core",
    "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f": "Uniswap V2 Factory",
    "0x8f8ef111b67c04eb1641f5ff19ee54cda062f163": "Cream Finance Lending Pool",
    "0xba12222222228d8ba445958a75a0704d566bf2c8": "Balancer Vault",
    "0x9f8f72aa9304c8b593d555f12ef6589ccbcb51e3": "MakerDAO Vault",
    "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82": "PancakeSwap BSC Pool",
    "0x8ff387d4d3cd3f0c7ad4a190bc312bb0ab6fa9ca": "InstaDApp Flash Loan Module",
    // Add more providers as needed
};
// Known flash loan event signatures with descriptive labels
const flashLoanEventSignatures = {
    "0xd3d2e0a938db6a6c98cf6fb62d4d4a0835fbc67a25fa7b5b4b6f9e9c123abe8e": "Aave V2 FlashLoan event",
    "0x6433ca1c5b18bfedede7e13d8a0db828fbe01fa2b3fd6df34b635c48c8d16dd6": "Aave V3 FlashLoan event",
    "0xc5c35a8fcd243be55c16db02041b912b34f2d8713f153e51c27f65b25ee5dc0c": "dYdX Solo Margin FlashLoan event",
    "0x1c411e9a96b6f2a17a2212e4150f27d67621a536fc50f06a2785e1f20b42ce58": "Uniswap Swap event",
    "0x7cd299a77c4e9d377784de9567d675bb3b77a3e3f3b432d9ed42aef7b0b2824a": "Cream Finance FlashLoan event",
    "0x8f9aefc1649c4f81ef0e15d0d2df6a1b3b75f2e3c3c2cb18fddaad4b235b14c1": "Balancer Vault FlashLoan event",
    // Add additional event signatures as needed
};
function detectFlashLoanAttack(blockNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const block = yield provider.getBlockWithTransactions(blockNumber);
        const attacks = [];
        let attackId = 1;
        let presenceOfAttack = false;
        console.log(`Analyzing block ${blockNumber} with ${block.transactions.length} transactions`);
        const ethPrice = yield getCurrentEthPrice();
        console.log(`Current ETH Price (USD): ${ethPrice}`);
        // Calculate transaction value statistics for large/suspicious transaction detection
        const transactionValues = block.transactions.map(tx => parseFloat(ethers_1.ethers.utils.formatEther(tx.value)));
        const mean = transactionValues.reduce((sum, value) => sum + value, 0) / transactionValues.length;
        const stdDev = Math.sqrt(transactionValues.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / transactionValues.length);
        const largeValueThreshold = mean + (2 * stdDev);
        console.log(`Calculated largeValueThreshold (Z-score 2): ${largeValueThreshold} ETH`);
        for (const tx of block.transactions) {
            console.log(`\nEvaluating Transaction: ${tx.hash}`);
            console.log(`From: ${tx.from}, To: ${tx.to}, Value (ETH): ${ethers_1.ethers.utils.formatEther(tx.value)}`);
            const { isFlashLoan, matchedProvider, matchedEvent } = yield detectFlashLoanInTransaction(tx);
            const valueInEther = parseFloat(ethers_1.ethers.utils.formatEther(tx.value));
            const isSuspicious = valueInEther > largeValueThreshold;
            const isEulerAttack = eulerAttackTxHashes.hasOwnProperty(tx.hash.toLowerCase());
            const isFromKnownAttacker = knownAttackers.hasOwnProperty(tx.from.toLowerCase());
            const isToKnownAttacker = tx.to && knownAttackers.hasOwnProperty(tx.to.toLowerCase());
            const severity = isFlashLoan || isEulerAttack || isFromKnownAttacker || isToKnownAttacker ? "critical" :
                isSuspicious ? "suspicious" : "normal";
            if (severity !== "normal") {
                presenceOfAttack = true;
                console.log(`Flagged transaction: ${tx.hash} - Severity: ${severity}`);
                const flags = {
                    isFlashLoan,
                    matchedProvider,
                    matchedEvent,
                    fromKnownAttacker: isFromKnownAttacker ? knownAttackers[tx.from.toLowerCase()] : "No",
                    toKnownAttacker: isToKnownAttacker ? knownAttackers[((_a = tx.to) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || ""] : "No",
                    isLargeTransaction: isSuspicious,
                    eulerAttack: isEulerAttack ? eulerAttackTxHashes[tx.hash.toLowerCase()] : "No"
                };
                attacks.push({
                    attackId: attackId++,
                    txHash: tx.hash,
                    attackTime: new Date(block.timestamp * 1000).toISOString(),
                    isFlashLoan,
                    attackerAddress: tx.from,
                    victimAddress: tx.to || "",
                    amountLostInDollars: calculateAmountLost(tx.value, ethPrice),
                    severity,
                    flags
                });
            }
        }
        console.log(`\nFinished analyzing block ${blockNumber}. Total flagged transactions: ${attacks.length}`);
        return {
            blockNumber,
            chainId: "0x1",
            presenceOfAttack,
            attacks
        };
    });
}
// Fetch ETH price in USD
function getCurrentEthPrice() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const response = yield axios_1.default.get(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}/getTokenPrice`, {
                params: {
                    contractAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" // ETH contract address
                }
            });
            return ((_a = response.data.tokenPrice) === null || _a === void 0 ? void 0 : _a.usd) || 2000; // Default to 2000 if API fails
        }
        catch (error) {
            console.error("Error fetching ETH price from Alchemy:", error);
            return 2000; // Default price if API call fails
        }
    });
}
// Calculate the lost amount in USD
function calculateAmountLost(value, ethPrice) {
    return parseFloat(ethers_1.ethers.utils.formatEther(value)) * ethPrice;
}
// Detect flash loans based on logs
function detectFlashLoanInTransaction(tx_1) {
    return __awaiter(this, arguments, void 0, function* (tx, maxRetries = 3, delayMs = 100) {
        let matchedEvent;
        let matchedProvider;
        let attempt = 0;
        while (attempt < maxRetries) {
            try {
                const receipt = yield tx.wait();
                for (const log of receipt.logs) {
                    const eventSignature = log.topics[0];
                    if (flashLoanEventSignatures[eventSignature]) {
                        matchedEvent = flashLoanEventSignatures[eventSignature];
                    }
                    if (knownFlashLoanProviders[log.address.toLowerCase()]) {
                        matchedProvider = knownFlashLoanProviders[log.address.toLowerCase()];
                    }
                    if (matchedEvent || matchedProvider)
                        break;
                }
                // Successful retrieval, return result immediately
                return {
                    isFlashLoan: Boolean(matchedEvent || matchedProvider),
                    matchedEvent,
                    matchedProvider
                };
            }
            catch (error) {
                attempt++;
                if (error.code === 'CALL_EXCEPTION') {
                    console.warn(`Transaction failed: ${tx.hash}. Skipping flash loan detection for this transaction.`);
                    // return { isFlashLoan: false };
                }
                if (attempt >= maxRetries) {
                    console.error(`Failed to get transaction info for ${tx.hash} after ${maxRetries} attempts.`);
                    return { isFlashLoan: false };
                }
                console.warn(`Attempt ${attempt} failed for transaction ${tx.hash}. Retrying in ${delayMs} ms...`);
                yield new Promise(resolve => setTimeout(resolve, delayMs)); // Delay before retrying
            }
        }
        // Return default response if retries exhausted
        return { isFlashLoan: false };
    });
}
// Example inline test to run the function directly
// (async () => {
//     const testBlockNumber = 16818057;
//     console.log(`Running test for block number ${testBlockNumber}`);
//     const result = await detectFlashLoanAttack(testBlockNumber);
//     console.log("Test result:", JSON.stringify(result, null, 2));
// })();
