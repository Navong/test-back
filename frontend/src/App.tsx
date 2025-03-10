import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [newNote, setNewNote] = useState('');

  const fetchNotes = async ({ queryKey }) => {
    const address = queryKey[1];
    if (!address) return [];
    const response = await fetch(`http://localhost:4000/api/notes?address=${address}`);
    const data = await response.json();
    return data.notes;
  };

  const { data: notes = [], refetch } = useQuery(['notes', account.address], fetchNotes, {
    enabled: !!account.address,
  });

  const addNoteMutation = useMutation(async (note) => {
    const response = await fetch('http://localhost:4000/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: account.address, note }),
    });
    return response.json();
  }, {
    onSuccess: () => {
      refetch(); // Refresh notes after adding a new one
      setNewNote('');
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4">AI-Note MetaMask Login</h2>

        <div>
          <h2>Account</h2>
          <div>
            status: {account.status}
            <br />
            address: {account.address}
            <br />
            chainId: {account.chainId}
          </div>
        </div>

        {account.status === 'connected' ? (
          <>
            <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded" onClick={() => disconnect()}>
              Disconnect
            </button>
            <div className="mt-6">
              <h2 className="text-xl font-bold">Your Notes</h2>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="border p-2 rounded w-full mt-2"
                placeholder="Write a note..."
              />
              <button
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
                onClick={() => addNoteMutation.mutate(newNote)}
              >
                Add Note
              </button>
              <ul className="mt-4 text-left">
                {notes.map((note) => (
                  <li key={note._id} className="bg-gray-200 p-2 rounded mt-2">
                    {note.note}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div>
            <h2>Connect</h2>
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                className="px-4 py-2 bg-blue-500 text-white rounded m-2"
              >
                {connector.name}
              </button>
            ))}
            <div>{status}</div>
            <div>{error?.message}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppWrapper;
