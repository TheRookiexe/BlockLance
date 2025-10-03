"use client"
import { useState } from "react";
import { ethers } from "ethers";

export default function ConnectWallet() {
  const [account, setAccount] = useState(null);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask not found! Please install it.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  }

  return (
    <div className="p-4">
      {account ? (
        <p className="text-green-600">Connected: {account}</p>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
