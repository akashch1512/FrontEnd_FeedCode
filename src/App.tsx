import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { Play, Mic, Terminal, Code2 } from 'lucide-react';

// Types
interface Problem {
  id: number;
  title: string;
  difficulty: string;
  description: string;
  template: string;
  test_case: string;
}

const API_URL = "http://localhost:8000";

function App() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    const res = await axios.get(`${API_URL}/problems`);
    setProblems(res.data);
    if (res.data.length > 0) selectProblem(res.data[0]);
  };

  const selectProblem = (prob: Problem) => {
    setActiveProblem(prob);
    // Append test case to template for easier execution
    setCode(prob.template + "\n\n# Test Case\n" + prob.test_case);
    setOutput("");
  };

  const runCode = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/execute`, { code, language: "python" });
      if (res.data.run) {
        setOutput(res.data.run.stdout || res.data.run.stderr);
      }
    } catch (err) {
      setOutput("Error connecting to execution engine.");
    }
    setLoading(false);
  };

  const askAI = async () => {
    if (!activeProblem) return;
    setAiThinking(true);
    try {
      const response = await axios.post(
        `${API_URL}/ask-ai`, 
        { code, problem_id: activeProblem.id },
        { responseType: 'blob' } // Important for audio
      );

      // Play Audio
      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      audio.play();
      
      setOutput((prev: string) => prev + "\n\n[AI Mentor is speaking...]");
    } catch (err) {
      console.error(err);
      setOutput((prev: string) => prev + "\n\n[AI Error: Could not generate hint]");
    }
    setAiThinking(false);
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-gray-300 flex flex-col font-sans">
      {/* Header */}
      <header className="h-14 border-b border-gray-700 flex items-center px-6 bg-[#252526]">
        <Code2 className="text-blue-500 mr-2" />
        <h1 className="font-bold text-lg text-white">CodeVoice <span className="text-xs font-normal text-gray-500">AI Platform</span></h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Problem List */}
        <div className="w-64 bg-[#252526] border-r border-gray-700 flex flex-col">
          <div className="p-4 font-semibold text-gray-400 uppercase text-xs tracking-wider">Problems</div>
          {problems.map((p: Problem) => (
            <div 
              key={p.id}
              onClick={() => selectProblem(p)}
              className={`px-4 py-3 cursor-pointer hover:bg-[#37373d] transition-colors ${activeProblem?.id === p.id ? 'bg-[#37373d] border-l-2 border-blue-500' : ''}`}
            >
              <div className="text-sm font-medium text-white">{p.id}. {p.title}</div>
              <div className={`text-xs mt-1 ${p.difficulty === 'Easy' ? 'text-green-400' : 'text-yellow-400'}`}>
                {p.difficulty}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Problem Description Panel */}
          <div className="h-1/3 border-b border-gray-700 p-6 overflow-y-auto bg-[#1e1e1e]">
             {activeProblem ? (
               <>
                 <h2 className="text-2xl font-bold text-white mb-2">{activeProblem.title}</h2>
                 <p className="text-gray-400 mb-4">{activeProblem.description}</p>
                 <div className="bg-[#2d2d2d] p-3 rounded text-sm font-mono text-gray-300">
                    Input/Output examples would go here...
                 </div>
               </>
             ) : <p>Select a problem</p>}
          </div>

          {/* Editor & Output Split */}
          <div className="flex-1 flex">
            {/* Code Editor */}
            <div className="flex-1 border-r border-gray-700 relative">
              <Editor
                height="100%"
                theme="vs-dark"
                language="python"
                value={code}
                onChange={(val: string | undefined) => setCode(val || "")}
                options={{ minimap: { enabled: false }, fontSize: 14 }}
              />
              
              {/* Floating Action Buttons */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button 
                  onClick={askAI}
                  disabled={aiThinking}
                  className={`flex items-center gap-2 px-4 py-2 rounded shadow-lg font-medium transition-all ${
                    aiThinking ? 'bg-purple-700 cursor-not-allowed animate-pulse' : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  <Mic size={16} />
                  {aiThinking ? "Thinking..." : "Ask AI Hint"}
                </button>

                <button 
                  onClick={runCode}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded shadow-lg font-medium"
                >
                  <Play size={16} />
                  {loading ? "Running..." : "Run Code"}
                </button>
              </div>
            </div>

            {/* Output Panel */}
            <div className="w-1/3 bg-[#1e1e1e] flex flex-col">
              <div className="h-10 bg-[#252526] border-b border-gray-700 flex items-center px-4 text-xs font-semibold text-gray-400 uppercase">
                <Terminal size={14} className="mr-2" /> Console Output
              </div>
              <div className="flex-1 p-4 font-mono text-sm whitespace-pre-wrap text-gray-300 overflow-auto">
                {output || <span className="text-gray-600 italic">Run code to see output...</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;