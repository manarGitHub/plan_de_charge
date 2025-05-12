import { Devis } from '@/state/api'; // Ensure the path is correct
import React, { ChangeEvent } from 'react';
import { Calendar, DollarSign ,FileText, Tag, Users} from "lucide-react";

interface Props {
  devis: Devis;
  setDevis: (devis: Devis) => void;
}

type ValidApplications = {
  [key: string]: string[]; // Key is a string (pole name), value is an array of applications
};

const DevisInfo: React.FC<Props> = ({ devis, setDevis }) => {
  // Define valid values for 'pole' and 'application'
  const validPoles = ['PMOI', 'MC²', 'PGS', 'PTE', 'GDI'];
  //const validApplications = ['SMR', 'Base Client', 'Phileas', 'Gazbhy'];
  const validApplications: ValidApplications = {
    "PMOI": ['SMR', 'Base Client', 'Phileas', 'Gazbhy'],
    "MC²": ['SMR', 'Base Client', 'Phileas', 'Gazbhy'],
    "PGS": ['SMR', 'Base Client', 'Phileas', 'Gazbhy'],
    "PTE": ['SMR', 'Base Client', 'Phileas', 'Gazbhy'],
    "GDI": ['SMR', 'Base Client', 'Phileas', 'Gazbhy'],

    // More poles...
  };

  // Function to format dates as 'YYYY-MM-DD'
  const formatDate = (date: string | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // List of fields that are dates
  const dateFields: Array<keyof Devis> = ['date_debut', 'date_fin', 'date_emission'];

  // Handle input change for each field dynamically
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Devis
  ) => {
    const value = e.target.value;

    // If the field is a date, format and save the date
    if (dateFields.includes(field)) {
      setDevis({
        ...devis,
        [field]: value,
      });
    } else {
      setDevis({
        ...devis,
        [field]: value,
      });
    }
  };
  return (
    <div data-theme="fantasy" className='flex flex-col h-fit bg-base-200 p-5 rounded-xl mb-4 md:mb-0'>
      <div className='space-y-4'>
        
        {/* Date de Début */}
        <div className='flex flex-col'>
          <h2 className='text-xl font-semibold text-neutral-800 mb-2 flex items-center'>
            <Calendar className='h-5 w-5 mr-2 text-blue-600' />
            Date de Début
          </h2>
          <input
            type="date"
            value={formatDate(devis?.date_debut)}
            className='input input-bordered w-full resize-none'
            required
            onChange={(e) => handleInputChange(e, 'date_debut')}
          />
        </div>
  
        {/* Date de Fin */}
        <div className='flex flex-col'>
          <h2 className='text-xl font-semibold text-neutral-800 mb-2 flex items-center'>
            <Calendar className='h-5 w-5 mr-2 text-blue-600' />
            Date de Fin
          </h2>
          <input
            type="date"
            value={formatDate(devis?.date_fin)}
            className='input input-bordered w-full resize-none'
            required
            onChange={(e) => handleInputChange(e, 'date_fin')}
          />
        </div>
  
        {/* Date d'Émission */}
        <div className='flex flex-col'>
          <h2 className='text-xl font-semibold text-neutral-800 mb-2 flex items-center'>
            <Calendar className='h-5 w-5 mr-2 text-blue-600' />
            Date d'Émission
          </h2>
          <input
            type="date"
            value={formatDate(devis?.date_emission)}
            className='input input-bordered w-full resize-none'
            required
            onChange={(e) => handleInputChange(e, 'date_emission')}
          />
        </div>
  
        {/* Montant */}
        <div className='flex flex-col'>
          <h2 className='text-xl font-semibold text-neutral-800 mb-2 flex items-center'>
            <DollarSign className='h-5 w-5 mr-2 text-blue-600' />
            Montant
          </h2>
          <input
            type="number"
            value={devis?.montant || 0}
            className='input input-bordered w-full resize-none'
            required
            onChange={(e) => handleInputChange(e, 'montant')}
          />
        </div>
  
        {/* Libellé */}
        <div className='flex flex-col'>
          <h2 className='text-xl font-semibold text-neutral-800 mb-2 flex items-center'>
            <FileText className='h-5 w-5 mr-2 text-blue-600' />
            Libellé
          </h2>
          <input
            type="text"
            value={devis?.libelle || ''}
            placeholder="Libellé du devis"
            className='input input-bordered w-full resize-none'
            required
            onChange={(e) => handleInputChange(e, 'libelle')}
          />
        </div>
  
        {/* Version */}
        <div className='flex flex-col'>
          <h2 className='text-xl font-semibold text-neutral-800 mb-2 flex items-center'>
            <FileText className='h-5 w-5 mr-2 text-blue-600' />
            Version
          </h2>
          <input
            type="text"
            value={devis?.version || ''}
            placeholder="Version du devis"
            className='input input-bordered w-full resize-none'
            required
            onChange={(e) => handleInputChange(e, 'version')}
          />
        </div>
  {/* Pôle */}
<div className="flex flex-col space-y-6">
  <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
    <Tag className="h-6 w-6 mr-3 text-blue-600" />
    Pôle
  </h2>

  <div className="flex flex-col gap-4">
    {validPoles.map((pole) => {
      const isSelected = devis?.pole === pole; // Check if this pole is selected
      return (
        <div
          key={pole}
          className={`flex flex-col p-4 rounded-lg transition-all duration-300 ${isSelected ? 'bg-gray-300' : 'bg-white'} shadow-sm hover:shadow-md`}
        >
          <label
            className="flex items-center space-x-2 text-md font-semibold text-neutral-800 cursor-pointer"
            onClick={() => {
              // Pass the pole value to handleInputChange
              handleInputChange({ target: { value: pole } } as ChangeEvent<HTMLInputElement>, 'pole');
            }}
          >
            {!isSelected && ( // Only show radio button when not selected
              <input
                type="radio"
                name="pole"
                value={pole}
                checked={isSelected}
                onChange={(e) => handleInputChange(e, 'pole')}
                className="radio radio-sm radio-primary"
              />
            )}
            <span>{pole}</span>
          </label>

          {/* Show Applications only for the selected pole */}
          {isSelected && (
            <div className="flex flex-col gap-2 mt-2 ml-6">
              {validApplications[pole]?.map((application) => (
                <label key={application} className="flex items-center space-x-2 text-sm font-medium text-neutral-700 cursor-pointer">
                  <input
                    type="radio"
                    name="application"
                    value={application}
                    checked={devis?.application === application}
                    onChange={(e) => handleInputChange(e, 'application')}
                    className="radio radio-sm radio-primary"
                  />
                  <span>{application}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      );
    })}
  </div>
</div>


  
      
        {/* Application */}
        {/* The applications are now dynamically handled within the pole section */}
      </div>
    </div>
  );
  
};

export default DevisInfo;
