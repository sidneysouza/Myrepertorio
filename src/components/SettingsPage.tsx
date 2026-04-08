import React from 'react';
import { User, Bell, Shield, CircleHelp, LogOut, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6 pb-32">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Ajustes</h1>

      <div className="bg-[#1C1B1F] rounded-[32px] p-2 border border-[#49454F]/20 mb-6">
        <div className="flex items-center gap-4 p-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
            S
          </div>
          <div>
            <h3 className="font-bold text-lg">Sidney Dev</h3>
            <p className="text-gray-500 text-sm">sidney.dev@gmail.com</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <SettingItem icon={<User size={20} />} label="Perfil" />
        <SettingItem icon={<Bell size={20} />} label="Notificações" />
        <SettingItem icon={<Shield size={20} />} label="Privacidade" />
        <SettingItem icon={<CircleHelp size={20} />} label="Ajuda e Suporte" />
        <div className="pt-4">
          <SettingItem icon={<LogOut size={20} />} label="Sair" danger />
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Stitch Player v1.0.0</p>
      </div>
    </div>
  );
}

function SettingItem({ icon, label, danger = false }: { icon: React.ReactNode, label: string, danger?: boolean }) {
  return (
    <button className={`w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors ${danger ? 'text-red-400' : 'text-gray-300'}`}>
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl ${danger ? 'bg-red-400/10' : 'bg-white/5'}`}>
          {icon}
        </div>
        <span className="font-bold">{label}</span>
      </div>
      <ChevronRight size={20} className="text-gray-600" />
    </button>
  );
}
