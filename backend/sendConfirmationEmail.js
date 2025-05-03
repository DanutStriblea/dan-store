// În partea de sus, pentru debugging (doar în mediu de dezvoltare, de ex.):
if (process.env.NODE_ENV !== "production") {
  console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY);
}

// ... restul codului
try {
  console.log("Datele trimise către Resend:", {
    from: "onboarding@resend.dev",
    to: email,
    subject: `Confirmare comandă - ${order_number}`,
    text: `Bună ${name},\n\nComanda ta cu numărul ${order_number} a fost plasată cu succes pe ${created_at}.\n\nProduse comandate:\n${productListText}\n\nTotal: ${order_total} RON\n\nMulțumim pentru comandă!`,
    html: `<p>Bună ${name},</p><p>Comanda ta cu numărul <strong>${order_number}</strong> a fost plasată cu succes pe ${created_at}.</p><ul>${productListHtml}</ul><p><strong>Total: ${order_total} RON</strong></p><p>Mulțumim pentru comandă!</p>`,
  });

  const response = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: `Confirmare comandă - ${order_number}`,
    text: `Bună ${name},\n\nComanda ta cu numărul ${order_number} a fost plasată cu succes pe ${created_at}.\n\nProduse comandate:\n${productListText}\n\nTotal: ${order_total} RON\n\nMulțumim pentru comandă!`,
    html: `<p>Bună ${name},</p>
           <p>Comanda ta cu numărul <strong>${order_number}</strong> a fost plasată cu succes pe ${created_at}.</p>
           <ul>${productListHtml}</ul>
           <p><strong>Total: ${order_total} RON</strong></p>
           <p>Mulțumim pentru comandă!</p>`,
  });

  console.log("Răspuns complet de la Resend:", response);
} catch (error) {
  console.error("Eroare la trimiterea emailului de confirmare:", error);
  throw error;
}
