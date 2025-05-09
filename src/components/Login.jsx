import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import RequestResetPassword from "./RequestResetPassword"; // Pop-up pentru resetarea parolei

const Login = () => {
  const [email, setEmail] = useState(""); // Stare pentru email
  const [password, setPassword] = useState(""); // Stare pentru parolă
  const [error, setError] = useState(""); // Gestionarea erorilor
  const [showRequestPopup, setShowRequestPopup] = useState(false); // Controlează afișarea pop-up-ului de resetare
  const navigate = useNavigate(); // Hook pentru navigare între pagini
  const { login } = useContext(AuthContext); // Funcția de logare din context

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");
    if (storedEmail && storedPassword) {
      setEmail(storedEmail);
      setPassword(storedPassword);
      localStorage.removeItem("email");
      localStorage.removeItem("password");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Resetează erorile

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email sau parolă incorectă");
      return;
    }

    // Verificăm dacă email-ul este confirmat
    if (!data.user.email_confirmed_at) {
      setError(
        "Email-ul tău nu este confirmat. Te rugăm să verifici inbox-ul și să confirmi contul."
      );
      await supabase.auth.signOut(); // Deloghează utilizatorul neconfirmat
      return;
    }

    login(data.user); // Salvează datele utilizatorului în context

    // Dacă a fost setată o destinație de redirect (de ex., "redirectAfterLogin"), o folosim.
    const redirectTo = localStorage.getItem("redirectAfterLogin") || "/";
    navigate(redirectTo);
    localStorage.removeItem("redirectAfterLogin");
  };

  const handleSignUp = () => {
    navigate("/register"); // Navighează către pagina de înregistrare
  };

  const handleResetPassword = () => {
    setShowRequestPopup(true); // Afișează pop-up-ul pentru resetare
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
      <form
        onSubmit={handleLogin}
        className="relative bg-white p-6 rounded shadow-md w-80"
      >
        <button
          type="button"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={() => navigate("/")} // Închide fereastra de logare
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">Log In</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
            autoComplete="new-email"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-sky-900 text-white py-2 duration-100 active:scale-105 hover:bg-sky-800 active:bg-sky-700 rounded mb-4"
        >
          Log In
        </button>
        <button
          type="button"
          onClick={handleSignUp}
          className="w-full bg-sky-600 text-white py-2 duration-100 active:scale-105 hover:bg-sky-500 active:bg-sky-400 rounded"
        >
          Cont Nou
        </button>
        <button
          type="button"
          onClick={handleResetPassword}
          className="w-full text-sky-800 py-2 mt-2 rounded"
        >
          Reset Password
        </button>
      </form>

      {showRequestPopup && (
        <RequestResetPassword onClose={() => setShowRequestPopup(false)} />
      )}
    </div>
  );
};

export default Login;
