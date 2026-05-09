// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChainTracker {
    address public owner;

    struct SupplyUpdate {
        uint256 garmentId;
        string status;
        string location;
        address updatedBy;
        uint256 timestamp;
    }

    mapping(address => bool) public authorisedStakeholders;
    mapping(uint256 => SupplyUpdate[]) private garmentHistory;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAuthorised() {
        require(authorisedStakeholders[msg.sender], "Not an authorised stakeholder");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function authoriseStakeholder(address _stakeholder, bool _isAuthorised) external onlyOwner {
        authorisedStakeholders[_stakeholder] = _isAuthorised;
    }

    function addSupplyUpdate(
        uint256 _garmentId,
        string memory _status,
        string memory _location
    ) external onlyAuthorised {
        garmentHistory[_garmentId].push(SupplyUpdate({
            garmentId: _garmentId,
            status: _status,
            location: _location,
            updatedBy: msg.sender,
            timestamp: block.timestamp
        }));
    }

    function getSupplyUpdateCount(uint256 _garmentId) external view returns (uint256) {
        return garmentHistory[_garmentId].length;
    }

    function getSupplyUpdate(uint256 _garmentId, uint256 _index) external view returns (SupplyUpdate memory) {
        require(_index < garmentHistory[_garmentId].length, "Update does not exist");
        return garmentHistory[_garmentId][_index];
    }
}