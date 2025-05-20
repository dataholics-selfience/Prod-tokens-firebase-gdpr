// src/utils/handlePlanSuccess.ts
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

type Plan = "jedi" | "mestrejedi" | "mestreyoda";

// Mapeia os planos com seus dados
export const planData: Record<Plan, { name: string; quota: number }> = {
  jedi: { name: "Jedi", quota: 30 },
  mestrejedi: { name: "Mestre Jedi", quota: 300 },
  mestreyoda: { name: "Mestre Yoda", quota: 3000 },
};

/**
 * Atualiza o plano do usuário no Firebase com base no nome do plano.
 * 
 * @param plan - Nome do plano (ex: 'jedi')
 * @returns status da operação
 */
export async function handlePlanSuccess(plan: Plan) {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  const planInfo = planData[plan];
  if (!planInfo) throw new Error("Plano inválido");

  const userRef = doc(db, "users", user.uid);

  await updateDoc(userRef, {
    plan: planInfo.name,
    quota: planInfo.quota,
    planStartedAt: new Date(),
  });

  return planInfo;
}
