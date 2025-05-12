"use client";
import { Layers } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useGetAllDevisQuery, useCreateDevisMutation } from "@/state/api"; // Import Redux Toolkit hooks
import { Devis } from "@/state/api";
import DevisComponent from "@/components/DevisComponent";
import { useAppSelector } from "@/app/redux";

export default function Home() {
  const [devisName, setDevisName] = useState("");
  const [isNameValid, setIsNameValid] = useState(true);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode); // Get dark mode state

  // Use Redux Toolkit hooks for API interactions
  const { data: devis = [], refetch } = useGetAllDevisQuery();
  const [createDevis, { isLoading: isCreatingDevis }] = useCreateDevisMutation();

  useEffect(() => {
    refetch(); // Fetch devis when the page loads
  }, [refetch]);

  useEffect(() => {
    setIsNameValid(devisName.length <= 60);
  }, [devisName]);

  const handleCreateDevis = async () => {
    try {
      if (devisName) {
        const newDevis: Partial<Devis> = {
          numero_dac: devisName,
          date_emission: new Date().toISOString().split("T")[0], // Set today's date as the emission date
          statut_realisation: "En cours", // Set the initial status
        };

        // Call createDevis from Redux Toolkit
        await createDevis(newDevis).unwrap();
        refetch(); // Refetch the devis after creating one
        setDevisName(""); // Reset the input field

        const modal = document.getElementById('my_modal_3') as HTMLDialogElement;
        if (modal) {
          modal.close();
        }

        // Trigger confetti effect on success
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          zIndex: 9999,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la création du devis :", error);
    }
  };

  return (
    <div className={`flex flex-col space-y-6 p-6 rounded-xl shadow-lg transition-all ${isDarkMode ? "bg-base-800 text-white" : "bg-base-100 text-black"}`}>
      <h1 className="text-2xl font-semibold text-primary">Mes devis</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Create a Devis card, matching the DevisComponent style */}
        <div
          className={`cursor-pointer flex flex-col justify-center items-center p-6 rounded-xl transition-all duration-300 shadow-lg ${isDarkMode ? "bg-base-700 text-white" : "bg-base-200 text-black"} hover:shadow-xl hover:scale-105`}
          onClick={() => (document.getElementById('my_modal_3') as HTMLDialogElement).showModal()}
        >
          <div className="font-semibold text-primary">Créer un devis</div>
          <div className=" bg-blue-primary text-accent rounded-full p-3 mt-4 shadow-lg">
            <Layers className="h-8 w-8" />
          </div>
        </div>

        {devis.length > 0 && devis.map((item, index) => (
          <div key={index}>
            <DevisComponent devis={item} index={index} />
          </div>
        ))}
      </div>

      {/* Modal */}
      <dialog id="my_modal_3" className={`modal ${isDarkMode ? "dark:bg-base-700" : "bg-base-200"}`}>
        <div className={`modal-box ${isDarkMode ? "dark:bg-base-900" : "bg-base-200"} rounded-lg p-6`}>
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>

          <h3 className="font-semibold text-lg text-primary">Nouveau Devis</h3>

          <input
            type="text"
            placeholder="Nom du devis (max 60 caractères)"
            className="input input-bordered w-full my-4 dark:bg-base-800 dark:text-white dark:border-accent"
            value={devisName}
            onChange={(e) => setDevisName(e.target.value)}
          />

          {!isNameValid && <p className="mb-4 text-sm text-error">Le nom ne peut pas dépasser 60 caractères.</p>}

          <button
            className="btn btn-accent w-full py-2 mt-4"
            disabled={!isNameValid || devisName.length === 0 || isCreatingDevis} // Disable while creating
            onClick={handleCreateDevis}
          >
            {isCreatingDevis ? "Création..." : "Créer"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
