import { useState } from 'react'
import Composer from './components/Composer'
import GraphView from './components/GraphView'
import BlueprintList from './components/BlueprintList'

function App() {
  const [parsed, setParsed] = useState(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-blue-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.15),transparent_60%)]" />

      <div className="relative max-w-6xl mx-auto px-6 py-10">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold">BI</div>
            <div>
              <h1 className="text-2xl font-bold text-white">Blueprint Imperium</h1>
              <p className="text-blue-300/70 text-sm">Wizualizacja powiązań spółek i kontraktów z rozmowy zaczynającej się od „mordo”.</p>
            </div>
          </div>
          <a href="/test" className="text-sm text-blue-300/80 hover:text-white underline/30">Test połączenia</a>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Composer onParsed={setParsed} />
            <BlueprintList onSelect={setParsed} />
          </div>

          <div className="bg-slate-900/60 border border-blue-500/30 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold">Graf struktur i kontraktów</h2>
              {parsed && <span className="text-xs bg-blue-500/20 border border-blue-400/40 text-blue-100 px-2 py-1 rounded">{parsed.nodes?.length || 0} węzłów • {parsed.edges?.length || 0} powiązań</span>}
            </div>
            <div className="bg-slate-950/60 rounded-xl p-3 min-h-[560px] flex items-center justify-center">
              {parsed ? (
                <GraphView nodes={parsed.nodes} edges={parsed.edges} />
              ) : (
                <div className="text-blue-300/70 text-sm text-center">
                  Najpierw wklej rozmowę i kliknij „Parsuj do grafu”.<br />
                  Graf pojawi się tutaj i pokaże firmy oraz ich relacje i kontrakty.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
