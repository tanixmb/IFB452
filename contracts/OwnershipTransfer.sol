// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OwnershipTransfer {
    address public owner;

    struct OwnershipRecord {
        uint256 garmentId;
        address previousOwner;
        address newOwner;
        uint256 timestamp;
    }

    mapping(address => bool) public authorisedRetailers;
    mapping(uint256 => address) public currentOwner;
    mapping(uint256 => OwnershipRecord[]) private ownershipHistory;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyRetailer() {
        require(authorisedRetailers[msg.sender], "Not an authorised retailer");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function authoriseRetailer(address _retailer, bool _isAuthorised) external onlyOwner {
        authorisedRetailers[_retailer] = _isAuthorised;
    }

    function transferOwnership(uint256 _garmentId, address _customer) external onlyRetailer {
        require(_customer != address(0), "Invalid customer address");

        address previous = currentOwner[_garmentId];

        currentOwner[_garmentId] = _customer;

        ownershipHistory[_garmentId].push(OwnershipRecord({
            garmentId: _garmentId,
            previousOwner: previous,
            newOwner: _customer,
            timestamp: block.timestamp
        }));
    }

    function getOwnershipRecordCount(uint256 _garmentId) external view returns (uint256) {
        return ownershipHistory[_garmentId].length;
    }

    function getOwnershipRecord(uint256 _garmentId, uint256 _index) external view returns (OwnershipRecord memory) {
        require(_index < ownershipHistory[_garmentId].length, "Ownership record does not exist");
        return ownershipHistory[_garmentId][_index];
    }
}