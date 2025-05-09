import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    subscribe: false, // Adăugăm câmp pentru checkbox-ul de abonare
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Resetăm toate câmpurile la montarea componentei
    localStorage.removeItem("email");
    localStorage.removeItem("password");
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
      subscribe: false,
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccessMessage("");

    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
      subscribe,
    } = formData;

    if (!email || !password || !firstName || !lastName) {
      setError("Toate câmpurile sunt obligatorii!");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Parolele nu coincid!");
      setLoading(false);
      return;
    }

    try {
      // Creăm contul de utilizator prin Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      const userId = data.user?.id;
      if (!userId) throw new Error("Nu s-a putut obține ID-ul utilizatorului!");

      const { error: detailsError } = await supabase
        .from("user_details")
        .insert([
          {
            user_id: userId,
            first_name: firstName,
            last_name: lastName,
            phone_number: phone || null,
            subscribe, // Stocăm opțiunea de abonare
          },
        ]);
      if (detailsError) throw detailsError;

      setSuccessMessage(
        "Contul a fost creat cu succes! Verificați emailul pentru confirmare."
      );
      setTimeout(() => {
        navigate("/login");
      }, 4000);
    } catch (err) {
      console.error("Eroare la înregistrare:", err.message);
      // Dacă eroarea provine dintr-o constrângere de cheie străină,
      // afișăm mesajul dorit în popup.
      if (err.message.includes("violates foreign key constraint")) {
        setError("Acest utilizator deja exista. Adauga alt email.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Resetăm formularul și direcționăm utilizatorul către pagina de login
    localStorage.removeItem("email");
    localStorage.removeItem("password");
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
      subscribe: false,
    });
    navigate("/login");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <form
        onSubmit={handleSubmit}
        autoComplete="off" // Dezactivează autofill complet
        className="relative bg-gray-100 p-8 rounded-lg shadow-xl w-full max-w-md"
      >
        {/* Câmpuri ascunse pentru a preveni autofill */}
        <input
          type="text"
          name="dummy-username"
          autoComplete="username"
          style={{ display: "none" }}
        />
        <input
          type="password"
          name="dummy-password"
          autoComplete="new-password"
          style={{ display: "none" }}
        />
        <button
          onClick={handleClose}
          className="absolute top-3 right-4 text-gray-600 text-3xl hover:text-gray-800"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-center mb-1">Înregistrare</h2>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        {successMessage && (
          <p className="text-green-600 text-center mb-4">{successMessage}</p>
        )}

        <div className="space-y-2">
          <div>
            <label htmlFor="firstName" className="block text-gray-600 text-s">
              Prenume
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
              autoComplete="off"
              className="w-full border px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-gray-600 text-s">
              Nume de familie
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              autoComplete="off"
              className="w-full border px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-600 text-s">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
              className="w-full border px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-600 text-s">
              Parolă
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="off"
              className="w-full border px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-gray-600 text-s"
            >
              Confirmă parola
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="off"
              className="w-full border px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-gray-600 text-s">
              Telefon
            </label>
            <input
              type="text"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="off"
              className="w-full border px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Checkbox pentru abonare */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="subscribe"
              id="subscribe"
              checked={formData.subscribe}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <label
              htmlFor="subscribe"
              className="text-sm mt-4 ml-3 text-gray-700"
            >
              Doresc să primesc informații despre noutăți, promoții și vouchere
              de reducere
            </label>
          </div>
        </div>
        <div className="flex flex-col items-center mt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-900 text-white duration-100 active:scale-105 hover:bg-sky-800 active:bg-sky-700 py-2 rounded-md"
          >
            {loading ? "Se înregistrează..." : "Înregistrare"}
          </button>
        </div>

        <p className="text-sm text-gray-600 mt-4">
          Prin crearea contului declar că am luat la cunoștință de principiile
          prelucrării datelor și de termenii și condițiile.
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;
