// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGarmentRegistry {
    function isGarmentRegistered(uint256 _garmentId) external view returns (bool);
    function isGarmentVerified(uint256 _garmentId) external view returns (bool);
}