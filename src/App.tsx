import { useEffect, useState } from "react";
import { getMessage } from "./api";
import type { MessageResponse } from "./api";


function App() {
  const [data, setData] = useState<MessageResponse | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    getMessage()
      .then(setData)
      .catch(() => setError("Backend not reachable"));
  }, []);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      {data ? (
        <div>
          <h1 className="text-3xl font-bold">{data.message}</h1>
          <p className="text-gray-400">{data.status}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
