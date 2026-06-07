import React, { useState, useEffect } from 'react';
import { Server, Activity, Play, CheckCircle2, Loader2, Brain, Network, Database } from 'lucide-react';

// Models mock details for Ollama selector
const OLLAMA_MODELS = [
  { name: 'llama3.1:8b', size: '4.7 GB', vram: 5.4, description: 'Meta Meta-Llama-3.1-8B-Instruct' },
  { name: 'deepseek-coder:6.7b', size: '3.8 GB', vram: 4.5, description: 'DeepSeek Coder Instruct' },
  { name: 'gemma2:9b', size: '5.5 GB', vram: 6.2, description: 'Google Gemma-2-9B-It' },
  { name: 'phi3:medium', size: '7.9 GB', vram: 8.4, description: 'Microsoft Phi-3-Medium-128k' },
  { name: 'none (unload)', size: '0 GB', vram: 0.0, description: 'Clear GPU RAM' }
];

export default function HomelabMonitor() {
  // Global dashboard stats (updated in interval)
  const [globalCpu, setGlobalCpu] = useState(24);
  const [globalRam, setGlobalRam] = useState(38.2); // out of 64GB
  const [networkSpeed, setNetworkSpeed] = useState({ rx: 42.1, tx: 12.8 });
  const [cpuHistory, setCpuHistory] = useState([20, 25, 22, 28, 24, 21, 26, 23, 25, 24]);

  // Proxmox instances mock state
  const [nodes, setNodes] = useState([
    { name: 'pve-master', type: 'Node', status: 'online', cpu: 12, ram: '32.4 GB / 64 GB', ip: '10.0.0.10', uptime: '45d 12h' },
    { name: 'ollama-core', type: 'LXC', status: 'running', cpu: 4, ram: '1.2 GB / 16 GB', ip: '10.0.0.22', uptime: '12d 8h' },
    { name: 'n8n-automation', type: 'LXC', status: 'running', cpu: 1, ram: '0.8 GB / 4 GB', ip: '10.0.0.25', uptime: '12d 8h' },
    { name: 'truenas-core', type: 'VM', status: 'running', cpu: 7, ram: '3.8 GB / 16 GB', ip: '10.0.0.15', uptime: '112d 3h' }
  ]);

  // Ollama specific interactive state
  const [currentModel, setCurrentModel] = useState(OLLAMA_MODELS[0]);
  const [ollamaStatus, setOllamaStatus] = useState<'idle' | 'loading' | 'ready'>('ready');
  const [loadProgress, setLoadProgress] = useState(100);
  const [gpuVram, setGpuVram] = useState(5.4); // Max 12 GB

  // n8n workflow interactive state
  const [n8nStatus, setN8nStatus] = useState<'idle' | 'running' | 'success'>('idle');
  const [activeWorkflowNode, setActiveWorkflowNode] = useState<number | null>(null);
  const [workflowLog, setWorkflowLog] = useState<string[]>(['System waiting for trigger.']);

  // Dynamic simulation updates
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Update global metrics with slight fluctuations
      setGlobalCpu(prev => {
        const diff = Math.floor(Math.random() * 9) - 4; // -4 to +4
        const next = Math.max(15, Math.min(75, prev + diff));
        // Add to history
        setCpuHistory(hist => [...hist.slice(1), next]);
        return next;
      });

      setGlobalRam(prev => {
        const diff = (Math.random() * 0.4) - 0.2; // -0.2 to +0.2
        return parseFloat(Math.max(37.5, Math.min(41.0, prev + diff)).toFixed(2));
      });

      setNetworkSpeed({
        rx: parseFloat((25 + Math.random() * 30).toFixed(1)),
        tx: parseFloat((5 + Math.random() * 10).toFixed(1))
      });

      // 2. Update Proxmox Node CPU loads randomly
      setNodes(prev =>
        prev.map(n => {
          const cpuDiff = Math.floor(Math.random() * 5) - 2;
          return {
            ...n,
            cpu: Math.max(1, Math.min(99, n.cpu + cpuDiff))
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Ollama Model Switcher Logic
  const handleModelChange = async (modelName: string) => {
    const selected = OLLAMA_MODELS.find(m => m.name === modelName);
    if (!selected) return;

    setOllamaStatus('loading');
    setLoadProgress(0);

    // Simulate downloading/loading progress
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 10;
      setLoadProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        setCurrentModel(selected);
        setGpuVram(selected.vram);
        setOllamaStatus(selected.name.includes('none') ? 'idle' : 'ready');
      }
    }, 200);
  };

  // n8n pipeline trigger simulation
  const runWorkflow = () => {
    if (n8nStatus === 'running') return;

    setN8nStatus('running');
    setActiveWorkflowNode(0);
    setWorkflowLog(['[n8n] Trigger received: webhook post from Medium.']);

    // Step-by-step node animation timeline
    setTimeout(() => {
      setActiveWorkflowNode(1);
      setWorkflowLog(prev => [...prev, '[n8n] Requesting Medium RSS feed xml...']);
    }, 800);

    setTimeout(() => {
      setActiveWorkflowNode(2);
      setWorkflowLog(prev => [...prev, `[n8n] Sending text payload to Ollama (${currentModel.name === 'none (unload)' ? 'llama3.1:8b (auto-start)' : currentModel.name}) for automated summarization...`]);
    }, 1800);

    setTimeout(() => {
      setActiveWorkflowNode(3);
      setWorkflowLog(prev => [...prev, '[n8n] Sending summary push notification to Discord...']);
    }, 3200);

    setTimeout(() => {
      setActiveWorkflowNode(null);
      setN8nStatus('success');
      setWorkflowLog(prev => [...prev, '[n8n] Success: Workflow executed successfully. Site sync webhook triggered.']);
    }, 4200);
  };

  // SVG Chart path calculation
  const chartWidth = 400;
  const chartHeight = 80;
  const svgPath = cpuHistory
    .map((val, idx) => {
      const x = (idx / (cpuHistory.length - 1)) * chartWidth;
      // invert Y so larger CPU is higher up in SVG
      const y = chartHeight - (val / 100) * chartHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' L ');

  const areaPath = `${svgPath} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full font-mono text-xs">
      
      {/* LEFT COLUMN: METRICS & OLLAMA */}
      <div className="flex flex-col gap-8">
        
        {/* WIDGET 1: RESOURCE SUMMARY */}
        <div className="card-polished p-5 flex flex-col justify-between" style={{ minHeight: '220px' }}>
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-[#222] pb-2">
              <span className="text-[var(--green)] flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 animate-pulse" /> SYSTEM OVERVIEW
              </span>
              <span className="text-[var(--mid)]">PROXMOX HOST: ONLINE</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex flex-col">
                <span className="text-[var(--mid)] text-[10px]">CPU UTILITY</span>
                <span className="text-lg font-bold text-[var(--text)]">{globalCpu}%</span>
                <div className="w-full bg-[#222] h-1.5 rounded overflow-hidden mt-1">
                  <div className="bg-[var(--green)] h-full transition-all duration-500" style={{ width: `${globalCpu}%` }}></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[var(--mid)] text-[10px]">RAM USAGE</span>
                <span className="text-lg font-bold text-[var(--text)]">{globalRam} GB</span>
                <div className="w-full bg-[#222] h-1.5 rounded overflow-hidden mt-1">
                  <div className="bg-[var(--blue)] h-full transition-all duration-500" style={{ width: `${(globalRam/64)*100}%` }}></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[var(--mid)] text-[10px]">NET TRAFFIC</span>
                <span className="text-sm font-bold text-[var(--text)] flex flex-col leading-none mt-1">
                  <span>↓ {networkSpeed.rx} MB/s</span>
                  <span className="text-[var(--mid)] text-[10px] mt-0.5">↑ {networkSpeed.tx} MB/s</span>
                </span>
              </div>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="relative mt-2 h-[80px] bg-[#0c0c0c] border border-[#222] rounded overflow-hidden">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full preserve-3d">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--green)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#chartGrad)" />
              <path d={`M ${svgPath}`} fill="none" stroke="var(--green)" strokeWidth="1.5" className="transition-all duration-500" />
            </svg>
            <span className="absolute bottom-1 right-2 text-[8px] text-[var(--mid)]">CPU RUNNING HISTORY</span>
          </div>
        </div>

        {/* WIDGET 2: OLLAMA AI HUB */}
        <div className="card-polished p-5 flex flex-col justify-between" style={{ minHeight: '240px' }}>
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-[#222] pb-2">
              <span className="text-[var(--purple)] flex items-center gap-1">
                <Brain className="w-3.5 h-3.5" /> OLLAMA ENDPOINT
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${ollamaStatus === 'loading' ? 'bg-[var(--amber)] animate-ping' : ollamaStatus === 'idle' ? 'bg-[var(--mid)]' : 'bg-[var(--purple)]'}`}></span>
                <span className="text-[var(--mid)] text-[10px] uppercase">
                  {ollamaStatus === 'loading' ? 'loading model' : ollamaStatus === 'idle' ? 'idle (no model)' : 'ready'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[var(--mid)] text-[10px]">ACTIVE MODEL</div>
                  <div className="text-sm font-bold text-[var(--text)] mt-0.5">
                    {ollamaStatus === 'loading' ? 'Swapping Models...' : currentModel.name}
                  </div>
                  <div className="text-[var(--mid)] text-[10px] italic mt-0.5">{currentModel.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-[var(--mid)] text-[10px]">VRAM WEIGHT</div>
                  <div className="text-sm font-bold text-[var(--purple)] mt-0.5">{currentModel.size}</div>
                </div>
              </div>

              {/* Progress Bar (Visible during model changes) */}
              {ollamaStatus === 'loading' && (
                <div className="w-full">
                  <div className="flex justify-between text-[8px] text-[var(--amber)] mb-1">
                    <span>SYNHRONIZING GPU MEMORY CORES</span>
                    <span>{loadProgress}%</span>
                  </div>
                  <div className="w-full bg-[#222] h-1.5 rounded overflow-hidden">
                    <div className="bg-[var(--amber)] h-full transition-all duration-200" style={{ width: `${loadProgress}%` }}></div>
                  </div>
                </div>
              )}

              {/* GPU RAM Gauge */}
              <div className="w-full">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[var(--mid)]">RTX 3060 VRAM ALLOCATION</span>
                  <span className="text-[var(--text)] font-semibold">{gpuVram.toFixed(1)} GB / 12 GB</span>
                </div>
                <div className="w-full bg-[#222] h-2.5 rounded overflow-hidden flex">
                  <div className="bg-[var(--purple)] h-full transition-all duration-700" style={{ width: `${(gpuVram / 12) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Model Switcher Buttons */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[var(--mid)] text-[9px]">LOAD OLLAMA MODEL ON HOMELAB</span>
            <div className="flex flex-wrap gap-1.5">
              {OLLAMA_MODELS.map(model => (
                <button
                  key={model.name}
                  onClick={() => handleModelChange(model.name)}
                  disabled={ollamaStatus === 'loading'}
                  className={`px-2 py-1 border rounded text-[10px] cursor-pointer transition-all duration-200 ${
                    currentModel.name === model.name
                      ? 'border-[var(--purple)] bg-[var(--purple-dim)] text-[var(--purple)] font-semibold'
                      : 'border-[#333] bg-[#111] hover:border-[#555] hover:bg-[#1c1c1c] text-[var(--mid)] disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {model.name.split(':')[0]}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: PROXMOX NODES & N8N AUTOMATION */}
      <div className="flex flex-col gap-8">
        
        {/* WIDGET 3: PROXMOX INSTANCE LIST */}
        <div className="card-polished p-5 flex flex-col justify-between" style={{ minHeight: '220px' }}>
          <div>
            <div className="flex justify-between items-center mb-3 border-b border-[#222] pb-2">
              <span className="text-[var(--blue)] flex items-center gap-1">
                <Server className="w-3.5 h-3.5" /> PROXMOX INSTANCES
              </span>
              <span className="text-[var(--mid)]">VM & CONTAINERS (LXC)</span>
            </div>

            <div className="flex flex-col gap-2">
              {nodes.map(node => (
                <div key={node.name} className="flex justify-between items-center bg-[#101010] border border-[#222] p-2 rounded hover:border-[#333] transition-colors">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${node.status === 'online' || node.status === 'running' ? 'bg-[var(--green)]' : 'bg-[var(--red)]'}`}></span>
                    <div>
                      <span className="font-semibold text-[var(--text)]">{node.name}</span>
                      <span className="text-[var(--mid)] text-[9px] ml-1.5 border border-[#333] px-1 rounded bg-[#161616] uppercase">{node.type}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-right">
                    <div>
                      <div className="text-[var(--mid)] text-[8px]">CPU</div>
                      <div className="text-[var(--text)] text-[10px] font-semibold">{node.cpu}%</div>
                    </div>
                    <div>
                      <div className="text-[var(--mid)] text-[8px]">MEM</div>
                      <div className="text-[var(--text)] text-[10px] font-semibold">{node.ram.split(' ')[0]}G</div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-[var(--mid)] text-[8px]">IP ADDR</div>
                      <div className="text-[var(--mid)] text-[10px] font-semibold">{node.ip}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WIDGET 4: N8N PIPELINE RUNNER */}
        <div className="card-polished p-5 flex flex-col justify-between" style={{ minHeight: '240px' }}>
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-[#222] pb-2">
              <span className="text-[var(--amber)] flex items-center gap-1">
                <Network className="w-3.5 h-3.5" /> N8N WORKFLOW AUTOMATION
              </span>
              <button
                onClick={runWorkflow}
                disabled={n8nStatus === 'running'}
                className="flex items-center gap-1 text-[10px] bg-[var(--amber)] text-black px-2 py-0.5 rounded cursor-pointer font-bold border-none hover:opacity-85 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {n8nStatus === 'running' ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> RUNNING
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-black" /> TRIGGER RUN
                  </>
                )}
              </button>
            </div>

            {/* Workflow Nodes Grid */}
            <div className="flex items-center justify-between gap-1.5 bg-[#0c0c0c] border border-[#222] p-3 rounded mb-4 overflow-x-auto">
              
              {/* Node 1: Webhook */}
              <div className={`flex flex-col items-center p-1.5 border rounded flex-1 min-w-[65px] transition-all duration-300 ${
                activeWorkflowNode === 0 ? 'border-[var(--amber)] bg-[var(--amber-dim)]' : n8nStatus === 'success' || (n8nStatus === 'running' && activeWorkflowNode > 0) ? 'border-[var(--green)] text-[var(--green)]' : 'border-[#333]'
              }`}>
                <Activity className="w-4 h-4 mb-1" />
                <span className="text-[8px] uppercase font-bold text-center">Webhook</span>
              </div>

              {/* Arrow 1 */}
              <div className={`h-[1px] w-4 border-t border-dashed transition-all duration-300 ${
                n8nStatus === 'running' && activeWorkflowNode >= 1 ? 'border-[var(--amber)]' : n8nStatus === 'success' ? 'border-[var(--green)]' : 'border-[#333]'
              }`} />

              {/* Node 2: Feed Fetch */}
              <div className={`flex flex-col items-center p-1.5 border rounded flex-1 min-w-[65px] transition-all duration-300 ${
                activeWorkflowNode === 1 ? 'border-[var(--amber)] bg-[var(--amber-dim)]' : n8nStatus === 'success' || (n8nStatus === 'running' && activeWorkflowNode > 1) ? 'border-[var(--green)] text-[var(--green)]' : 'border-[#333]'
              }`}>
                <Database className="w-4 h-4 mb-1" />
                <span className="text-[8px] uppercase font-bold text-center">Feed Fetch</span>
              </div>

              {/* Arrow 2 */}
              <div className={`h-[1px] w-4 border-t border-dashed transition-all duration-300 ${
                n8nStatus === 'running' && activeWorkflowNode >= 2 ? 'border-[var(--amber)]' : n8nStatus === 'success' ? 'border-[var(--green)]' : 'border-[#333]'
              }`} />

              {/* Node 3: AI Inference */}
              <div className={`flex flex-col items-center p-1.5 border rounded flex-1 min-w-[65px] transition-all duration-300 ${
                activeWorkflowNode === 2 ? 'border-[var(--amber)] bg-[var(--amber-dim)]' : n8nStatus === 'success' || (n8nStatus === 'running' && activeWorkflowNode > 2) ? 'border-[var(--green)] text-[var(--green)]' : 'border-[#333]'
              }`}>
                <Brain className="w-4 h-4 mb-1" />
                <span className="text-[8px] uppercase font-bold text-center">AI Embed</span>
              </div>

              {/* Arrow 3 */}
              <div className={`h-[1px] w-4 border-t border-dashed transition-all duration-300 ${
                n8nStatus === 'running' && activeWorkflowNode >= 3 ? 'border-[var(--amber)]' : n8nStatus === 'success' ? 'border-[var(--green)]' : 'border-[#333]'
              }`} />

              {/* Node 4: Notify Discord */}
              <div className={`flex flex-col items-center p-1.5 border rounded flex-1 min-w-[65px] transition-all duration-300 ${
                activeWorkflowNode === 3 ? 'border-[var(--amber)] bg-[var(--amber-dim)]' : n8nStatus === 'success' ? 'border-[var(--green)]' : 'border-[#333]'
              }`}>
                <CheckCircle2 className="w-4 h-4 mb-1" />
                <span className="text-[8px] uppercase font-bold text-center">Sync Alert</span>
              </div>

            </div>
          </div>

          {/* n8n Log Output */}
          <div className="flex flex-col gap-1">
            <span className="text-[var(--mid)] text-[9px] uppercase">pipeline runtime log output</span>
            <div className="bg-[#0c0c0c] border border-[#222] p-2.5 rounded h-[85px] overflow-y-auto text-[9px] leading-tight text-[var(--mid)] font-mono">
              {workflowLog.map((log, idx) => (
                <div key={idx} className={`mb-1 ${log.includes('Success') || log.includes('success') ? 'text-[var(--green)]' : log.includes('Ollama') || log.includes('Trigger') ? 'text-[var(--text)]' : ''}`}>
                  &gt; {log}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
