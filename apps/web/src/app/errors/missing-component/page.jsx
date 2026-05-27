import * as helpers from './helpers';

export default function Page() {
  const Widget = helpers.DoesNotExist;
  return <div>{Widget()}</div>;
}
