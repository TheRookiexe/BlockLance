"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { paymentTokenAbi, paymentTokenAddress } from "../constants/PaymentToken";
import { FreelancerMarketplaceAbi, marketplaceAddress } from "../constants/FreelanceMarketplace";

export default function ConnectWallet() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [jobPayment, setJobPayment] = useState("");

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask not found! Please install it.");
      return;
    }

    try {
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      await _provider.send("eth_requestAccounts", []);
      const _signer = _provider.getSigner();
      const userAddress = await _signer.getAddress();

      setAccount(userAddress);
      setProvider(_provider);
      setSigner(_signer);

      const _tokenContract = new ethers.Contract(paymentTokenAddress, paymentTokenAbi, _signer);
      const _marketplaceContract = new ethers.Contract(marketplaceAddress, FreelancerMarketplaceAbi, _signer);

      setTokenContract(_tokenContract);
      setMarketplaceContract(_marketplaceContract);

      const bal = await _tokenContract.balanceOf(userAddress);
      setBalance(ethers.utils.formatUnits(bal, 18));

      await fetchJobs(_marketplaceContract);
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  }

  async function fetchJobs(contract) {
    const jobCount = await contract.getJobCount();
    const jobList = [];
    for (let i = 0; i < jobCount; i++) {
      const job = await contract.jobs(i);
      jobList.push({
        id: i,
        description: job.description,
        payment: ethers.utils.formatUnits(job.payment, 18),
        postedBy: job.poster,
        claimedBy: job.claimedBy,
        completed: job.completed,
      });
    }
    setJobs(jobList);
  }

async function postJob() {
  if (!tokenContract || !marketplaceContract) {
    alert("Please connect your wallet first.");
    return;
  }

  if (!jobDescription || !jobPayment) {
    alert("Fill in job description and payment.");
    return;
  }

  try {
    const paymentAmount = ethers.utils.parseUnits(jobPayment, 18);

    const approveTx = await tokenContract.approve(marketplaceAddress, paymentAmount);
    await approveTx.wait();

    const tx = await marketplaceContract.postJob(jobDescription, paymentAmount);
    await tx.wait();

    alert("Job posted!");
    setJobDescription("");
    setJobPayment("");

    await fetchJobs(marketplaceContract);
  } catch (err) {
    console.error("Post job error:", err);
  }
}


  async function claimJob(jobId) {
    try {
      const tx = await marketplaceContract.claimJob(jobId);
      await tx.wait();
      await fetchJobs(marketplaceContract);
    } catch (err) {
      console.error("Claim job error:", err);
    }
  }

  async function completeJob(jobId) {
    try {
      const tx = await marketplaceContract.completeJob(jobId);
      await tx.wait();
      await fetchJobs(marketplaceContract);
    } catch (err) {
      console.error("Complete job error:", err);
    }
  }

  return (
    <div className="p-4">
      {!account ? (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <p className="text-green-600">Connected: {account}</p>
          <p className="text-blue-600">Token Balance: {balance} PAY</p>

          <div className="my-4">
            <h2 className="font-bold text-lg">Post a Job</h2>
            <input
              type="text"
              placeholder="Job Description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="border px-2 py-1 mr-2"
            />
            <input
              type="text"
              placeholder="Payment in PAY"
              value={jobPayment}
              onChange={(e) => setJobPayment(e.target.value)}
              className="border px-2 py-1 mr-2"
            />
            <button
              onClick={postJob}
              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Post Job
            </button>
          </div>

          <div>
            <h2 className="font-bold text-lg">Jobs</h2>
            <ul>
              {jobs.map((job) => (
                <li key={job.id} className="mb-2">
                  {job.description} - {job.payment} PAY
                  <br />
                  Posted by: {job.postedBy} <br />
                  Claimed by: {job.claimedBy || "Not claimed"} <br />
                  Status: {job.completed ? "Completed" : "Pending"} <br />
                  {!job.claimedBy && (
                    <button
                      onClick={() => claimJob(job.id)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 mr-2"
                    >
                      Claim Job
                    </button>
                  )}
                  {job.claimedBy === account && !job.completed && (
                    <button
                      onClick={() => completeJob(job.id)}
                      className="px-2 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Complete Job
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
