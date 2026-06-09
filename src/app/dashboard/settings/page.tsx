import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { SettingsClient } from './settings-client';
import { PreferencesForm } from './preferences-form';

import { DataManagement } from './data-management';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  // Fetch connected accounts and user preferences
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { accounts: true }
  });

  if (!user) return redirect('/');

  const isLinkedInConnected = user.accounts.some(a => a.provider === 'linkedin');

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-neutral-500">Manage your connected accounts and preferences.</p>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Email Reminders</h2>
        <PreferencesForm 
          initialFrequency={user.emailFrequency} 
          initialTime={user.emailTime} 
          initialTimezone={user.timezone}
        />
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Integrations</h2>
        
        <div className="flex items-center justify-between py-4 border-b">
          <div>
            <h3 className="font-medium text-neutral-900">LinkedIn</h3>
            <p className="text-sm text-neutral-500">Connect to publish posts directly to your profile.</p>
          </div>
          <SettingsClient provider="linkedin" isConnected={isLinkedInConnected} />
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Data & Privacy</h2>
        <DataManagement />
      </div>
    </div>
  );
}
