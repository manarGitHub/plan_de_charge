import { Devis } from '@/state/api' 
import React from 'react'

interface Props {
  devis: Devis
  setDevis: (devis: Devis) => void
}

const HommeJourControl: React.FC<Props> = ({ devis, setDevis }) => {

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDevis({
      ...devis,
      hommeJourActive: e.target.checked,
      jour_homme_consomme: e.target.checked ? devis.jour_homme_consomme : 0,
      charge_hj: e.target.checked ? devis.charge_hj || 0 : 0
    })
  }

  const handleHommeJourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDevis({
      ...devis,
      jour_homme_consomme: parseFloat(e.target.value)
    })
  }

  const handleChargeParJourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDevis({
      ...devis,
      charge_hj: parseFloat(e.target.value)
    })
  }

  return (
    <div className="flex flex-col space-y-3 bg-white p-4 rounded-md shadow">
      {/* Label + checkbox alignés horizontalement */}
      <div className="flex items-center space-x-3">
        <label className="text-sm font-bold text-gray-800">Ecart</label>
        <input
          type="checkbox"
          onChange={handleToggleChange}
          checked={devis.hommeJourActive}
          className="w-6 h-6 accent-blue-600 rounded-md border-gray-400 shadow-sm focus:ring focus:ring-blue-300"
        />
      </div>

      {devis.hommeJourActive && (
        <div className="border border-blue-400 bg-gray-100 p-4 rounded-md">
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
            <div className="flex flex-col">
              <label className="text-xs text-gray-700 mb-1">Homme/Jour Consommé</label>
              <input
                type="number"
                value={devis.jour_homme_consomme || ''}
                className="input input-sm w-32 border border-gray-400 text-gray-800 placeholder-gray-500 bg-white"
                onChange={handleHommeJourChange}
                min={0}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-700 mb-1">Charge €/jour</label>
              <input
                type="number"
                value={devis.charge_hj || ''}
                className="input input-sm w-32 border border-gray-400 text-gray-800 placeholder-gray-500 bg-white"
                onChange={handleChargeParJourChange}
                min={0}
                step="0.01"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HommeJourControl;
