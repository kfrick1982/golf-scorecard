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
          <label className="block text-sm font-semibold text-gray-600 mb-2">Number of Players</label>
          <div className="flex gap-2">
            {[1,2,3,4].map(n => (
              <button key={n} onClick={() => setNumPlayers(n)}
                className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${numPlayers === n ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {n}
              </button>
            ))}
          </div>
        </div>
        {activePlayers.map((p, i) => (
          <div key={i} className="mb-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-bold text-green-700 uppercase mb-2">Player {i + 1}</p>
            <div className="flex gap-2">
              <input className={inputCls} placeholder="Name" value={p.name}
                onChange={e => handlePlayerChange(i, "name", e.target.value)} />
              <input className={`${inputCls} w-24`} placeholder="HCP" type="number" min="0" max="54" value={p.handicap}
                onChange={e => handlePlayerChange(i, "handicap", e.target.value)} />
            </div>
          </div>
        ))}
        <button disabled={!setupValid()} onClick={() => setScreen("holes")}
          className={`w-full mt-2 ${btnPrimary} ${!setupValid() ? "opacity-40 cursor-not-allowed" : ""}`}>
          Next: Enter Hole Details →
        </button>
      </div>
    </div>
  );

  if (screen === "holes") return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-600 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto p-6 mt-4">
        <h2 className="text-xl font-bold text-green-800 mb-1">Course Setup</h2>
        <p className="text-gray-500 text-sm mb-4">Enter Par and Stroke Index for each hole</p>
        <div className="grid grid-cols-4 gap-1 text-xs font-bold text-gray-500 uppercase mb-1 px-1">
          <span>Hole</span><span className="text-center">Par</span><span className="text-center">SI</span><span></span>
        </div>
        <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
          {holes.map((h, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 items-center bg-gray-50 rounded-lg px-2 py-1">
              <span className="text-sm font-bold text-green-700">{i + 1}</span>
              <input type="number" min="3" max="6" value={h.par} placeholder="Par"
                className="border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-500"
                onChange={e => handleHoleChange(i, "par", e.target.value)} />
              <input type="number" min="1" max="18" value={h.si} placeholder="SI"
                className="border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-500"
                onChange={e => handleHoleChange(i, "si", e.target.value)} />
              <span className="text-xs text-gray-400">{h.par ? `Par ${h.par}` : ""}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setScreen("setup")} className={btnSecondary}>← Back</button>
          <button disabled={!holesValid()} onClick={() => setScreen("scores")}
            className={`flex-1 ${btnPrimary} ${!holesValid() ? "opacity-40 cursor-not-allowed" : ""}`}>
            Start Scoring →
          </button>
        </div>
      </div>
    </div>
  );

  if (screen === "scores") {
    const hole = holes[holeView];
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-600 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto p-6 mt-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setHoleView(v => Math.max(0, v - 1))} disabled={holeView === 0}
              className="w-9 h-9 rounded-full bg-green-100 text-green-800 font-bold text-lg disabled:opacity-30 hover:bg-green-200">‹</button>
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase font-semibold">Hole</p>
              <p className="text-3xl font-bold text-green-800">{holeView + 1}</p>
              <p className="text-xs text-gray-500">Par {hole.par} · SI {hole.si}</p>
            </div>
            <button onClick={() => setHoleView(v => Math.min(HOLES - 1, v + 1))} disabled={holeView === HOLES - 1}
              className="w-9 h-9 rounded-full bg-green-100 text-green-800 font-bold text-lg disabled:opacity-30 hover:bg-green-200">›</button>
          </div>
          <div className="flex justify-center gap-1 mb-5 flex-wrap">
            {holes.map((_, i) => {
              const filled = activePlayers.every((_, pi) => scores[i][pi] !== "");
              return (
                <button key={i} onClick={() => setHoleView(i)}
                  className={`w-5 h-5 rounded-full text-xs font-bold transition-all ${i === holeView ? "bg-green-600 text-white scale-125" : filled ? "bg-green-300 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="space-y-3 mb-5">
            {activePlayers.map((p, pi) => {
              const pts = getStableford(holeView, pi);
              return (
                <div key={pi} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-700">{p.name}</p>
                    <p className="text-xs text-gray-400">HCP {p.handicap}</p>
                  </div>
                  <input type="number" min="1" max="20" value={scores[holeView][pi]}
                    placeholder="Strokes"
                    className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
                    onChange={e => handleScore(holeView, pi, e.target.value)} />
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-white text-lg
                    ${pts === null ? "bg-gray-200" : pts >= 4 ? "bg-yellow-500" : pts === 3 ? "bg-blue-500" : pts === 2 ? "bg-green-500" : pts === 1 ? "bg-orange-400" : "bg-red-400"}`}>
                    {pts !== null ? pts : "–"}
                    <span className="text-xs font-normal opacity-80">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-green-50 rounded-xl p-3 mb-4">
            <p className="text-xs font-bold text-green-700 uppercase mb-2">Running Totals</p>
            <div className="grid gap-1">
              {activePlayers.map((p, pi) => (
                <div key={pi} className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">{p.name}</span>
                  <span className="text-gray-500">{totalStrokes(pi)} strokes · <span className="font-bold text-green-700">{totalStableford(pi)} pts</span></span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={resetGame} className={btnSecondary}>New Game</button>
            <button onClick={() => setScreen("leaderboard")} className={`flex-1 ${btnPrimary}`}>Leaderboard 🏆</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "leaderboard") {
    const ranked = activePlayers.map((p, i) => ({
      name: p.name,
      strokes: totalStrokes(i),
      stableford: totalStableford(i),
    })).sort((a, b) => b.stableford - a.stableford);
    const medals = ["🥇", "🥈", "🥉", "4️⃣"];
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-600 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto p-6 mt-4">
          <div className="text-center mb-6">
            <div className="text-4xl mb-1">🏆</div>
            <h2 className="text-2xl font-bold text-green-800">Leaderboard</h2>
          </div>
          <div className="space-y-3 mb-6">
            {ranked.map((p, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-xl p-4 ${i === 0 ? "bg-yellow-50 border-2 border-yellow-400" : "bg-gray-50"}`}>
                <span className="text-2xl">{medals[i]}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-lg">{p.name}</p>
                  <p className="text-sm text-gray-500">{p.strokes} strokes</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-700">{p.stableford}</p>
                  <p className="text-xs text-gray-400">points</p>
                </div>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="px-2 py-1 text-left">Hole</th>
                  <th className="px-1 py-1">Par</th>
                  <th className="px-1 py-1">SI</th>
                  {activePlayers.map((p, i) => (
                    <th key={i} className="px-2 py-1" colSpan={2}>{p.name}</th>
                  ))}
                </tr>
                <tr className="bg-green-100 text-green-800 text-xs">
                  <th></th><th></th><th></th>
                  {activePlayers.map((_, i) => (
                    <>
                      <th key={`s${i}`} className="px-1 py-1">Str</th>
                      <th key={`p${i}`} className="px-1 py-1">Pts</th>
                    </>
                  ))}
                </tr>
              </thead>
              <tbody>
                {holes.map((h, hi) => (
                  <tr key={hi} className={hi % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-2 py-1 font-bold text-green-700">{hi + 1}</td>
                    <td className="px-1 py-1 text-center">{h.par}</td>
                    <td className="px-1 py-1 text-center text-gray-400">{h.si}</td>
                    {activePlayers.map((_, pi) => {
                      const pts = getStableford(hi, pi);
                      return (
                        <>
                          <td key={`s${pi}`} className="px-1 py-1 text-center">{scores[hi][pi] || "–"}</td>
                          <td key={`p${pi}`} className={`px-1 py-1 text-center font-bold ${pts === null ? "text-gray-300" : pts >= 3 ? "text-blue-600" : pts === 2 ? "text-green-600" : pts === 1 ? "text-orange-500" : "text-red-400"}`}>
                            {pts !== null ? pts : "–"}
                          </td>
                        </>
                      );
                    })}
                  </tr>
                ))}
                <tr className="bg-green-700 text-white font-bold">
                  <td className="px-2 py-1" colSpan={3}>Total</td>
                  {activePlayers.map((_, pi) => (
                    <>
                      <td key={`ts${pi}`} className="px-1 py-1 text-center">{totalStrokes(pi)}</td>
                      <td key={`tp${pi}`} className="px-1 py-1 text-center">{totalStableford(pi)}</td>
                    </>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setScreen("scores")} className={btnSecondary}>← Back</button>
            <button onClick={resetGame} className={`flex-1 ${btnPrimary}`}>New Game ⛳</button>
          </div>
        </div>
      </div>
    );
  }
}
