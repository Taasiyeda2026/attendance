import { useState } from "react";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, action: "login" }),
      });
      const responseText = await response.text();

      if (!responseText) {
        throw new Error("Empty response from server");
      }

      let data: { success?: boolean; message?: string; records?: unknown[] };

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Invalid JSON response:", responseText, parseError);
        throw new Error("Invalid response from server");
      }

      const records = Array.isArray(data.records) ? data.records : [];
      
      if (data.success) {
        setIsLoggedIn(true);
      } else {
        console.warn("Login failed response records:", records);
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-5">
        <div className="bg-white p-12 rounded-2xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">ברוכים הבאים!</h2>
          <p className="text-slate-600">התחברת בהצלחה למערכת הנוכחות</p>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="mt-6 px-6 py-3 bg-blue-800 text-white rounded-xl font-medium hover:bg-blue-900 transition-all"
          >
            התנתק
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="loginScreen" className="min-h-screen flex items-center justify-center bg-slate-100 p-5">
      <div className="login-card bg-white p-12 rounded-2xl shadow-lg border border-slate-200 max-w-md w-full text-center hover:shadow-xl transition-all">
        <h2 className="text-3xl font-semibold text-slate-800 mb-2">מערכת נוכחות</h2>
        <p className="text-slate-500 mb-8">הזן את פרטי ההתחברות שלך</p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group mb-5 text-right">
            <label className="block mb-2 text-slate-600 font-medium text-sm">שם משתמש</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 border-2 border-slate-200 rounded-xl text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              required
            />
          </div>
          
          <div className="form-group mb-5 text-right">
            <label className="block mb-2 text-slate-600 font-medium text-sm">סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border-2 border-slate-200 rounded-xl text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 mb-4 text-sm">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 bg-blue-800 text-white rounded-xl text-base font-semibold cursor-pointer hover:bg-blue-900 hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "מתחבר..." : "התחבר"}
          </button>
        </form>
      </div>
    </div>
  );
}
