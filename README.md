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
      "attackId": 4,
      "txHash": "0x3819f9616fefe9471cfb5d7284b5a5b48b215dc5e970eea7697bb039ec47d1b6",
      "attackTime": "2023-03-13T09:03:23.000Z",
      "isFlashLoan": true,
      "attackerAddress": "0x1b6bAfA6FA51500A35c030Baa82479Cdad4F316c",
      "victimAddress": "0xDef1C0ded9bec7F1a1670819833240f027b25EfF",
      "amountLostInDollars": 0,
      "severity": "critical",
      "flags": {
        "isFlashLoan": true,
        "matchedProvider": "Balancer Vault",
        "fromKnownAttacker": "No",
        "toKnownAttacker": "No",
        "isLargeTransaction": false,
        "eulerAttack": "No"
      }
    }, //.....
  ],
  "ethPrice": 2000 //calculated from coingecko
}
```

## Next Steps & Potential Improvements

1. **Flash Loan Provider Detection**:
   1) DONE - Create `checkForFlashLoan` to interact with specific lending pools or flash loan providers (e.g., Aave, dYdX) for known lenders, or simply to improve what a real flash loan is.
   2) Can still ensure the loan was given and received
   3) This should be done live stream via websocket where what we are looking for is a flashloan provider with a suspicious amount as primary FLAG WARNING, then known accounts as secondary. As well as known accounts for any transaciton.
   4) Flashloan providers should be monitored directly and cached for faster reaction
2. **Historical Attack Patterns**:
   - Load patterns from known historical attacks to match against future suspicious transactions.
3. **Machine Learning Integration**:
   - Use ML models to learn and detect new patterns of suspicious activity automatically. PyTorch TensorFlow
4. checking signature on each tranasction in the block significantly slows down the process by having to make a call for every transaction (there are bulk solutions, as well as further research may show the signature is overkill)

## Tech Stack

- **TypeScript**: Primary language for implementation.
- **Node.js**: Runtime environment.
- **Alchemy API**: Used to fetch on-chain data and transaction details.
- **CoinGecko API**: (Fallback) Fetches real-time ETH/USD price for calculations.
