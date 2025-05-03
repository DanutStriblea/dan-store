// sendConfirmationEmail.js

// Încarcă variabilele de mediu doar în modul de dezvoltare
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { Resend } = require("resend");

// Debug: Verifică valoarea variabilei RESEND_API_KEY
console.log("RESEND_API_KEY din process.env:", process.env.RESEND_API_KEY);

const resend = new Resend(process.env.RESEND_API_KEY);

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sendConfirmationEmail = async (order) => {
  // Extragem câmpurile importante din obiect
  let { email, name, order_number, order_total, created_at, products_ordered } =
    order;

  // Verificăm existența tuturor câmpurilor necesare
  if (
    !email ||
    !name ||
    !order_number ||
    !order_total ||
    !created_at ||
    !products_ordered
  ) {
    console.error(
      "Lipsesc câmpuri necesare pentru trimiterea emailului de confirmare.",
      { email, name, order_number, order_total, created_at, products_ordered }
    );
    return;
  }

  // Validăm formatul adresei de email
  if (!isValidEmail(email)) {
    console.error("Adresa de email nu este validă:", email);
    return;
  }

  // Dacă products_ordered este stocat ca JSON string, îl convertim în array
  if (typeof products_ordered === "string") {
    try {
      products_ordered = JSON.parse(products_ordered);
    } catch (err) {
      console.error("Eroare la conversia products_ordered:", err);
      return;
    }
  }

  // Construim listele de produse pentru email (text și HTML)
  const productListText = products_ordered
    .map((p) => `${p.product_name} - ${p.quantity} x ${p.price} RON`)
    .join("\n");

  const productListHtml = products_ordered
    .map((p) => `<li>${p.product_name} - ${p.quantity} x ${p.price} RON</li>`)
    .join("");

  try {
    const emailData = {
      from: "onboarding@resend.dev", // Pentru test, folosești un sender valid; pe producție folosește unul verificat
      to: email,
      subject: `Confirmare comandă - ${order_number}`,
      text: `Bună ${name},

Comanda ta cu numărul ${order_number} a fost plasată cu succes pe ${created_at}.

Produse comandate:
${productListText}

Total: ${order_total} RON

Mulțumim pentru comandă!`,
      html: `<p>Bună ${name},</p>
             <p>Comanda ta cu numărul <strong>${order_number}</strong> a fost plasată cu succes pe ${created_at}.</p>
             <ul>${productListHtml}</ul>
             <p><strong>Total: ${order_total} RON</strong></p>
             <p>Mulțumim pentru comandă!</p>`,
    };

    // Log pentru debugging: verificăm payload-ul ce va fi transmis
    console.log("Datele trimise către Resend:", emailData);
    console.log("Email destinat:", email);
    console.log("Subiect email:", `Confirmare comandă - ${order_number}`);
    console.log("Conținut text email:", emailData.text);
    console.log("Conținut HTML email:", emailData.html);

    const response = await resend.emails.send(emailData);

    console.log("Răspuns complet de la Resend:", response);
    return response;
  } catch (error) {
    console.error("Eroare la trimiterea emailului de confirmare:", error);
    throw error;
  }
};

module.exports = sendConfirmationEmail;
