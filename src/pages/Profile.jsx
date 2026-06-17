import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/ui/PageHeader";
import Spinner from "../components/ui/Spinner";
import ErrorAlert from "../components/ui/ErrorAlert";
import {
  FaUser, FaEnvelope, FaIdBadge, FaCalendarAlt, FaShieldAlt,
  FaCheck, FaTimes, FaSave, FaEdit
} from "react-icons/fa";

function Profile() {
  const { user, loading, error, clearError, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Populate form fields when user data is available or when entering edit mode
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleEdit = () => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
    setEditing(true);
    setSuccess("");
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
    setEditing(false);
    setSuccess("");
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    clearError();

    const result = await updateUser(name, email);

    if (result.success) {
      setSuccess("Profile updated successfully!");
      setEditing(false);
      // Success toast auto-clears after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none fixed left-0 top-0 h-72 w-72 rounded-full bg-purple-600/15 blur-3xl" />
      <div className="pointer-events-none fixed right-0 bottom-0 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />

      <PageHeader
        title="Profile"
        subtitle="Manage your account and personal information"
      />

      <ErrorAlert message={error} onDismiss={clearError} />

      {/* Success Toast */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-3 text-sm text-green-300"
          >
            <FaCheck className="text-green-400" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* Avatar Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-4xl font-bold text-white shadow-xl shadow-purple-500/20">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <h2 className="text-xl font-bold text-white">{user?.name || "User"}</h2>
            <p className="mt-1 text-sm text-slate-400">{user?.email || "No email"}</p>
            <div className="mt-4 flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-1.5 text-xs font-medium text-green-300">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Active Account
            </div>
          </div>
        </motion.div>

        {/* Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-purple-300/80">Details</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Account Information</h3>
            </div>
            {!editing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10"
              >
                <FaEdit />
                Edit Profile
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Full Name Field */}
            <div className="flex items-center gap-4 rounded-xl bg-slate-900/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <FaUser />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500">Full Name</p>
                {editing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white outline-none transition focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
                    placeholder="Your full name"
                  />
                ) : (
                  <p className="text-sm font-medium text-white truncate">{user?.name || "Not set"}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="flex items-center gap-4 rounded-xl bg-slate-900/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <FaEnvelope />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500">Email Address</p>
                {editing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white outline-none transition focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
                    placeholder="your@email.com"
                  />
                ) : (
                  <p className="text-sm font-medium text-white truncate">{user?.email || "Not set"}</p>
                )}
              </div>
            </div>

            {/* User ID (read-only) */}
            <div className="flex items-center gap-4 rounded-xl bg-slate-900/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                <FaIdBadge />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">User ID</p>
                <p className="text-sm font-mono text-white truncate">{user?._id || "N/A"}</p>
              </div>
            </div>

            {/* Account Status (read-only) */}
            <div className="flex items-center gap-4 rounded-xl bg-slate-900/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <FaShieldAlt />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Account Status</p>
                <p className="text-sm font-medium text-green-400">Verified & Active</p>
              </div>
            </div>
          </div>

          {/* Edit Actions */}
          {editing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex items-center gap-3"
            >
              <button
                onClick={handleSave}
                disabled={saving || !name.trim() || !email.trim()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Spinner size="sm" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaTimes />
                Cancel
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Profile;