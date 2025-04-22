import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email sau parolă incorectă");
    } else {
      login(data.user); // Salvează întregul obiect utilizator pentru a avea acces la ID
      navigate("/"); // Redirecționează la pagina principală
    }
  };

  const handleClose = () => {
    navigate("/");
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <form
        onSubmit={handleLogin}
        className="relative bg-white p-6 rounded shadow-md w-80"
      >
        <button
          type="button"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={handleClose}
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
          className="w-full text-grey-200 py-2 duration-100 active:scale-105 hover:text-sky-800 active:text-sky-700 rounded"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default Login;
