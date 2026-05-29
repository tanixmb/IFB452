// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GarmentRegistry {

    address public owner; // contract deployer

    struct Garment {
        uint256 id;
        string name;
        string description;
        string material;
        uint256 manufacturingYear;
        address manufacturer; // wallet that registered the garment
        bool isRegistered;
        bool isVerified;
    }

    mapping(uint256 => Garment) public garments; // garments stored by ID
    mapping(address => bool) public authorisedManufacturers; // approved manufacturers
    uint256 public totalGarments;

    // only the contract deployer can call this function
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // only approved manufacturers can call this function
    modifier onlyAuthorisedManufacturer() {
        require(authorisedManufacturers[msg.sender], "Not an authorised manufacturer");
        _;
    }

    // sets the owner to whoever deployed the contract
    constructor() {
        owner = msg.sender;
    }

    // owner can add or remove a manufacturer
    function authoriseManufacturer(address _manufacturer, bool _isAuthorised) external onlyOwner {
        authorisedManufacturers[_manufacturer] = _isAuthorised;
    }

    // registers a new garment on the blockchain
    // reverts if the garment ID already exists
    function registerGarment(
        uint256 _id,
        string memory _name,
        string memory _description,
        string memory _material,
        uint256 _manufacturingYear
    ) external onlyAuthorisedManufacturer {
        require(!garments[_id].isRegistered, "Garment already registered");

        garments[_id] = Garment({
            id: _id,
            name: _name,
            description: _description,
            material: _material,
            manufacturingYear: _manufacturingYear,
            manufacturer: msg.sender,
            isRegistered: true,
            isVerified: false // starts as false until owner verifies
        });

        totalGarments++;
    }

    // owner can verify a garment — sets isVerified to true
    function verifyGarment(uint256 _id) external onlyOwner {
        require(garments[_id].isRegistered, "Garment not registered");
        garments[_id].isVerified = true;
    }

    // returns the full garment struct for a given ID
    function getGarment(uint256 _id) external view returns (Garment memory) {
        require(garments[_id].isRegistered, "Garment not registered");
        return garments[_id];
    }

    // returns true if the garment is registered — called by other contracts via interface
    function isGarmentRegistered(uint256 _id) external view returns (bool) {
        return garments[_id].isRegistered;
    }

    // returns true if the garment is verified — called by Authentication via interface
    function isGarmentVerified(uint256 _id) external view returns (bool) {
        return garments[_id].isVerified;
    }
}