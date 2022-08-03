export default function WaitingOn({waitingOn}) {
  return (
      <p>Waiting on {waitingOn.map(p => p.playerName).join(", ")}</p>
  );
}