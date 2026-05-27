export default function Page() {
  const data = JSON.parse('not valid json {{{');
  return <div>{data.name}</div>;
}
