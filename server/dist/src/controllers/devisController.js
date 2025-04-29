"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDevis = exports.updateDevis = exports.getDevisById = exports.createEmptyDevis = exports.updateDevisStatus = exports.getAllDevis = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllDevis = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Call the function to update the status of devis before fetching them
        yield (0, exports.updateDevisStatus)();
        // Fetching all devis along with the assigned users
        const devis = yield prisma.devis.findMany({
            include: {
                users: true, // Include the assigned users for each devis
            },
        });
        // Sending the devis along with their assigned users
        res.json(devis);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving devis: ${error.message}` });
    }
});
exports.getAllDevis = getAllDevis;
// Fonction de contrôle des statuts des devis
const updateDevisStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all devis
        const devisList = yield prisma.devis.findMany();
        const today = new Date();
        // Update the status for each devis where necessary
        yield Promise.all(devisList.map((devis) => __awaiter(void 0, void 0, void 0, function* () {
            if (devis.date_fin) {
                const dateFin = new Date(devis.date_fin);
                // Check if the status should be updated based on date_fin and statut_realisation
                if (dateFin < today && devis.statut_realisation === "En cours") {
                    // Update status to "Terminé"
                    yield prisma.devis.update({
                        where: { id: devis.id },
                        data: { statut_realisation: "Terminé" },
                    });
                }
            }
        })));
    }
    catch (error) {
        console.error("Erreur lors de la mise à jour des statuts des devis", error);
        throw error;
    }
});
exports.updateDevisStatus = updateDevisStatus;
// Create an empty Devis
const createEmptyDevis = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { numero_dac } = req.body;
    try {
        const newdevis = yield prisma.devis.create({
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
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error creating a devis: ${error.message}` });
    }
});
exports.createEmptyDevis = createEmptyDevis;
// Get Devis by ID including users
const getDevisById = (req, // 'id' is a string coming from URL parameters
res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Retrieve the 'id' parameter from the request
        // Fetch Devis by id and include users and their details
        const devis = yield prisma.devis.findUnique({
            where: { id },
            include: {
                users: {
                    include: {
                        user: true, // Include the related user data
                    },
                },
            },
        });
        if (!devis) {
            res.status(404).json({ error: "Devis not found" }); // Send 404 if devis is not found
            return;
        }
        // Send the retrieved devis data, including user information
        res.json(devis);
    }
    catch (error) {
        res.status(500).json({ error: "Error retrieving devis", details: error.message });
    }
});
exports.getDevisById = getDevisById;
const updateDevis = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const { libelle, date_emission, pole, application, date_debut, date_fin, charge_hj, montant, statut, statut_realisation, jour_homme_consomme, ecart, hommeJourActive, users } = req.body;
    try {
        // Validate and format dates
        const safeFormatDate = (dateValue) => {
            if (!dateValue)
                return null;
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
        const devis = yield prisma.devis.findUnique({ where: { id } });
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
            if (!((_a = user === null || user === void 0 ? void 0 : user.username) === null || _a === void 0 ? void 0 : _a.trim())) {
                throw new Error(`Username is required for all users`);
            }
            if (!((_b = user === null || user === void 0 ? void 0 : user.cognitoId) === null || _b === void 0 ? void 0 : _b.trim())) {
                throw new Error(`Cognito ID is required for all users`);
            }
            try {
                let existingUser = yield prisma.user.findFirst({
                    where: {
                        OR: [
                            { username: user.username.trim() },
                            { cognitoId: user.cognitoId.trim() }
                        ]
                    }
                });
                if (existingUser) {
                    // Update existing user
                    existingUser = yield prisma.user.update({
                        where: { userId: existingUser.userId },
                        data: {
                            profile: user.profile || null,
                            username: user.username // Ensure username is updated if changed
                        }
                    });
                }
                else {
                    // Create new user with all required fields
                    existingUser = yield prisma.user.create({
                        data: {
                            cognitoId: user.cognitoId.trim(),
                            username: user.username.trim(),
                            profile: user.profile || null,
                        },
                    });
                }
                userConnections.push({ userId: existingUser.userId });
            }
            catch (error) {
                console.error(`Error processing user ${user.username}:`, error);
                throw new Error(`Failed to process user ${user.username}`);
            }
        }
        // Update the devis with user associations
        const updatedDevis = yield prisma.devis.update({
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
    }
    catch (error) {
        console.error("Error updating devis:", error);
        res.status(500).json({ message: `Error updating devis: ${error.message}` });
    }
});
exports.updateDevis = updateDevis;
// Delete Devis by ID
const deleteDevis = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Check if the devis exists
        const existingDevis = yield prisma.devis.findUnique({ where: { id } });
        if (!existingDevis) {
            res.status(404).json({ message: "Devis not found" });
            return;
        }
        // Delete associated users from the junction table first (if necessary)
        yield prisma.userDevis.deleteMany({
            where: { devisId: id },
        });
        // Then delete the devis itself
        yield prisma.devis.delete({ where: { id } });
        res.status(200).json({ message: "Devis deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting devis:", error);
        res.status(500).json({ message: `Error deleting devis: ${error.message}` });
    }
});
exports.deleteDevis = deleteDevis;
