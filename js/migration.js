// ==========================================
// MIGRATION V2 — OLD SCHEMA → NEW SCHEMA
// Runs once per user on first load with new code.
// Flag stored in localStorage: 'famresa_v2_migrated_v3'
// ==========================================

async function runV2MigrationIfNeeded() {
  if (!currentUser?.familyId) return;

  // Fast path: localStorage cache
  if (localStorage.getItem('famresa_v2_migrated_v3') === '1') return;

  const familyId = currentUser.familyId;

  // Check Firestore flag (survives browser/device changes)
  try {
    const familleDoc = await familleRef(familyId).get();
    if (familleDoc.exists && familleDoc.data().v2_migrated_v3 === true) {
      localStorage.setItem('famresa_v2_migrated_v3', '1');
      return;
    }
  } catch (_) {}

  console.log('[migration] Starting v2 schema migration...');
  try {

    // ── 1. Migrate FAMILLE (families → familles) ──
    const oldFamDoc = await db.collection('families').doc(familyId).get();
    if (oldFamDoc.exists) {
      const d = oldFamDoc.data();
      await famillesRef().doc(familyId).set({
        nom: d.name || d.nom || 'Ma famille',
        pin: d.pin || '',
        inviteCode: d.inviteCode || '',
        created_by: d.created_by || null,
        createdAt: d.createdAt || ts(),
        migratedAt: ts(),
      }, { merge: true });
    }

    // ── 2. Migrate MEMBRES (families/{id}/members → famille_membres) ──
    const membersSnap = await db.collection('families').doc(familyId).collection('members').get();
    if (!membersSnap.empty) {
      // Check if already migrated
      const existingMembres = await familleMembresRef()
        .where('famille_id', '==', familyId).get();
      const migratedIds = new Set(existingMembres.docs.map(d => d.data().profil_id));

      const familyDoc = oldFamDoc.exists ? oldFamDoc : await famillesRef().doc(familyId).get();
      const createdBy = familyDoc.data()?.created_by;

      const batch = db.batch();
      for (const doc of membersSnap.docs) {
        if (migratedIds.has(doc.id)) continue;
        const d = doc.data();
        const role = doc.id === createdBy ? 'admin' : 'member';
        const ref = familleMembresRef().doc();
        batch.set(ref, {
          famille_id: familyId,
          profil_id: doc.id,
          role,
          nom: d.name || '',
          email: d.email || '',
          photo: d.photo || null,
          createdAt: d.createdAt || ts(),
        });
      }
      await batch.commit();
    }

    // ── 3. Migrate PROFILS — ALL family members, not just current user ──
    const allMembersSnap = await db.collection('families').doc(familyId).collection('members').get();
    const memberIds = allMembersSnap.docs.map(d => d.id);
    // Also include current user in case they're not in the members subcollection
    if (!memberIds.includes(currentUser.id)) memberIds.push(currentUser.id);

    for (const memberId of memberIds) {
      try {
        const existingProfil = await profilRef(memberId).get();
        if (existingProfil.exists) continue; // already migrated
        const userDoc = await db.collection('users').doc(memberId).get();
        if (!userDoc.exists) continue; // no legacy data
        const d = userDoc.data();
        await profilRef(memberId).set({
          nom: d.name || d.nom || '',
          email: d.email || '',
          code_pin: d.pin || '',
          photo: d.photo || null,
          familyId: d.familyId || familyId,
          createdAt: d.createdAt || ts(),
        });
        console.log('[migration] Migrated profil for member', memberId);
      } catch(e) { console.warn('[migration] Failed to migrate profil for', memberId, e); }
    }

    // ── 4. Migrate RESSOURCES (families/{id}/resources → ressources) ──
    const resourcesSnap = await db.collection('families').doc(familyId).collection('resources').get();
    const existingRessources = await ressourcesRef()
      .where('famille_id', '==', familyId).get();
    const migratedResIds = new Set(existingRessources.docs.map(d => d.id));

    if (!resourcesSnap.empty) {
      const batch = db.batch();
      for (const doc of resourcesSnap.docs) {
        if (migratedResIds.has(doc.id)) continue;
        const d = doc.data();
        batch.set(ressourcesRef().doc(doc.id), {
          famille_id: familyId,
          nom: d.name || d.nom || 'Ressource',
          name: d.name || d.nom || 'Ressource',
          type: d.type || 'car',
          emoji: d.emoji || '🚗',
          description: d.observations || d.address || '',
          // Keep all original fields too
          ...d,
          migratedAt: ts(),
        });
      }
      await batch.commit();
    } else {
      // Also check legacy cars collection
      const carsSnap = await db.collection('families').doc(familyId).collection('cars').get();
      if (!carsSnap.empty) {
        const batch = db.batch();
        for (const doc of carsSnap.docs) {
          if (migratedResIds.has(doc.id)) continue;
          const d = doc.data();
          batch.set(ressourcesRef().doc(doc.id), {
            famille_id: familyId,
            nom: d.name || 'Voiture familiale',
            name: d.name || 'Voiture familiale',
            type: 'car',
            emoji: d.emoji || '🚗',
            ...d,
            migratedAt: ts(),
          });
        }
        await batch.commit();
      }
    }

    // ── 5. Migrate RESERVATIONS (families/{id}/bookings → reservations) ──
    const bookingsSnap = await db.collection('families').doc(familyId).collection('bookings').get();
    if (!bookingsSnap.empty) {
      const existingRes = await reservationsRef()
        .where('famille_id', '==', familyId).get();
      const migratedBookingIds = new Set(existingRes.docs.map(d => d.id));

      const batch = db.batch();
      for (const doc of bookingsSnap.docs) {
        if (migratedBookingIds.has(doc.id)) continue;
        const d = doc.data();
        batch.set(reservationsRef().doc(doc.id), {
          famille_id: familyId,
          ressource_id: d.resourceId || d.carId || '',
          profil_id: d.userId || '',
          date_debut: d.startDate || d.date || '',
          date_fin: d.endDate || d.date || '',
          // Keep all original fields
          ...d,
          migratedAt: ts(),
        });
      }
      await batch.commit();
    }

    // ── 6. Migrate ACCES_RESSOURCE (resource_access → acces_ressource) ──
    const accessSnap = await db.collection('resource_access')
      .where('profileId', '==', currentUser.id).get();
    if (!accessSnap.empty) {
      const existingAcces = await accesRessourceRef()
        .where('profil_id', '==', currentUser.id).get();
      const migratedAccesIds = new Set(existingAcces.docs.map(d => d.id));

      const batch = db.batch();
      for (const doc of accessSnap.docs) {
        if (migratedAccesIds.has(doc.id)) continue;
        const d = doc.data();
        batch.set(accesRessourceRef().doc(doc.id), {
          ressource_id: d.resourceId || '',
          profil_id: d.profileId || '',
          famille_id: d.familyId || familyId,
          role: d.role || 'member',
          statut: d.status || 'accepted',
          invited_at: d.invited_at || ts(),
          accepted_at: d.accepted_at || null,
        });
      }
      await batch.commit();
    }

    localStorage.setItem('famresa_v2_migrated_v3', '1');
    // Persist flag in Firestore so other devices/browsers skip migration
    try {
      await familleRef(familyId).update({ v2_migrated_v3: true });
    } catch (_) {}
    console.log('[migration] v2 migration complete');
  } catch (e) {
    console.error('[migration] v2 migration failed:', e);
    // Don't block the app — migration will retry on next load
  }
}
