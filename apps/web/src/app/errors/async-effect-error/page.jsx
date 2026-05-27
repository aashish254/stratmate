import { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    const run = async () => {
      throw new Error('async effect exploded');
    };
    run();
  }, []);
  return <div>async effect error</div>;
}
