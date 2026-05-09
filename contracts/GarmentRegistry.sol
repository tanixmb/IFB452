// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GarmentRegistry {
    address public owner;

    struct Garment {
        uint256 id;
        string name;
        string description;
        string material;
        uint256 manufacturingYear;
        address manufacturer;
        bool isRegistered;
        bool isVerified;
    }

    mapping(uint256 => Garment) public garments;
    mapping(address => bool) public authorisedManufacturers;
    uint256 public totalGarments;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAuthorised() {
        require(authorisedManufacturers[msg.sender], "Not an authorised manufacturer");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function authoriseStakeholder(address _stakeholder, bool _isAuthorised) external onlyOwner {
        authorisedManufacturers[_stakeholder] = _isAuthorised;
    }

    function registerGarment(
        uint256 _id,
        string memory _name,
        string memory _description,
        string memory _material,
        uint256 _manufacturingYear
    ) external onlyAuthorised {
        require(!garments[_id].isRegistered, "Garment already registered");

        garments[_id] = Garment({
            id: _id,
            name: _name,
            description: _description,
            material: _material,
            manufacturingYear: _manufacturingYear,
            manufacturer: msg.sender,
            isRegistered: true,
            isVerified: false
        });

        totalGarments++;
    }

    function getGarment(uint256 _id) external view returns (Garment memory) {
        require(garments[_id].isRegistered, "Garment not registered");
        return garments[_id];
    }

    function verifyGarment(uint256 _id) external onlyOwner {
        require(garments[_id].isRegistered, "Garment not registered");
        garments[_id].isVerified = true;
    }
}