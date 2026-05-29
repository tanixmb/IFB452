# IFB452 Blockchain Technology — Fashion Supply Chain Tracker

**Students:** Tanya Balakrishnan — N11292971 and Teepo Penjweny - N11591307
**Group:** 77
**Unit:** IFB452 Blockchain Technology — QUT  

---

## Project Overview

A blockchain-based fashion supply chain tracking and authentication system built with Solidity smart contracts deployed on a local Ethereum network via Ganache.

The system allows multiple stakeholders to track garments from production to final sale and allows customers to verify product authenticity directly on the blockchain.

---

## Smart Contracts

| Contract | Description |
|----------|-------------|
| `GarmentRegistry.sol` | Central contract. Registers garments, stores their details, and verifies them. Acts as the source of truth for the whole system. |
| `IGarmentRegistry.sol` | Interface. Defines the two functions other contracts call on GarmentRegistry. Keeps contracts decoupled. |
| `SupplyChainTracker.sol` | Records supply chain status updates as garments move through production. |
| `OwnershipTransfer.sol` | Handles ownership transfer from retailer to customer. Stores full transfer history. |
| `Authentication.sol` | Lets anyone check if a garment is authentic. Reads verification status from GarmentRegistry via the interface. |

---

## Stakeholders

| Role | Permissions |
|------|-------------|
| Admin | Deploys contracts, authorises wallets, verifies garments |
| Manufacturer | Registers new garments on the blockchain |
| Stakeholder | Logs supply chain status updates |
| Retailer | Transfers ownership to customers |
| Customer | Checks authenticity and views garment history |

---

## Tech Stack

- Solidity `^0.8.0`
- Ethereum / Ganache (local test network)
- Remix IDE
- ethers.js v5
- MetaMask
- HTML / CSS / JavaScript (vanilla)
- QRCode.js

---

## Project Structure
IFB452 FINAL/
contracts/
GarmentRegistry.sol
IGarmentRegistry.sol
SupplyChainTracker.sol
OwnershipTransfer.sol
Authentication.sol
frontend/
index.html
app.js
README.md

---

## How to Run

1. Open Ganache and start a Quickstart Ethereum workspace
2. Open Remix Desktop and connect to Ganache Provider at `http://127.0.0.1:7545`
3. Deploy contracts in this order:
   - `GarmentRegistry` (no constructor args)
   - `SupplyChainTracker` (paste GarmentRegistry address)
   - `OwnershipTransfer` (paste GarmentRegistry address)
   - `Authentication` (paste GarmentRegistry address)
4. Update contract addresses in `frontend/index.html`
5. Update `ROLE_ACCOUNTS` in `frontend/app.js` with your Ganache account addresses
6. Import Ganache accounts into MetaMask on the Ganache network (`http://127.0.0.1:7545`, Chain ID `1337`)
7. Run `npx serve .` inside the frontend folder
8. Open `localhost:3000` in Chrome

---

## Demo Flow

1. Admin — authorise all stakeholder wallets
2. Manufacturer — register garment 101
3. Customer — check authenticity (shows "registered but not verified")
4. Stakeholder — add supply chain update
5. Admin — verify garment
6. Retailer — transfer ownership to customer
7. Customer — check authenticity again (shows "Authentic garment")
8. Customer — generate QR code
9. Demonstrate 3 failure cases (duplicate registration, unauthorised update, invalid garment ID)
