export default function WaitingOn({waitingOn}) {
  return (
      <h5>Waiting on {waitingOn.map(p => p.playerName).join(", ")}</h5>
  );
}