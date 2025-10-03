import ConnectWallet from "../components/ConnectWallet";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">BlockLance</h1>
      <ConnectWallet />
    </div>
  );
}
