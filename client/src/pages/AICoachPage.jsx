import React from 'react';
import AuraAIChat from '../components/ai/AuraAIChat.jsx';

export default function AICoachPage() {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#070B14]">
      <AuraAIChat isDrawer={false} />
    </div>
  );
}
