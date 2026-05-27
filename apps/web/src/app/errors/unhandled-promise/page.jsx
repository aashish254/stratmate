import { useEffect } from 'react';

export default function Fetcher() {
  useEffect(() => {
    fetch('/unknown'); // rejection with no catch
  }, []);
  return <div>unhandled promise</div>;
}
