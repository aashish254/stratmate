import { useState } from 'react';

function BadHook({ flag }) {
  if (flag) {
    const [n, setValue] = useState(0);
    return (
      <div>
        {n}
        <button onClick={() => setValue(n + 1)}>Increment</button>
      </div>
    );
  }
  return 'ok';
}

export default function Page() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>Bad Hook Example</h1>
      <BadHook flag={count % 2 === 0} />
      <button onClick={() => setCount(count + 1)}>Toggle Hook</button>
    </div>
  );
}
