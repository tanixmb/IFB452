const GANACHE_RPC_URL = "http://127.0.0.1:7545";
 
let provider = null;
let signer   = null;
let garmentRegistryContract    = null;
let supplyChainTrackerContract = null;
let ownershipTransferContract  = null;
let authenticationContract     = null;
 
const GARMENT_REGISTRY_ABI = [
  "function authoriseManufacturer(address _manufacturer, bool _isAuthorised) external",
  "function registerGarment(uint256 _id, string memory _name, string memory _description, string memory _material, uint256 _manufacturingYear) external",
  "function verifyGarment(uint256 _id) external",
  "function getGarment(uint256 _id) external view returns (tuple(uint256 id, string name, string description, string material, uint256 manufacturingYear, address manufacturer, bool isRegistered, bool isVerified))",
  "function isGarmentRegistered(uint256 _id) external view returns (bool)",
  "function isGarmentVerified(uint256 _id) external view returns (bool)",
  "function owner() external view returns (address)"
];
 
const SUPPLY_CHAIN_TRACKER_ABI = [
  "function authoriseStakeholder(address _stakeholder, bool _isAuthorised) external",
  "function addSupplyUpdate(uint256 _garmentId, string memory _status, string memory _location) external",
  "function getSupplyUpdateCount(uint256 _garmentId) external view returns (uint256)",
  "function getSupplyUpdate(uint256 _garmentId, uint256 _index) external view returns (tuple(uint256 garmentId, string status, string location, address updatedBy, uint256 timestamp))",
  "function authorisedStakeholders(address) external view returns (bool)"
];
 
const OWNERSHIP_TRANSFER_ABI = [
  "function authoriseRetailer(address _retailer, bool _isAuthorised) external",
  "function transferOwnership(uint256 _garmentId, address _customer) external",
  "function currentOwner(uint256 _garmentId) external view returns (address)",
  "function getOwnershipRecordCount(uint256 _garmentId) external view returns (uint256)",
  "function getOwnershipRecord(uint256 _garmentId, uint256 _index) external view returns (tuple(uint256 garmentId, address previousOwner, address newOwner, uint256 timestamp))"
];
 
const AUTHENTICATION_ABI = [
  "function checkAuthenticity(uint256 _garmentId) external returns (string memory)",
  "function getAuthenticationCheckCount(uint256 _garmentId) external view returns (uint256)",
  "function getAuthenticationCheck(uint256 _garmentId, uint256 _index) external view returns (tuple(uint256 garmentId, address checkedBy, string result, uint256 timestamp))"
];
 
// ── helpers ──────────────────────────────────────────────────────
 
function setStatus(msg, connected = false) {
  const bar = document.getElementById("status-bar");
  bar.textContent = msg;
  bar.className = connected ? "status-bar connected" : "status-bar";
}
 
function setResult(id, msg, type = "") {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = "result" + (type ? " " + type : "");
}
 
function shortAddr(addr) {
  if (!addr || addr === "0x0000000000000000000000000000000000000000") return "none";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}
 
function fmtTime(ts) {
  return new Date(Number(ts) * 1000).toLocaleString();
}
 
// ── connect ──────────────────────────────────────────────────────
 
async function connectToGanache() {
  const pk        = document.getElementById("pk-input").value.trim();
  const addrReg   = document.getElementById("addr-registry").value.trim();
  const addrTrack = document.getElementById("addr-tracker").value.trim();
  const addrOwn   = document.getElementById("addr-ownership").value.trim();
  const addrAuthC = document.getElementById("addr-auth").value.trim();
 
  if (!pk)                                        { setStatus("Please paste your private key first"); return; }
  if (!addrReg || !addrTrack || !addrOwn || !addrAuthC) { setStatus("Please fill in all four contract addresses"); return; }
 
  try {
    setStatus("Connecting to Ganache...");
 
    provider = new ethers.providers.JsonRpcProvider(GANACHE_RPC_URL);
    signer   = new ethers.Wallet(pk, provider);
 
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(signer.address);
 
    garmentRegistryContract    = new ethers.Contract(addrReg,   GARMENT_REGISTRY_ABI,    signer);
    supplyChainTrackerContract = new ethers.Contract(addrTrack, SUPPLY_CHAIN_TRACKER_ABI, signer);
    ownershipTransferContract  = new ethers.Contract(addrOwn,   OWNERSHIP_TRANSFER_ABI,  signer);
    authenticationContract     = new ethers.Contract(addrAuthC, AUTHENTICATION_ABI,      signer);
 
    document.getElementById("auth-addr").value = signer.address;
 
    setStatus(
      "Connected — " + signer.address + "  |  " +
      parseFloat(ethers.utils.formatEther(balance)).toFixed(3) + " ETH  |  Chain " + network.chainId,
      true
    );
 
  } catch (err) {
    setStatus("Connection failed: " + err.message);
    console.error(err);
  }
}
 
// ── 1. authorise ─────────────────────────────────────────────────
 
async function authoriseAll() {
  if (!garmentRegistryContract) { setResult("auth-result", "Not connected.", "error"); return; }
  const addr = document.getElementById("auth-addr").value.trim();
  if (!addr) { setResult("auth-result", "Address is empty.", "error"); return; }
 
  try {
    setResult("auth-result", "Sending 3 transactions...");
    const tx1 = await garmentRegistryContract.authoriseManufacturer(addr, true); await tx1.wait();
    const tx2 = await supplyChainTrackerContract.authoriseStakeholder(addr, true); await tx2.wait();
    const tx3 = await ownershipTransferContract.authoriseRetailer(addr, true); await tx3.wait();
    setResult("auth-result",
      "Authorised as manufacturer, stakeholder & retailer\nAddress: " + addr,
      "success"
    );
  } catch (err) {
    setResult("auth-result", "Error: " + (err.reason || err.message), "error");
  }
}
 
// ── 2. register ──────────────────────────────────────────────────
 
async function registerGarment() {
  if (!garmentRegistryContract) { setResult("reg-result", "Not connected.", "error"); return; }
  const id   = parseInt(document.getElementById("reg-id").value);
  const name = document.getElementById("reg-name").value.trim();
  const desc = document.getElementById("reg-desc").value.trim();
  const mat  = document.getElementById("reg-material").value.trim();
  const year = parseInt(document.getElementById("reg-year").value);
 
  try {
    setResult("reg-result", "Registering garment " + id + "...");
    const tx = await garmentRegistryContract.registerGarment(id, name, desc, mat, year);
    const receipt = await tx.wait();
    setResult("reg-result",
      "Garment " + id + " registered\nTx: " + receipt.transactionHash + "\nBlock: " + receipt.blockNumber,
      "success"
    );
  } catch (err) {
    setResult("reg-result", "Error: " + (err.reason || err.message), "error");
  }
}
 
// ── 3. supply update ─────────────────────────────────────────────
 
async function addSupplyUpdate() {
  if (!supplyChainTrackerContract) { setResult("sc-result", "Not connected.", "error"); return; }
  const id  = parseInt(document.getElementById("sc-id").value);
  const st  = document.getElementById("sc-status").value.trim();
  const loc = document.getElementById("sc-location").value.trim();
 
  try {
    setResult("sc-result", "Adding supply update...");
    const tx = await supplyChainTrackerContract.addSupplyUpdate(id, st, loc);
    const receipt = await tx.wait();
    setResult("sc-result",
      "Update recorded\nTx: " + receipt.transactionHash + "\nBlock: " + receipt.blockNumber,
      "success"
    );
  } catch (err) {
    setResult("sc-result", "Error: " + (err.reason || err.message), "error");
  }
}
 
async function getSupplyHistory() {
  if (!supplyChainTrackerContract) return;
  const id = parseInt(document.getElementById("sc-id").value);
  const ul = document.getElementById("history-list");
  ul.innerHTML = "<li>Loading...</li>";
 
  try {
    const count = await supplyChainTrackerContract.getSupplyUpdateCount(id);
    ul.innerHTML = "";
    if (count.toNumber() === 0) {
      ul.innerHTML = "<li>No updates yet.</li>";
      return;
    }
    for (let i = 0; i < count.toNumber(); i++) {
      const u = await supplyChainTrackerContract.getSupplyUpdate(id, i);
      const li = document.createElement("li");
      li.innerHTML = "<strong>#" + (i + 1) + " " + u.status + "</strong> — " + u.location + " — " + fmtTime(u.timestamp);
      ul.appendChild(li);
    }
  } catch (err) {
    ul.innerHTML = "<li style='color:red'>" + (err.reason || err.message) + "</li>";
  }
}
 
// ── 4. verify ────────────────────────────────────────────────────
 
async function verifyGarment() {
  if (!garmentRegistryContract) { setResult("verify-result", "Not connected.", "error"); return; }
  const id = parseInt(document.getElementById("verify-id").value);
 
  try {
    setResult("verify-result", "Verifying garment " + id + "...");
    const tx = await garmentRegistryContract.verifyGarment(id);
    const receipt = await tx.wait();
    setResult("verify-result",
      "Garment " + id + " verified — isVerified = true\nTx: " + receipt.transactionHash + "\nBlock: " + receipt.blockNumber,
      "success"
    );
  } catch (err) {
    setResult("verify-result", "Error: " + (err.reason || err.message), "error");
  }
}
 
// ── 5. transfer ownership ────────────────────────────────────────
 
async function transferOwnership() {
  if (!ownershipTransferContract) { setResult("ot-result", "Not connected.", "error"); return; }
  const id  = parseInt(document.getElementById("ot-id").value);
  const cus = document.getElementById("ot-customer").value.trim();
  if (!cus) { setResult("ot-result", "Enter a customer address.", "error"); return; }
 
  try {
    setResult("ot-result", "Transferring ownership...");
    const tx = await ownershipTransferContract.transferOwnership(id, cus);
    const receipt = await tx.wait();
    const cur = await ownershipTransferContract.currentOwner(id);
    setResult("ot-result",
      "Ownership transferred to " + shortAddr(cus) + "\nCurrent owner: " + cur + "\nTx: " + receipt.transactionHash,
      "success"
    );
  } catch (err) {
    setResult("ot-result", "Error: " + (err.reason || err.message), "error");
  }
}
 
// ── 6. check authenticity ────────────────────────────────────────
 
async function checkAuthenticity() {
  if (!authenticationContract) { setResult("check-result", "Not connected.", "error"); return; }
  const id = parseInt(document.getElementById("check-id").value);
 
  try {
    setResult("check-result", "Checking authenticity of garment " + id + "...");
    const tx = await authenticationContract.checkAuthenticity(id);
    const receipt = await tx.wait();
    const count = await authenticationContract.getAuthenticationCheckCount(id);
    const check = await authenticationContract.getAuthenticationCheck(id, count.toNumber() - 1);
    const ok = check.result === "Authentic garment";
    setResult("check-result",
      (ok ? "✓ " : "⚠ ") + check.result +
      "\nChecked by: " + shortAddr(check.checkedBy) +
      "\nTimestamp: " + fmtTime(check.timestamp) +
      "\nTx: " + receipt.transactionHash,
      ok ? "success" : ""
    );
  } catch (err) {
    setResult("check-result", "Error: " + (err.reason || err.message), "error");
  }
}
 
async function loadGarmentCard() {
  if (!garmentRegistryContract) return;
  const id = parseInt(document.getElementById("check-id").value);
  const table = document.getElementById("garment-table");
 
  try {
    const g = await garmentRegistryContract.getGarment(id);
    table.style.display = "table";
    table.innerHTML =
      "<tr><td>ID</td><td>" + g.id + "</td></tr>" +
      "<tr><td>Name</td><td>" + g.name + "</td></tr>" +
      "<tr><td>Description</td><td>" + g.description + "</td></tr>" +
      "<tr><td>Material</td><td>" + g.material + "</td></tr>" +
      "<tr><td>Mfg Year</td><td>" + g.manufacturingYear + "</td></tr>" +
      "<tr><td>Manufacturer</td><td>" + g.manufacturer + "</td></tr>" +
      "<tr><td>Registered</td><td>" + (g.isRegistered ? "✓ Yes" : "✗ No") + "</td></tr>" +
      "<tr><td>Verified</td><td>" + (g.isVerified ? "✓ Authentic" : "⚠ Not verified") + "</td></tr>";
  } catch (err) {
    table.style.display = "table";
    table.innerHTML = "<tr><td colspan='2' style='color:red'>" + (err.reason || err.message) + "</td></tr>";
  }
}
 
// ── 7. QR code ───────────────────────────────────────────────────
 
async function generateQR() {
  const id      = document.getElementById("qr-id").value;
  const addrReg = document.getElementById("addr-registry").value.trim();
  const section = document.getElementById("qr-section");
  const canvas  = document.getElementById("qr-canvas");
 
  const payload = JSON.stringify({
    system: "IFB452 Fashion Supply Chain",
    garmentId: parseInt(id),
    registry: addrReg || "not-set",
    network: "Ganache-5777",
    generated: new Date().toISOString()
  });
 
  try {
    await QRCode.toCanvas(canvas, payload, {
      width: 180,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" }
    });
    section.style.display = "block";
    document.getElementById("qr-label").textContent = "Garment #" + id + " — Scan to verify";
  } catch (err) {
    alert("QR error: " + err.message);
  }
}
 
// ── 8. failure cases ─────────────────────────────────────────────
 
async function testDuplicateRegistration() {
  if (!garmentRegistryContract) { setResult("fail-result", "Not connected.", "error"); return; }
  setResult("fail-result", "Attempting to register garment 101 again...");
  try {
    const tx = await garmentRegistryContract.registerGarment(101, "Duplicate", "Dup", "Dup", 2026);
    await tx.wait();
    setResult("fail-result", "Did not revert — make sure garment 101 is already registered first.", "");
  } catch (err) {
    setResult("fail-result",
      "✓ Revert confirmed\nExpected: \"Garment already registered\"\nGot: " + (err.reason || err.message),
      "success"
    );
  }
}
 
async function testUnauthorisedUpdate() {
  if (!supplyChainTrackerContract) { setResult("fail-result", "Not connected.", "error"); return; }
  setResult("fail-result", "Attempting supply update from random unauthorised wallet...");
  const rand = ethers.Wallet.createRandom().connect(provider);
  const c = new ethers.Contract(
    document.getElementById("addr-tracker").value.trim(),
    SUPPLY_CHAIN_TRACKER_ABI,
    rand
  );
  try {
    await c.estimateGas.addSupplyUpdate(101, "hack attempt", "unknown");
    setResult("fail-result", "Did not revert — unexpected.", "");
  } catch (err) {
    setResult("fail-result",
      "✓ Revert confirmed\nExpected: \"Not an authorised stakeholder\"\nGot: " + (err.reason || err.message) + "\nAddress: " + rand.address,
      "success"
    );
  }
}
 
async function testInvalidGarment() {
  if (!authenticationContract) { setResult("fail-result", "Not connected.", "error"); return; }
  setResult("fail-result", "Checking authenticity of garment 9999 (does not exist)...");
  try {
    const tx = await authenticationContract.checkAuthenticity(9999);
    await tx.wait();
    setResult("fail-result", "Did not revert — unexpected.", "");
  } catch (err) {
    setResult("fail-result",
      "✓ Revert confirmed\nExpected: \"Garment not registered\"\nGot: " + (err.reason || err.message),
      "success"
    );
  }
}
 