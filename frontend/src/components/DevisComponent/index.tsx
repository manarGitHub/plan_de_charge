import { useAppSelector } from '@/app/redux';
import { Devis } from '@/state/api';
import { CheckCircle, Clock, FileText, SquareArrowOutUpRight, XCircle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

type DevisComponentProps = {
    devis: Devis;
    index: number;
};

function formatDate(dateString?: string): string {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

const getStatusBadge = (statut?: string) => {
    const baseBadge = 'badge badge-lg flex items-center gap-2 text-sm';

    switch (statut) {
        case "Brouillon":
            return (
                <div className={`${baseBadge} text-white dark:text-gray-100 bg-gray-500 dark:bg-gray-700`}>
                    <FileText className='w-4' />
                    Brouillon
                </div>
            );
        case "En cours":
            return (
                <div className={`${baseBadge} text-black dark:text-yellow-200 bg-yellow-400 dark:bg-yellow-600`}>
                    <Clock className='w-4' />
                    En cours
                </div>
            );
        case "Terminé":
            return (
                <div className={`${baseBadge} text-white bg-green-500 dark:bg-green-700`}>
                    <CheckCircle className='w-4' />
                    Terminé
                </div>
            );
        case "Annulé":
            return (
                <div className={`${baseBadge} text-white bg-red-500 dark:bg-red-700`}>
                    <XCircle className='w-4' />
                    Annulé
                </div>
            );
        default:
            return (
                <div className={`${baseBadge} text-black dark:text-gray-300 bg-gray-300 dark:bg-gray-700`}>
                    <XCircle className='w-4' />
                    Indéfini
                </div>
            );
    }
};


const DevisComponent: React.FC<DevisComponentProps> = ({ devis }) => {
    const montantAffiche = devis.montant ? Number(devis.montant).toFixed(2) : "0.00";
    const statutRealisation = devis.statut_realisation ? String(devis.statut_realisation) : undefined;
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

    return (
        <div className="bg-white dark:bg-black text-black dark:text-white p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <div className="flex justify-between items-center w-full mb-4">
                <div className="flex items-center space-x-2">
                    {getStatusBadge(statutRealisation)}
                </div>
                <Link
    className="btn btn-sm text-white bg-blue-primary hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
    href={`/devis/${devis.id}`}
                >
                    Plus
                    <SquareArrowOutUpRight className="w-4 ml-2" />
                </Link>
            </div>

            <div className="space-y-3">
                <div className="stat-title text-lg font-semibold text-black dark:text-white">{`DAC-${devis.numero_dac}`}</div>
                <div className="stat-value text-3xl font-bold text-black dark:text-white">{montantAffiche} €</div>
                <div className="stat-desc text-sm text-gray-600 dark:text-gray-400">
                    Émis le {formatDate(devis.date_emission)}
                </div>
            </div>
        </div>
    );
};

export default DevisComponent;
