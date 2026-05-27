export default function Page() {
  const handleClick = () => {
    throw new Error('click handler exploded');
  };
  return <button onClick={handleClick}>Click me</button>;
}
