import { useState, useEffect } from 'react';
import { Workspace } from 'types';
import { Button } from '@/components/ui/button';

function App() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState<Workspace[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/workspaces')
      .then((response) => response.json())
      .then(({ data }) => {
        setData(data);
      });
  });

  return (
    <>
      <h1 className='font-bold text-red-500 text-6xl'>Vite + React</h1>
      <div className='card'>
        <Button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
        <p className='text-3xl'>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <h2>Workspaces</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}

export default App;
