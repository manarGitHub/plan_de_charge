"use client"
import { useDeleteDevisMutation, useGetDevisByIdQuery, useUpdateDevisMutation } from '@/state/api'
import { Devis } from '@/state/api'
import { Save ,User, Calendar, DollarSign, Loader, Lightbulb, Trash} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import HommeJourControl from '../HommeJourControl'
import DevisInfo from '../DevisInfo'
import DevisPDF from '../DevisPDF'
import DevisUsers from '../DevisUsers'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DevisPage = ({ params }: { params: { devisId: string } }) => {
  const [devis, setDevis] = useState<Devis | null>(null);
  const [initialDevis, setInitialDevis] = useState<Devis | null>(null);
  const [ecart, setEcart] = useState<number | null>(null);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { data: fetchedDevis, error, isLoading: isFetching } = useGetDevisByIdQuery(
    { id: params.devisId }
  );

  const [updateDevis, { isLoading: isUpdating }] = useUpdateDevisMutation();
  const [deleteDevis, { isLoading: isDeleting }] = useDeleteDevisMutation();


  useEffect(() => {
    if (fetchedDevis) {
      setDevis(fetchedDevis);
      setInitialDevis(fetchedDevis);
      recalculateMetrics(fetchedDevis);
    }
  }, [fetchedDevis]);

  const recalculateMetrics = (devisData: Devis) => {
    if (!devisData) return;
    const ecart =  devisData.charge_hj && devisData.jour_homme_consomme
      ? devisData.charge_hj - devisData.jour_homme_consomme 
      : 0;
    setEcart(ecart);
  };

  useEffect(() => {
    if (devis) {
      recalculateMetrics(devis);
    }
  }, [devis]);

  useEffect(() => {
    setIsSaveDisabled(JSON.stringify(devis) === JSON.stringify(initialDevis));
  }, [devis, initialDevis]);

  const handleSave = async () => {
    if (!devis) return;
    
    const invalidUsers = devis.users?.filter(userWithDevis => 
      !userWithDevis.user?.cognitoId || !userWithDevis.user?.username
    );
    
    if (invalidUsers && invalidUsers.length > 0) {
      alert('Please fill all required fields for all users');
      return;
    }
  
    setIsLoading(true);
    try {
      recalculateMetrics(devis);
  
      const devisData: Partial<Devis> = {
        ...devis,
        statut_realisation: devis.statut_realisation ?? initialDevis?.statut_realisation ?? '',
        statut: devis.statut ?? initialDevis?.statut ?? '',
        jour_homme_consomme: devis.jour_homme_consomme ?? initialDevis?.jour_homme_consomme ?? 0,
        charge_hj: devis.charge_hj ?? initialDevis?.charge_hj ?? 0,
        ecart: ecart ?? undefined,
        hommeJourActive: devis.hommeJourActive ?? false,
        users: devis.users?.map(userWithDevis => ({
          id: userWithDevis.id,
          userId: userWithDevis.userId || 0,
          devisId: devis.id,
          user: {
            cognitoId: userWithDevis.user.cognitoId,
            username: userWithDevis.user.username,
            profile: userWithDevis.user.profile
          }
        })) || []
      };
  
      await updateDevis({ id: devis.id, data: devisData }).unwrap();
      setIsLoading(false);
    } catch (error) {
      console.error("Error while saving devis:", error);
      setIsLoading(false);
    }
  };

  const handleDeleteDevis = async () => {
    if (!devis?.id) return;
  
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ce devis ?");
    if (!confirmDelete) return;
  
    try {
      await deleteDevis({ devisId: devis.id }).unwrap();
      router.push("/devis"); // Or wherever the user should be redirected after delete
    } catch (err) {
      console.error("Erreur lors de la suppression du devis :", err);
      alert("La suppression a échoué. Veuillez réessayer.");
    }
  };
  


  if (isFetching || isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );

  if (!devis) return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-error">Devis Non Trouvé</h1>
          <p className="py-6">Le devis demandé n'existe pas ou n'a pas pu être chargé.</p>
          <button className="btn btn-primary" onClick={() => router.back()}>
            Retour
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div data-theme="fantasy" className="p-4 min-h-screen">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-primary">
            DAC N° <span className="text-blue-400">{devis?.numero_dac}</span>
          </h1>
          <div className="badge badge-xl flex items-center gap-2 text-sm text-white bg-green-300 dark:bg-green-700">         
             <Lightbulb className='w-4'  />
             {devis?.statut_realisation}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            className="select select-bordered select-sm w-full max-w-xs"
            value={devis?.statut_realisation?.toString() ?? ''}
            onChange={(e) => setDevis(prev => prev ? { ...prev, statut_realisation: e.target.value } : prev)}
          >
            <option value="Brouillon">Brouillon</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
            <option value="Annulé">Annulé</option>
            <option value="Indéfini">Indéfini</option>
          </select>

          <select
            className="select select-bordered select-sm w-full max-w-xs"
            value={devis?.statut ?? ''}
            onChange={(e) => setDevis(prev => prev ? { ...prev, statut: e.target.value } : prev)}
          >
            <option value="A_Valider_GRDF">À valider GRDF</option>
            <option value="Valide_GRDF">Validé GRDF</option>
            <option value="Annule">Annulé</option>
          </select>

          <button 
            className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
            disabled={isSaveDisabled || isUpdating}
            onClick={handleSave}
          >
            {isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Sauvegarder
              </>
            )}
          </button>
          <button
  onClick={() => handleDeleteDevis()}
  className="flex h-9 w-9 items-center justify-center bg-gray-200 dark:bg-dark-tertiary dark:text-white btn-circle"
  disabled={isDeleting}
>
  {isDeleting ? (
    <Loader className="animate-spin w-4 text-blue-600" />
  ) : (
    <Trash className="w-4 text-blue-600" />
  )}
</button>

        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex flex-col gap-6 w-full lg:w-1/3">
        <Card>
          <CardContent>
            <CardHeader>
        <h2 className="flex items-center space-x-2 text-xl font-semibold text-black">
  <User className="h-5 w-5 mr-2 text-blue-600" /> {/* Changed the icon color to black */}
  <span>Home/Jour Control</span>
         </h2>
         </CardHeader>
        <HommeJourControl devis={devis} setDevis={setDevis} />
        <div className="stats stats-vertical mt-1 rounded-lg p-1">
          <div className="stat flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <DollarSign  className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-gray-800 font-medium">Écart</span>
            </div>
            <div className="text-gray-800 text-xl font-semibold">{ecart?.toFixed(2)}</div>
          </div>

          <div className="stat flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar  className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-gray-800 font-medium">Charge Homme/Jour</span>
            </div>
            <div className="text-gray-800 text-xl font-semibold">
            {Number(devis.charge_hj || 0).toFixed(2)}
            </div>
          </div>

          <div className="stat flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User  className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-gray-800 font-medium">Homme/Jour Consommé</span>
            </div>
            <div className="text-gray-800 text-xl font-semibold">
              {devis.jour_homme_consomme ? devis.jour_homme_consomme.toFixed(2) : '0.00'}
            </div>
          </div>
        </div>
        </CardContent>
        </Card>
      
          <Card className="bg-base-100 shadow-xl">
            <CardHeader></CardHeader>
            <CardContent>
              <DevisInfo devis={devis} setDevis={setDevis} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 w-full lg:w-2/3">
          <Card className="bg-base-100 shadow-xl">
            <CardHeader></CardHeader>
            <CardContent>
              <DevisUsers devis={devis} setDevis={setDevis} />
            </CardContent>
          </Card>

          <Card className="bg-base-100 shadow-xl">
            <CardContent>
              <DevisPDF devis={devis} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DevisPage;
