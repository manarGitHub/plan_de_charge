import { Devis } from '@/state/api'
import confetti from 'canvas-confetti'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import { ArrowDownFromLine, Layers } from 'lucide-react'
import React, { useRef } from 'react'

interface DevisPDFProps {
    devis: Devis
}

function formatDate(dateString?: string): string {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

const DevisPDF: React.FC<DevisPDFProps> = ({ devis }) => {
    const devisRef = useRef<HTMLDivElement>(null)

    const handleDownloadPdf = async () => {
        const element = devisRef.current
        if (element) {
            try {
                const canvas = await html2canvas(element, { scale: 3, useCORS: true })
                const imgData = canvas.toDataURL('image/png')

                const pdf = new jsPDF({
                    orientation: "portrait",
                    unit: "mm",
                    format: "A4"
                })

                const pdfWidth = pdf.internal.pageSize.getWidth()
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
                pdf.save(`devis-${devis.id}.pdf`)

                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    zIndex: 9999
                })

            } catch (error) {
                console.error('Erreur lors de la génération du PDF :', error);
            }
        }
    }

    return (
        <div data-theme="fantasy" className="mt-4 hidden lg:block">
            <div className="border-2 border-dashed rounded-xl p-5 bg-base-200">
                <button
                    onClick={handleDownloadPdf}
                    className="flex items-center rounded bg-blue-primary px-3 py-1 text-white hover:bg-blue-600"
>
                    Télécharger PDF
                    <ArrowDownFromLine className="w-4 text-white" />
                </button>

                <div className="p-8" ref={devisRef}>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                            <div className="flex items-center">
                                <div className=" bg-blue-primary text-accent rounded-full p-2">
                                    <Layers className="h-6 w-6 text-accent  " />
                                </div>
                                <span className="text-5xl font-bold italic text-black">
                                    DE<span className="text-5xl font-bold  text-blue-600">VIS</span>
                                </span>
                            </div>
                        </div>
                        <div className="text-right uppercase">
                            <p className="badge badge-ghost">Devis ° {devis.id}</p>
                            <p className="my-2 text-black">
                                <strong>Date d'émission: </strong>
                                {formatDate(devis.date_emission)}
                            </p>
                            <p className="text-black">
                                <strong>Validité du devis: </strong>
                                {formatDate(devis.date_debut)} - {formatDate(devis.date_fin)}
                            </p>
                        </div>
                    </div>

                    <div className="my-6">
                        <p className="badge badge-ghost mb-2">Détails</p>
                        <div className="space-y-2 text-black">
                            <p><strong>Numéro DAC:</strong> {devis.numero_dac || "N/A"}</p>
                            <p><strong>Libellé:</strong> {devis.libelle || "N/A"}</p>
                            <p><strong>Pôle:</strong> {devis.pole || "N/A"}</p>
                            <p><strong>Application:</strong> {devis.application || "N/A"}</p>
                            <p><strong>Version:</strong> {devis.version ?? "N/A"}</p>
                            <p><strong>Charge Homme-Jour:</strong> {devis.charge_hj ?? "N/A"} HJ</p>
                            <p><strong>Montant:</strong> {devis.montant ?? "N/A"} €</p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-2 text-md text-black">
                        <div className="flex justify-between">
                            <div className="font-bold">Jours-Homme Consommés</div>
                            <div>{devis.jour_homme_consomme ?? "N/A"} HJ</div>
                        </div>

                        {devis.hommeJourActive && (
                            <div className="flex justify-between">
                                <div className="font-bold">Charge Homme-Jour Active</div>
                                <div>{devis.charge_hj ?? "N/A"} HJ</div>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <div className="font-bold">Écart</div>
                            <div >{devis.ecart ?? "N/A"} €</div>
                        </div>
                    </div>

                    <div className="overflow-x-auto mt-4">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Id</th>
                                    <th>Nom de Ressource</th>
                                    <th>Profile</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devis.users.map((userWithDevis, index) => (
                                    <tr key={userWithDevis.id}>
                                        <td>{index + 1}</td>
                                        <td>{userWithDevis.user.cognitoId}</td>
                                        <td>{userWithDevis.user.username}</td>
                                        <td>{userWithDevis.user.profile}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Statut and Statut de Réalisation */}
                    <div className="mt-8 border-t pt-4 flex justify-between items-center text-lg font-semibold">
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-600">Statut :</span>
                            <span className="badge px-4 py-2 text-white" style={{ backgroundColor: '#10B981' }}>
                                {devis.statut || "N/A"}
                            </span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-gray-600">Statut de Réalisation :</span>
                            <span className="badge badge-accent px-4 py-2 text-white">
                                {devis.statut_realisation || "N/A"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DevisPDF
