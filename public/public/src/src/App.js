import { useState } from "react";

const HOLES = 18;

function calcStableford(strokes, par, si, handicap) {
  if (strokes === 0) return null;
  const extraStrokes = Math.floor(handicap / 18) + (si <= (handicap % 18) ? 1 : 0);
  const net = strokes - par - extraStrokes;
  if (net <= -2) return 4;
  if (net === -1) return 3;
  if (net === 0) return 2;
  if (net === 1) return 1;
  return 0;
}

const defaultHoles = Array.from({ length: HOLES }, (_, i) => ({
  par: "",
  si: String(i + 1),
}));

export default function App() {
  const [screen, setScreen] = useState("setup");
  const [numPlayers, setNumPlayers] = useState(2);
  const [players, setPlayers] = useState([
    { name: "", handicap: "" },
    { name: "", handicap: "" },
    { name: "", handicap: "" },
    { name: "", handicap: "" },
  ]);
  const [holes, setHoles] = useState(defaultHoles);
  const [scores, setScores] = useState(
    Array.from({ length: HOLES }, () => Array(4).fill(""))
  );
  const [holeView, setHoleView] = useState(0);

  const activePlayers = players.slice(0, numPlayers);

  function handlePlayerChange(i, field, val) {
    setPlayers(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  }

  function setupValid() {
    return activePlayers.every(p => p.name.trim() && p.handicap !== "" && !isNaN(Number(p.handicap)));
  }

  function handleHoleChange(i, field, val) {
    setHoles(prev => prev.map((h, idx) => idx === i ? { ...h, [field]: val } : h));
  }

  function holesValid() {
    return holes.every(h => h.par !== "" && !isNaN(Number(h.par)) && h.si !== "" && !isNaN(Number(h.si)));
  }

  function handleScore(hole, player, val) {
    setScores(prev => prev.map((row, r) => r === hole ? row.map((v, c) => c === player ? val : v) : row));
  }

  function getStableford(holeIdx, playerIdx) {
    const s = Number(scores[holeIdx][playerIdx]);
    const par = Number(holes[holeIdx].par);
    const si = Number(holes[holeIdx].si);
    const hc = Number(activePlayers[playerIdx].handicap);
    if (!s) return null;
    return calcStableford(s, par, si, hc);
  }

  function totalStrokes(playerIdx) {
    return scores.reduce((sum, row) => {
      const v = Number(row[playerIdx]);
      return sum + (v > 0 ? v : 0);
    }, 0);
  }

  function totalStableford(playerIdx) {
    return holes.reduce((sum, _, hi) => {
      const pts = getStableford(hi, playerIdx);
      return sum + (pts !== null ? pts : 0);
    }, 0);
  }

  function resetGame() {
    setScores(Array.from({ length: HOLES }, () => Array(4).fill("")));
    setHoles(defaultHoles);
    setPlayers([{ name: "", handicap: "" }, { name: "", handicap: "" }, { name: "", handicap: "" }, { name: "", handicap: "" }]);
    setNumPlayers(2);
    setHoleView(0);
    setScreen("setup");
  }

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";
  const btnPrimary = "bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 active:scale-95 transition-all";
  const btnSecondary = "bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 active:scale-95 transition-all";

  if (screen === "setup") return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-600 flex items-start justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mt-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-1">⛳</div>
          <h1 className="text-2xl font-bold text-green-800">Golf Scorecard</h1>
          <p className="text-gray-500 text-sm">Stableford & Stroke Play</p>
        </div>
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gr
