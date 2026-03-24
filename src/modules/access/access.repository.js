// ==========================================
// ACCESS REPOSITORY — Firebase access only
// ==========================================
// No business logic. Only DB operations.

const accessRepository = {
  async listByResourceId(resourceId) {
    const snap = await accesRessourceRef()
      .where('ressource_id', '==', resourceId).get();
    return snap.docs.map(doc => accesRessourceToJS(doc.data(), doc.id));
  },

  async updateStatus(accessId, status) {
    const update = { statut: status };
    if (status === 'accepted') update.accepted_at = ts();
    await accesRessourceRef().doc(accessId).update(update);
  },
};
