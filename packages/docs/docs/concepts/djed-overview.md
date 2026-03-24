---
sidebar_position: 1
---

# Djed Overview

Djed is an algorithmic stablecoin protocol developed for the Cardano blockchain by COTI and IOG. Its main goal is to provide a stable, decentralized currency (DJED) that maintains its value relative to a target (1 USD) through an on-chain mechanism of overcollateralization and reserve management.

## How Djed Works

- **Overcollateralization:** Djed is backed by excess collateral in the form of ADA, ensuring that every DJED in circulation is always supported by more value than its face value.
- **Reserve Token (Shen):** The protocol uses a reserve token called Shen (SHEN). Users can buy SHEN to provide collateral to the system and, in return, receive a share of the protocol’s fees and exposure to the reserve ratio.
- **Minting and Burning:** Users can mint DJED by depositing ADA into the protocol, or burn DJED to redeem ADA. The same applies to SHEN, which can be minted or burned based on the reserve ratio.
- **Peg Mechanism:** The protocol uses smart contracts to automatically maintain the peg, adjusting minting and burning prices based on the reserve ratio and oracle-provided ADA/USD rates.
- **Stability:** The system is designed to remain solvent and stable even during periods of high volatility, as long as the reserve ratio stays within predefined safe bounds.

### Reserve Ratio and Protocol Limits

A key concept in Djed is the **reserve ratio**, which is the ratio of the total ADA in the reserve to the total value of DJED in circulation. This ratio determines the health and stability of the protocol and enforces the following rules:

- **If the reserve ratio falls below 400%:**
  - **DJED minting is disabled.**
  - **SHEN burning is disabled.**
  - This ensures that there is always enough collateral to back all DJED in circulation.

- **If the reserve ratio rises above 800%:**
  - **SHEN minting is disabled.**
  - This prevents excessive dilution of SHEN holders and keeps the reserve at a manageable level.

- **Within the 400%–800% range:**
  - All operations (DJED minting/burning, SHEN minting/burning) are allowed.

These boundaries are enforced by the smart contracts, ensuring the protocol remains solvent and stable under all supported conditions.

### Protocol Fees

Every operation on the Djed protocol (minting, burning, etc.) involves several types of fees. These fees are required to cover transaction costs, protocol maintenance, and operator incentives. The main fee types include:

- **Mint/Burn Fee:** A protocol fee applied when minting or burning DJED or SHEN.
- **Operator Fee:** A fee paid to the protocol operator for maintaining the system.
- **Refundable Deposit:** An amount temporarily locked during the transaction, refunded after confirmation.

> **Note:** Fee values are dynamic and may change based on network conditions and protocol parameters. Open Djed always displays the current fee breakdown before you confirm any operation. Check here [Open DJED Dashboard](https://djed.artifi.finance)

## The Role of Shen (Reservecoin)

Shen is the reserve token of the Djed protocol. Its primary function is to provide stability and liquidity to the system, acting as a buffer that absorbs fluctuations in ADA’s price and helps maintain the peg of DJED.

### Why is a reservecoin important?

- **Stability:** The reservecoin absorbs volatility from the underlying collateral (ADA). When ADA’s price drops, Shen holders bear the risk, protecting DJED holders from depegging.
- **Liquidity:** Shen holders provide the extra collateral needed for the protocol to remain overcollateralized. This ensures that DJED can always be redeemed for ADA, as long as the reserve ratio is healthy.
- **Incentives:** Shen holders earn a share of the protocol fees generated from minting and burning DJED and SHEN. This incentivizes users to provide collateral and support the system’s stability.

By separating the stablecoin (DJED) from the reservecoin (SHEN), the protocol creates a clear distinction between users seeking stability (DJED holders) and those willing to take on risk in exchange for potential rewards (SHEN holders). This dual-token model is fundamental to Djed’s ability to maintain its peg and operate in a decentralized, algorithmic manner.
