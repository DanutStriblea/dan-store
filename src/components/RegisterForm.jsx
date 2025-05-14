import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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

  const [fieldErrors, setFieldErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
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

    // Reset field errors
    const newFieldErrors = {
      firstName: false,
      lastName: false,
      email: false,
      password: false,
      confirmPassword: false,
      phone: false,
    };

    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
      subscribe,
    } = formData;

    // Validare pentru fiecare câmp
    let hasErrors = false;
    if (!firstName) {
      newFieldErrors.firstName = true;
      hasErrors = true;
    }
    if (!lastName) {
      newFieldErrors.lastName = true;
      hasErrors = true;
    }
    if (!email) {
      newFieldErrors.email = true;
      hasErrors = true;
    }
    if (!password) {
      newFieldErrors.password = true;
      hasErrors = true;
    }
    if (!confirmPassword) {
      newFieldErrors.confirmPassword = true;
      hasErrors = true;
    }
    if (!phone) {
      newFieldErrors.phone = true;
      hasErrors = true;
    }

    setFieldErrors(newFieldErrors);

    if (hasErrors) {
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
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
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
      // Arătăm popup-ul de eroare
      setShowErrorPopup(true);
      // Setăm un timer pentru a închide popup-ul după 4 secunde
      setTimeout(() => {
        setShowErrorPopup(false);
      }, 4000);
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
          className="absolute top-2 right-4 text-gray-600 text-3xl hover:text-gray-800"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-center mb-1">Înregistrare</h2>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

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
              className={`w-full border px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.firstName ? "border-red-500" : ""
              }`}
            />
            {fieldErrors.firstName && (
              <p className="text-red-500 text-xs mt-1">
                Acest câmp este obligatoriu
              </p>
            )}
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
              className={`w-full border px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.lastName ? "border-red-500" : ""
              }`}
            />
            {fieldErrors.lastName && (
              <p className="text-red-500 text-xs mt-1">
                Acest câmp este obligatoriu
              </p>
            )}
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
              className={`w-full border px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.email ? "border-red-500" : ""
              }`}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1">
                Acest câmp este obligatoriu
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-600 text-s">
              Parolă
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="off"
                className={`w-full border px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.password ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-red-500 text-xs mt-1">
                Acest câmp este obligatoriu
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-gray-600 text-s"
            >
              Confirmă parola
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="off"
                className={`w-full border px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.confirmPassword ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash size={16} />
                ) : (
                  <FaEye size={16} />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                Acest câmp este obligatoriu
              </p>
            )}
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
              className={`w-full border px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.phone ? "border-red-500" : ""
              }`}
            />
            {fieldErrors.phone && (
              <p className="text-red-500 text-xs mt-1">
                Acest câmp este obligatoriu
              </p>
            )}
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

        <p className="text-xs text-gray-400 mt-4">
          Prin crearea contului declar că am luat la cunoștință de principiile
          prelucrării datelor și de termenii și condițiile dan-store.
        </p>
      </form>

      {/* Popup de succes */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg p-6 shadow-2xl max-w-md mx-4 border-l-4 border-green-500 transform animate-fadeIn">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-2 mr-4">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Înregistrare reușită!
                </h3>
                <p className="text-sm text-gray-600">{successMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {showErrorPopup && error && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg p-6 shadow-2xl max-w-md mx-4 border-l-4 border-red-500 transform animate-fadeIn">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-full p-2 mr-4">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Eroare la înregistrare
                </h3>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
