// ==========================================
// FIREBASE CONFIG
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCf-3Gpbx8FacaeXiwvfSuhsaOJxv2FHTw",
  authDomain: "famcar-e2bb3.firebaseapp.com",
  projectId: "famcar-e2bb3",
  storageBucket: "famcar-e2bb3.firebasestorage.app",
  messagingSenderId: "349994619294",
  appId: "1:349994619294:web:715e9d592c4b2fc025468f",
  measurementId: "G-B9MYJGRNJ1"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function familyRef() {
  if (!currentUser?.familyId) throw new Error('No familyId on currentUser');
  return db.collection('families').doc(currentUser.familyId);
}
