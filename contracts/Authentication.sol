// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IGarmentRegistry.sol";

contract Authentication {
    address public owner;
    IGarmentRegistry public garmentRegistry;

    struct AuthenticationCheck {
        uint256 garmentId;
        address checkedBy;
        string result;
        uint256 timestamp;
    }

    mapping(uint256 => AuthenticationCheck[]) private authenticationHistory;

    constructor(address _garmentRegistryAddress) {
        owner = msg.sender;
        garmentRegistry = IGarmentRegistry(_garmentRegistryAddress);
    }

    function checkAuthenticity(uint256 _garmentId) external returns (string memory) {
        require(garmentRegistry.isGarmentRegistered(_garmentId), "Garment not registered");

        string memory result;

        if (garmentRegistry.isGarmentVerified(_garmentId)) {
            result = "Authentic garment";
        } else {
            result = "Garment registered but not verified";
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