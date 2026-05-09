// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Authentication {
    address public owner;

    struct AuthenticationCheck {
        uint256 garmentId;
        address checkedBy;
        string result;
        uint256 timestamp;
    }

    mapping(uint256 => bool) public verifiedGarments;
    mapping(uint256 => AuthenticationCheck[]) private authenticationHistory;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setVerifiedGarment(uint256 _garmentId, bool _isVerified) external onlyOwner {
        verifiedGarments[_garmentId] = _isVerified;
    }

    function checkAuthenticity(uint256 _garmentId) external returns (string memory) {
        string memory result;

        if (verifiedGarments[_garmentId]) {
            result = "Authentic garment";
        } else {
            result = "Garment not verified";
        }

        authenticationHistory[_garmentId].push(AuthenticationCheck({
            garmentId: _garmentId,
            checkedBy: msg.sender,
            result: result,
            timestamp: block.timestamp
        }));

        return result;
    }

    function getAuthenticationCheckCount(uint256 _garmentId) external view returns (uint256) {
        return authenticationHistory[_garmentId].length;
    }

    function getAuthenticationCheck(uint256 _garmentId, uint256 _index) external view returns (AuthenticationCheck memory) {
        require(_index < authenticationHistory[_garmentId].length, "Authentication check does not exist");
        return authenticationHistory[_garmentId][_index];
    }
}