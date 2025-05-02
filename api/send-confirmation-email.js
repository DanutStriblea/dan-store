import sendConfirmationEmail from "../backend/sendConfirmationEmail";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const order = req.body;
    await sendConfirmationEmail(order);
    res.status(200).json({ message: "Email de confirmare trimis cu succes!" });
  } catch (error) {
    console.error("Eroare la trimiterea emailului de confirmare:", error);
    res
      .status(500)
      .json({ error: "Eroare la trimiterea emailului de confirmare." });
  }
}
