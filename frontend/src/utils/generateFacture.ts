import jsPDF from "jspdf";

interface ReservationHotel {
  hotel: string;
  chambre: string;
  dates: string;
  nuits: number;
  prixNuit: number;
  pdj: boolean;
  prixPdj: number;
}

interface ReservationActivite {
  nom: string;
  date: string;
  prix: number;
}

interface User {
  prenom: string;
  nom: string;
  email: string;
  adresse: string;
}

export const generateFacture = (
  user: User,
  hotels: ReservationHotel[],
  activites: ReservationActivite[]
) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const margin = 20;
  const col2 = W - margin;

  const couleurVert = "#01b285";
  const noir = "#111111";
  const gris = "#666666";
  const grisClair = "#f5f5f5";

  let y = 0;

  // ── En-tête fond vert ──
  doc.setFillColor(couleurVert);
  doc.rect(0, 0, W, 42, "F");

  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("ANALIM", margin, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Plateforme de réservation congressiste", margin, 26);
  doc.text("Palais des Congrès de Limoges", margin, 32);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("FACTURE", col2, 18, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const numeroFacture = `FAC-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 9000 + 1000)}`;

  doc.text(`N° ${numeroFacture}`, col2, 26, { align: "right" });
  doc.text(`Émise le ${dateStr}`, col2, 32, { align: "right" });

  y = 54;

  // ── Infos client ──
  doc.setTextColor(gris);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURÉ À", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(noir);
  doc.setFontSize(10);
  doc.text(`${user.prenom} ${user.nom}`, margin, y); y += 5;
  doc.setFontSize(9);
  doc.setTextColor(gris);
  doc.text(user.email, margin, y); y += 5;
  doc.text(user.adresse, margin, y);

  y += 14;

  // ── Section Hébergement ──
  if (hotels.length > 0) {
    doc.setFillColor(grisClair);
    doc.roundedRect(margin, y, W - margin * 2, 7, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(noir);
    doc.text("HÉBERGEMENT", margin + 4, y + 4.8);
    y += 12;

    hotels.forEach((r) => {
      const sousTotal = r.nuits * (r.prixNuit + (r.pdj ? r.prixPdj : 0));

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(noir);
      doc.text(r.hotel, margin, y);
      doc.text(`${sousTotal} €`, col2, y, { align: "right" });
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(gris);
      doc.text(`${r.chambre} · ${r.dates}`, margin, y); y += 4.5;
      doc.text(`${r.nuits} nuit${r.nuits > 1 ? "s" : ""} × ${r.prixNuit} €`, margin, y);
      if (r.pdj) {
        doc.text(`+ Petit déjeuner × ${r.nuits} × ${r.prixPdj} €`, margin + 60, y);
      }
      y += 8;

      doc.setDrawColor("#e0e0e0");
      doc.line(margin, y - 2, col2, y - 2);
      y += 2;
    });
  }

  y += 4;

  // ── Section Activités ──
  if (activites.length > 0) {
    doc.setFillColor(grisClair);
    doc.roundedRect(margin, y, W - margin * 2, 7, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(noir);
    doc.text("ACTIVITÉS", margin + 4, y + 4.8);
    y += 12;

    activites.forEach((a) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(noir);
      doc.text(a.nom, margin, y);
      doc.text(`${a.prix} €`, col2, y, { align: "right" });
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(gris);
      doc.text(a.date, margin, y);
      y += 8;

      doc.setDrawColor("#e0e0e0");
      doc.line(margin, y - 2, col2, y - 2);
      y += 2;
    });
  }

  y += 8;

  // ── Total ──
  const totalHotels = hotels.reduce((acc, r) => acc + r.nuits * (r.prixNuit + (r.pdj ? r.prixPdj : 0)), 0);
  const totalActivites = activites.reduce((acc, a) => acc + a.prix, 0);
  const total = totalHotels + totalActivites;

  doc.setFillColor(couleurVert);
  doc.roundedRect(margin, y, W - margin * 2, 14, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor("#ffffff");
  doc.text("TOTAL DU SÉJOUR", margin + 6, y + 9);
  doc.text(`${total} €`, col2 - 4, y + 9, { align: "right" });

  y += 22;

  // ── Détail ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(gris);
  doc.text(`Hébergement : ${totalHotels} €`, margin, y);
  doc.text(`Activités : ${totalActivites} €`, margin + 60, y);

  // ── Pied de page ──
  const pageH = 297;
  doc.setFillColor(couleurVert);
  doc.rect(0, pageH - 16, W, 16, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor("#ffffff");
  doc.text("Analim · contact@analim.fr · +33 6 12 34 56 78 · Palais des Congrès, Limoges", W / 2, pageH - 6, { align: "center" });

  doc.save(`facture-analim-${user.nom.toLowerCase()}.pdf`);
};
