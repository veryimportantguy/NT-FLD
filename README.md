# Flash Loan Attack Detector

A **TypeScript** service to detect potential flash loan attacks on Ethereum by analyzing transaction data and identifying suspicious patterns based on known attack characteristics.

## Features

- **Flash Loan Detection**: Identifies transactions that might involve flash loans based on transaction patterns.
- **Suspicious Transaction Analysis**: Flags transactions with high value or known attacker involvement.
- **Dynamic ETH Price Calculation**: Fetches the latest ETH/USD price for accurate value assessment.
- **Severity Levels**:
  - **Critical**: Matches known attack patterns or involves a known attacker.
  - **Suspicious**: High-value transactions relative to the current pool.
- **Detailed Flagging**: Each flagged transaction provides insight on why it was marked suspicious, including interactions with known attackers or exceeding large value thresholds (2x Zscore tails ).

## Installation
 
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo.git
   cd your-repo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file with your Alchemy API key:
   ```plaintext
   ALCHEMY_API_KEY=your_alchemy_api_key
   ETH_NETWORK=mainnet
   PORT=3000
   ```

## Usage

1. **Run the Service**:
   - To run the server, execute:
     ```bash
        npx tsc
        node dist/index.js
     ```

2. **Test with API Endpoint**:
   - You can start the service and test it with a POST request to `http://localhost:3000/detectFlashLoanAttack`.
   - Example request body:
     ```json
     {
       "blockNumber": 16818057
     }
     ```
     ```
     curl   -X POST http://localhost:3000/detectFlashLoanAttack \
            -H "Content-Type: application/json" \
            -d '{"blockNumber": 16818057}'
     ```

## Output Structure

The output includes:
- `blockNumber`: Block number analyzed.
- `chainId`: Ethereum mainnet.
- `presenceOfAttack`: Boolean indicating if suspicious activity was detected.
- `attacks`: List of flagged transactions with details.

Example response:
```json
{
  "blockNumber": 16818057,
  "chainId": "0x1",
  "presenceOfAttack": true,
  "attacks": [
    {
      "attackId": 1,
      "txHash": "0xc310a0affe2169d1...",
      "attackTime": "2023-03-13T00:00:00.000Z",
      "isFlashLoan": true,
      "attackerAddress": "0xb66cd966670...",
      "victimAddress": "0xe025e3ca2...",
      "amountLostInDollars": 1231273.123,
      "severity": "critical",
      "attackerLabel": "Attacker EOA-1",
      "eulerAttackLabel": "Euler Attack Tx-1",
      "flags": {
        "transactionHash": "0xc310a0affe2169d1...",
        "fromKnownAttacker": "Attacker EOA-1",
        "toKnownAttacker": "Victim Contract",
        "isLargeTransaction": true,
        "isEulerAttack": "Yes"
      }
    }
  ],
  "ethPrice": 2000 //calculated from coingecko
}
```

## Next Steps & Potential Improvements

1. **Flash Loan Provider Detection**:
   - Create `checkForFlashLoan` to interact with specific lending pools or flash loan providers (e.g., Aave, dYdX) for known lenders, or simply to improve what a real flash loan is.
2. **Historical Attack Patterns**:
   - Load patterns from known historical attacks to match against future suspicious transactions.
3. **Machine Learning Integration**:
   - Use ML models to learn and detect new patterns of suspicious activity automatically. PyTorch TensorFlow

## Tech Stack

- **TypeScript**: Primary language for implementation.
- **Node.js**: Runtime environment.
- **Alchemy API**: Used to fetch on-chain data and transaction details.
- **CoinGecko API**: (Fallback) Fetches real-time ETH/USD price for calculations.
