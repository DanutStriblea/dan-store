import { useState, useEffect } from "react"; // Importăm hook-urile React pentru gestionarea stărilor și efectelor.
import PropTypes from "prop-types"; // Validăm prop-urile transmise componentei pentru a asigura corectitudinea lor.
import { supabase } from "../supabaseClient"; // Supabase este utilizat pentru gestionarea autentificării și API-ul backend.
import { useNavigate } from "react-router-dom"; // Hook pentru redirecționarea utilizatorului între rutele aplicației.
import RequestResetPassword from "./RequestResetPassword"; // Componente adiționale pentru cererea de resetare a parolei.

const ResetPassword = ({
  fromInternalTrigger = false, // Indică dacă resetarea a fost declanșată din interiorul aplicației.
  requiresOldPassword = false, // Indică dacă utilizatorul trebuie să introducă parola veche.
}) => {
  console.log("Componenta ResetPassword a fost încărcată."); // Mesaj pentru debugging, indică faptul că componenta este declanșată.

  // 🔹 Stări utilizate pentru gestionarea input-urilor și mesajelor:
  const [oldPassword, setOldPassword] = useState(""); // Stare pentru parola veche (cerută doar dacă resetarea este internă).
  const [password, setPassword] = useState(""); // Stare pentru parola nouă introdusă de utilizator.
  const [confirmPassword, setConfirmPassword] = useState(""); // Stare pentru confirmarea parolei noi.
  const [error, setError] = useState(""); // Mesaje de eroare afișate utilizatorului (ex: invalid token).
  const [message, setMessage] = useState(""); // Mesaje de succes afișate utilizatorului (ex: parola resetată).
  const [isLoading, setIsLoading] = useState(!fromInternalTrigger); // Stare pentru afișarea mesajului de încărcare (doar pentru flux extern).
  const [showRequestReset, setShowRequestReset] = useState(false); // Controlează afișarea unui formular pentru cererea de resetare.

  const navigate = useNavigate(); // Hook-ul pentru navigarea între rute (ex: redirecționare la pagina principală).

  // 🔹 Efect declanșat la încărcarea componentei:
  useEffect(() => {
    if (fromInternalTrigger) {
      // Dacă resetarea este internă, componenta se încarcă fără a prelua token-uri din URL.
      setIsLoading(false);
      return; // Se termină funcția pentru fluxul intern.
    }

    const extractTokens = async () => {
      try {
        console.log("URL complet:", window.location.href); // Debugging pentru URL-ul utilizat.

        // 🔹 Detectăm hash-ul complet din URL (formatul include `#/reset-password#access_token`):
        const fullHash = window.location.hash.substring(1); // Eliminăm simbolul `#` din hash.
        console.log("Hash complet extras:", fullHash);

        // 🔹 Separăm părțile hash-ului:
        const hashParts = fullHash.split("#"); // Împărțim hash-ul la fiecare simbol `#`.
        console.log("Părți hash după separare:", hashParts);

        // 🔹 Preluăm parametrii care includ token-urile:
        const params = new URLSearchParams(hashParts[hashParts.length - 1]); // Folosim ultima parte a hash-ului.
        const accessToken = params.get("access_token"); // Obținem token-ul de acces din parametrii.
        const refreshToken = params.get("refresh_token"); // Obținem token-ul de refresh din parametrii.

        console.log("Access Token extras:", accessToken); // Debugging pentru verificarea token-ului de acces.
        console.log("Refresh Token extras:", refreshToken); // Debugging pentru verificarea token-ului de refresh.

        if (!accessToken || !refreshToken) {
          // Dacă unul dintre token-uri lipsește, afișăm eroarea.
          setError("Token-ul pentru resetare lipsește sau este invalid!");
          setIsLoading(false); // Oprim mesajul de încărcare.
          return;
        }

        // 🔹 Setăm sesiunea utilizatorului folosind Supabase:
        const { error } = await supabase.auth.setSession({
          access_token: accessToken, // Token de acces pentru autentificare.
          refresh_token: refreshToken, // Token de refresh pentru sesiune.
        });

        if (error) {
          console.error("Eroare la configurarea sesiunii:", error.message); // Debugging pentru erori în setarea sesiunii.
          setError("Token-ul pentru resetare nu este valid sau a expirat!");
        } else {
          console.log("Sesiunea utilizatorului configurată cu succes!"); // Succes în autentificare.
          setError(""); // Resetăm eroarea.
        }
      } catch (err) {
        // 🔹 Gestionăm erori neașteptate (ex: conexiune pierdută):
        console.error("Eroare neașteptată:", err.message);
        setError("A apărut o eroare neașteptată!");
      } finally {
        setIsLoading(false); // Indică faptul că procesul de resetare s-a terminat.
      }
    };

    extractTokens(); // Apelăm funcția pentru extragerea token-urilor.
  }, [fromInternalTrigger]); // Acest efect rulează doar dacă `fromInternalTrigger` se modifică.

  // 🔹 Funcția pentru resetarea parolei utilizatorului:
  const handleReset = async (e) => {
    e.preventDefault(); // Prevenim comportamentul default al formularului.
    setError(""); // Resetăm mesajele de eroare.
    setMessage(""); // Resetăm mesajele de succes.

    // Validăm dacă parola nouă coincide cu confirmarea:
    if (password !== confirmPassword) {
      setError("Parolele nu se potrivesc!");
      return;
    }

    // Validăm cerințele de complexitate ale parolei noi (ex: minim 6 caractere, literă mare, mică și simbol):
    const isValidPassword =
      password.length >= 6 && // Parola trebuie să aibă cel puțin 6 caractere.
      /[A-Z]/.test(password) && // Cel puțin o literă mare.
      /[a-z]/.test(password) && // Cel puțin o literă mică.
      /[0-9!?@]/.test(password); // Cel puțin un număr sau simbol.

    if (!isValidPassword) {
      // Dacă parola nu este suficient de complexă, afișăm eroarea.
      setError(
        "Parola nouă trebuie să îndeplinească cerințele de complexitate."
      );
      return;
    }

    try {
      // 🔹 Obținem utilizatorul logat folosind API-ul Supabase:
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      console.log("Utilizator logat:", user); // Debugging pentru verificarea utilizatorului logat.

      if (userError || !user) {
        // Dacă utilizatorul nu poate fi obținut, afișăm eroarea.
        throw new Error("Nu s-a putut obține utilizatorul logat.");
      }

      // Validăm parola veche doar dacă este cerută (`requiresOldPassword`):
      if (requiresOldPassword && !oldPassword) {
        setError("Introduceți parola veche!");
        return;
      }

      if (requiresOldPassword) {
        // Autentificăm utilizatorul cu parola veche pentru verificare:
        const { error: oldPasswordError } =
          await supabase.auth.signInWithPassword({
            email: user.email, // Folosim email-ul utilizatorului logat.
            password: oldPassword, // Validăm parola veche.
          });

        if (oldPasswordError) {
          setError("Parola veche este incorectă!"); // Afișăm eroarea dacă parola veche e invalidă.
          return;
        }
      }

      // 🔹 Actualizăm parola utilizatorului cu cea nouă:
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw new Error("A apărut o eroare la resetarea parolei."); // Afișăm eroarea dacă procesul eșuează.
      }

      // 🔹 Afișăm mesajul de succes și navigăm utilizatorul:
      setMessage("Parola a fost resetată cu succes!");
      setTimeout(() => {
        setMessage(""); // Resetăm mesajul după 4 secunde.
        navigate("/"); // Redirecționăm utilizatorul la pagina principală.
      }, 4000);
    } catch (err) {
      console.error("Eroare detectată:", err.message); // Debugging pentru erorile detectate.
      setError(err.message); // Afișăm eroarea utilizatorului.
    }
  };

  // 🔹 Închidem pop-up-ul și navigăm către pagina principală
  const handleClose = () => {
    navigate("/");
  };

  // 🔹 Interfață de încărcare
  if (isLoading) return <p>Se încarcă...</p>;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white p-6 rounded shadow-md w-80">
        {/* Buton pentru închidere */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-4 text-gray-600 text-2xl hover:text-gray-800 focus:outline-none"
        >
          ×
        </button>
        {/* Titlul formularului */}
        <h2
          className={`text-xl font-bold mb-4 text-center ${
            message ? "text-green-500" : ""
          }`}
        >
          {message || "Setare Parolă Nouă"}
        </h2>
        {!message && (
          <>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleReset}>
              {/* Câmp ascuns pentru username */}
              <input
                type="text"
                name="username"
                autoComplete="username"
                hidden
                readOnly
                value={async () => {
                  const { data: user, error } = await supabase.auth.getUser();
                  if (error) {
                    console.error(
                      "Eroare la obținerea utilizatorului:",
                      error.message
                    );
                    return ""; // În caz de eroare, returnăm un string gol.
                  }
                  return user?.email || ""; // Returnăm email-ul utilizatorului, dacă există.
                }}
              />

              {/* Input pentru parola veche, condiționat */}
              {requiresOldPassword && (
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded mb-4"
                  placeholder="Parola veche"
                  autoComplete="current-password"
                />
              )}

              {/* Input pentru parola nouă */}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded mb-4"
                placeholder="Parola nouă"
                autoComplete="new-password"
              />

              {/* Input pentru confirmarea parolei */}
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded mb-4"
                placeholder="Confirmă parola nouă"
                autoComplete="off"
              />

              {/* Buton de salvare */}
              <button
                type="submit"
                className="w-full bg-sky-900 text-white py-2 px-4 rounded hover:bg-sky-800 active:bg-sky-700"
              >
                Salvează
              </button>

              {/* Link pentru solicitarea resetării parolei */}
              <div className="text-center mt-4">
                <span
                  onClick={() => setShowRequestReset(true)} // Activează formularul RequestResetPassword
                  className="cursor-pointer text-sky-600 underline hover:text-sky-800"
                >
                  Solicită resetarea parolei
                </span>
              </div>
            </form>
            {/* Lista cerințelor pentru parolă */}
            <div className="mt-4">
              <ul className="list-disc ml-5 text-sm text-gray-700">
                <li>
                  Cel puțin <strong>6 caractere</strong>
                </li>
                <li>
                  Cel puțin o <strong>literă mare</strong> (A-Z)
                </li>
                <li>
                  Cel puțin o <strong>literă mică</strong> (a-z)
                </li>
                <li>
                  Cel puțin un <strong>număr</strong> sau simbol{" "}
                  <strong>(!?@#$)</strong>
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Formularul RequestResetPassword afișat condiționat */}
        {showRequestReset && (
          <RequestResetPassword onClose={() => setShowRequestReset(false)} />
        )}
      </div>
    </div>
  );
};

// ✅ Validarea prop-urilor
ResetPassword.propTypes = {
  fromInternalTrigger: PropTypes.bool, // Prop pentru activare flux intern/extern
  requiresOldPassword: PropTypes.bool, // Prop pentru activare validare parolă veche
};

export default ResetPassword;
