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

  useEffect(() => {
    refetch(); // Fetch devis when the page loads
  }, [refetch]);

  useEffect(() => {
    setIsNameValid(devisName.length <= 60);
  }, [devisName]);

 
  return (
    <div className={`flex flex-col space-y-6 p-6 rounded-xl shadow-lg transition-all ${isDarkMode ? "bg-base-800 text-white" : "bg-base-100 text-black"}`}>
      <h1 className="text-2xl font-semibold text-primary">Mes devis</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Create a Devis card, matching the DevisComponent style */}

        {devis.length > 0 && devis.map((item, index) => (
          <div key={index}>
            <DevisComponent devis={item} index={index} />
          </div>
        ))}
      </div>

      {/* Modal */}
    
    </div>
  );
}
