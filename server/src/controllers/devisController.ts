import { Request, Response } from "express";  // Ensure you import the correct types from express
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const getAllDevis = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {

        // Call the function to update the status of devis before fetching them
    await updateDevisStatus();
      // Fetching all devis along with the assigned users
      const devis = await prisma.devis.findMany({
        include: { 
          users: true,  // Include the assigned users for each devis
        },
      });
  
      // Sending the devis along with their assigned users
      res.json(devis);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: `Error retrieving devis: ${error.message}` });
    }
  };
  
  // Fonction de contrôle des statuts des devis
export const updateDevisStatus = async (): Promise<void> => {
    try {
      // Fetch all devis
      const devisList = await prisma.devis.findMany();
  
      const today = new Date();
  
      // Update the status for each devis where necessary
      await Promise.all(
        devisList.map(async (devis) => {
          if (devis.date_fin) {
            const dateFin = new Date(devis.date_fin);
            
            // Check if the status should be updated based on date_fin and statut_realisation
            if (dateFin < today && devis.statut_realisation === "En cours") {
              // Update status to "Terminé"
              await prisma.devis.update({
                where: { id: devis.id },
                data: { statut_realisation: "Terminé" },
              });
            }
          }
        })
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour des statuts des devis", error);
      throw error;
    }
  };
  

// Create an empty Devis
export const createEmptyDevis = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { numero_dac } = req.body;
  try {
    const newdevis = await prisma.devis.create({
      data: {
        numero_dac: numero_dac,
        libelle: "",
        version: 1,
        date_emission: null,
        pole: "",
        application: "",
        date_debut: null,
        date_fin: null,
        charge_hj: null,
        montant: 0.0,
        statut: "",
        statut_realisation: "",
        jour_homme_consomme: null,
        ecart: null,
        hommeJourActive: false,
      },
    });
    res.status(201).json(newdevis);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating a devis: ${error.message}` });
  }
};

// Get Devis by ID including users
export const getDevisById = async (
    req: Request<{ id: string }>,  // 'id' is a string coming from URL parameters
    res: Response
  ): Promise<void> => {  // Return type is void because the response is handled in the function
    try {
      const { id } = req.params;  // Retrieve the 'id' parameter from the request
  
      // Fetch Devis by id and include users and their details
      const devis = await prisma.devis.findUnique({
        where: { id },
        include: {
          users: {
            include: {
              user: true,  // Include the related user data
            },
          },
        },
      });
  
      if (!devis) {
        res.status(404).json({ error: "Devis not found" });  // Send 404 if devis is not found
        return;
      }
  
      // Send the retrieved devis data, including user information
      res.json(devis);  
    } catch (error: any) {
      res.status(500).json({ error: "Error retrieving devis", details: error.message });
    }
  };
  
  export const updateDevis = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const {
      libelle,
      date_emission,
      pole,
      application,
      date_debut,
      date_fin,
      charge_hj,
      montant,
      statut,
      statut_realisation,
      jour_homme_consomme,
      ecart,
      hommeJourActive,
      users
    } = req.body;
  
    try {
      // Validate and format dates
      const safeFormatDate = (dateValue: any): string | null => {
        if (!dateValue) return null;
        const parsedDate = new Date(dateValue);
        return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
      };
  
      const formattedDateEmission = safeFormatDate(date_emission);
      const formattedDateDebut = safeFormatDate(date_debut);
      const formattedDateFin = safeFormatDate(date_fin);
  
      if (!formattedDateEmission || !formattedDateDebut || !formattedDateFin) {
        res.status(400).json({ message: "Invalid date format provided" });
        return;
      }
  
      // Check if the devis exists
      const devis = await prisma.devis.findUnique({ where: { id } });
      if (!devis) {
        res.status(404).json({ message: "Devis not found" });
        return;
      }
  
      // Prepare user connections (always send username, cognitoId, profile)
      // Prepare user connections
    const userConnections = [];

    for (const userWithDevis of users) {
        const { user } = userWithDevis;
        
        // Validate required fields with proper error messages
        if (!user?.username?.trim()) {
            throw new Error(`Username is required for all users`);
        }
        if (!user?.cognitoId?.trim()) {
            throw new Error(`Cognito ID is required for all users`);
        }

        try {
            let existingUser = await prisma.user.findFirst({
                where: { 
                    OR: [
                        { username: user.username.trim() }, 
                        { cognitoId: user.cognitoId.trim() }
                    ] 
                }
            });

            if (existingUser) {
                // Update existing user
                existingUser = await prisma.user.update({
                    where: { userId: existingUser.userId },
                    data: { 
                        profile: user.profile || null,
                        username: user.username // Ensure username is updated if changed
                    }
                });
            } else {
                // Create new user with all required fields
                existingUser = await prisma.user.create({
                    data: {
                        cognitoId: user.cognitoId.trim(),
                        username: user.username.trim(),
                        profile: user.profile || null,
                    },
                });
            }

            userConnections.push({ userId: existingUser.userId });
        } catch (error) {
            console.error(`Error processing user ${user.username}:`, error);
            throw new Error(`Failed to process user ${user.username}`);
        }
    }
      // Update the devis with user associations
      const updatedDevis = await prisma.devis.update({
        where: { id },
        data: {
          libelle,
          date_emission: formattedDateEmission,
          pole,
          application,
          date_debut: formattedDateDebut,
          date_fin: formattedDateFin,
          charge_hj,
          montant,
          statut,
          statut_realisation,
          jour_homme_consomme,
          ecart,
          hommeJourActive,
          users: {
            deleteMany: {}, // Remove previous user associations
            createMany: { data: userConnections } // Add new user associations
          },
        },
      });
  
      res.json(updatedDevis);
    } catch (error: any) {
      console.error("Error updating devis:", error);
      res.status(500).json({ message: `Error updating devis: ${error.message}` });
    }
  };
  
  
  // Delete Devis by ID
export const deleteDevis = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    // Check if the devis exists
    const existingDevis = await prisma.devis.findUnique({ where: { id } });

    if (!existingDevis) {
      res.status(404).json({ message: "Devis not found" });
      return;
    }

    // Delete associated users from the junction table first (if necessary)
    await prisma.userDevis.deleteMany({
      where: { devisId: id },
    });

    // Then delete the devis itself
    await prisma.devis.delete({ where: { id } });

    res.status(200).json({ message: "Devis deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting devis:", error);
    res.status(500).json({ message: `Error deleting devis: ${error.message}` });
  }
};

  

  

