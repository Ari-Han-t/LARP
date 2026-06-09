"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

export function PreferencesForm({ 
  initialFrequency, 
  initialTime,
  initialTimezone
}: { 
  initialFrequency: string, 
  initialTime: string,
  initialTimezone?: string
}) {
  const [frequency, setFrequency] = useState(initialFrequency);
  const [time, setTime] = useState(initialTime);
  const [timezone, setTimezone] = useState(initialTimezone || 'UTC');
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [timezones, setTimezones] = useState<string[]>([]);

  useEffect(() => {
    // Populate available timezones
    try {
      if ('supportedValuesOf' in Intl) {
        // @ts-ignore
        setTimezones(Intl.supportedValuesOf('timeZone'));
      } else {
        setTimezones(['UTC', Intl.DateTimeFormat().resolvedOptions().timeZone]);
      }
      
      // Auto-detect timezone if it's currently the default UTC
      if (initialTimezone === 'UTC') {
        const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (localTz) {
          setTimezone(localTz);
        }
      }
    } catch (e) {
      console.error(e);
      setTimezones(['UTC']);
    }
  }, [initialTimezone]);

  const handleSave = async () => {
    setIsLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailFrequency: frequency, emailTime: time, timezone })
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error("Failed to save settings", e);
    } finally {
      setIsLoading(false);
    }
  };

  const isDirty = frequency !== initialFrequency || time !== initialTime || timezone !== initialTimezone;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Frequency</label>
          <select 
            value={frequency} 
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="never">Never</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Time (Local)</label>
          <input 
            type="time" 
            value={time} 
            onChange={(e) => setTime(e.target.value)}
            disabled={frequency === 'never'}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Timezone</label>
          <select 
            value={timezone} 
            onChange={(e) => setTimezone(e.target.value)}
            disabled={frequency === 'never'}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value={timezone}>{timezone}</option>
            {timezones.filter(tz => tz !== timezone).map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button 
          onClick={handleSave}
          disabled={isLoading || !isDirty}
          className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Saved!
            </>
          ) : (
            "Save Preferences"
          )}
        </button>
      </div>
    </div>
  );
}
