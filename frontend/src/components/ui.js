"use client";
// src/components/Spinner.js
export function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// src/components/Alert.js
export function Alert({ type = "error", message }) {
  if (!message) return null;
  const styles = {
    error:   "bg-red-50 border-red-400 text-red-700",
    success: "bg-green-50 border-green-400 text-green-700",
    info:    "bg-blue-50 border-blue-400 text-blue-700",
  };
  return (
    <div className={`border-l-4 p-3 rounded text-sm ${styles[type]}`}>
      {message}
    </div>
  );
}
