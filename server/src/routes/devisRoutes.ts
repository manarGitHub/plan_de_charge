import { Router } from "express";
import { createEmptyDevis, deleteDevis, getAllDevis, getDevisById, updateDevis} from "../controllers/devisController";

const router = Router();
router.post('/',createEmptyDevis);
router.get('/', getAllDevis );
router.get("/:id", getDevisById); 
router.put('/:id', updateDevis); // Update Devis and assign users
router.delete('/:id',deleteDevis)



export default router;