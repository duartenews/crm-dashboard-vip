"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Search,
  LogOut,
  MessageSquare,
  Calendar,
  MoreVertical,
  ChevronRight,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Lead {
  id: string;
  nome: string;
  instagram: string;
  lastMessage: string;
  stage: string;
  timestamp: string;
  avatar?: string;
}

const STAGES = [
  { id: "inicial", name: "Novos Leads", color: "bg-indigo-500" },
  { id: "contato", name: "Em Contato", color: "bg-blue-500" },
  { id: "proposta", name: "Proposta", color: "bg-amber-500" },
  { id: "venda", name: "Venda Feita", color: "bg-emerald-500" },
  { id: "perda", name: "Perda", color: "bg-rose-500" },
];

export default function Dashboard() {
  const { user, login, logout, loading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "leads"),
      where("vendedorId", "==", user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      setLeads(data);
    });

    return () => unsubscribe();
  }, [user]);

  const updateLeadStage = async (leadId: string, newStage: string) => {
    try {
      await updateDoc(doc(db, "leads", leadId), { stage: newStage });
    } catch (e) {
      console.error("Error updating stage:", e);
    }
  };

  if (loading || !user) return null;

  const filteredLeads = leads.filter(l =>
    l.nome?.toLowerCase().includes(search.toLowerCase()) ||
    l.instagram?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-6 glass">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold">M</div>
          <div>
            <h2 className="font-bold text-sm tracking-tight text-white/90">VIP CRM</h2>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Master Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl text-indigo-400 font-medium">
            <Users size={18} /> Leads
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
            <Calendar size={18} /> Schedule
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
            <MessageSquare size={18} /> Templates
          </button>
        </nav>

        <div className="mt-auto border-t border-white/5 pt-6">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.nome}</p>
              <p className="text-[10px] text-white/30 truncate uppercase tracking-tighter">{user.codigo}</p>
            </div>
            <button onClick={logout} className="text-white/30 hover:text-white">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent)]">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leads do Pipeline</h1>
            <p className="text-sm text-white/40">Gerencie seu funil de vendas em tempo real</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              type="text"
              placeholder="Pesquisar leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full pl-10 pr-6 py-2 w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm"
            />
          </div>
        </header>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto p-8 bg-black/20">
          <div className="flex gap-6 h-full min-w-max">
            {STAGES.map(stage => (
              <div key={stage.id} className="w-80 flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                    <h3 className="font-semibold text-sm uppercase tracking-widest text-white/60">{stage.name}</h3>
                    <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] text-white/40">
                      {filteredLeads.filter(l => (l.stage || 'inicial') === stage.id).length}
                    </span>
                  </div>
                  <button className="text-white/20 hover:text-white">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="flex-1 flex flex-col gap-3 min-h-[200px] overflow-y-auto pb-8">
                  {filteredLeads
                    .filter(l => (l.stage || 'inicial') === stage.id)
                    .map(lead => (
                      <div
                        key={lead.id}
                        className="lead-card group"
                        onDragStart={(e) => e.dataTransfer.setData("leadId", lead.id)}
                        draggable
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold overflow-hidden shadow-inner">
                              {lead.avatar ? <img src={lead.avatar} alt="" className="w-full h-full object-cover" /> : lead.nome?.[0] || 'L'}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-white/90 group-hover:text-white transition-colors">
                                {lead.nome || lead.instagram}
                              </p>
                              <p className="text-xs text-indigo-500 font-mono">
                                {lead.instagram.startsWith('@') ? lead.instagram : `@${lead.instagram}`}
                              </p>
                            </div>
                          </div>
                          <button className="text-white/0 group-hover:text-white/40 hover:text-white transition-all">
                            <ChevronRight size={16} />
                          </button>
                        </div>

                        {lead.lastMessage && (
                          <div className="bg-white/5 rounded-lg p-2 mb-3 border border-white/5">
                            <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">
                              {lead.lastMessage}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-white/30 font-medium">
                          <div className="flex items-center gap-1 group-hover:text-white/60 transition-colors">
                            <Calendar size={10} /> {lead.timestamp || 'N/A'}
                          </div>
                          <div className="flex -space-x-1">
                            <div className="w-4 h-4 rounded-full border border-black bg-indigo-500/50" />
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Ghost Drop Zone */}
                  <div
                    className="flex-1 min-h-[100px] rounded-2xl border-2 border-dashed border-white/0 hover:border-white/5 hover:bg-white/[0.01] transition-all"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const leadId = e.dataTransfer.getData("leadId");
                      updateLeadStage(leadId, stage.id);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
