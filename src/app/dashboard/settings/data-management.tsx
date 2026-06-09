"use client";

import { useState } from "react";
import { Download, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";

export function DataManagement() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/account/delete', {
        method: 'DELETE'
      });
      if (res.ok) {
        // Log out immediately after successful deletion
        await signOut({ callbackUrl: '/' });
      } else {
        alert('Failed to delete account. Please try again.');
        setIsDeleting(false);
        setShowConfirm(false);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to delete account.');
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Data */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h3 className="font-medium text-neutral-900 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            Download a comprehensive JSON backup of all your check-ins, generated posts, and chat history.
          </p>
        </div>
        <a 
          href="/api/account/export"
          className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
          download
        >
          Download JSON
        </a>
      </div>

      {/* Delete Account */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-red-600 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete Account
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            Permanently delete your account and remove all data from our servers. This action cannot be undone.
          </p>
        </div>
        
        {!showConfirm ? (
          <button 
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Delete Account
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-red-50 p-2 rounded-lg border border-red-200">
            <span className="text-xs text-red-700 font-medium px-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Are you sure?
            </span>
            <button 
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1.5 text-xs font-medium bg-white border rounded hover:bg-neutral-50"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
            >
              {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              Confirm Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
