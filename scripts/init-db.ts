const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAW-qXFujbRnphyiF62wPHiKz0-vnDnVQw",
  authDomain: "agristaff-1596b.firebaseapp.com",
  projectId: "agristaff-1596b",
  storageBucket: "agristaff-1596b.firebasestorage.app",
  messagingSenderId: "722877752246",
  appId: "1:722877752246:web:cac3ed1e0053d9dc5fd717",
  measurementId: "G-19XQBN14WZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeDatabase() {
  try {
    // Add Departments
    const agricultureDept = await addDoc(collection(db, 'departments'), {
      name: 'Agriculture Department',
      createdAt: new Date()
    });

    console.log('Added department:', agricultureDept.id);

    // Add Institutes
    const riceInstitute = await addDoc(collection(db, 'institutes'), {
      name: 'Rice Research Institute',
      departmentId: agricultureDept.id,
      createdAt: new Date()
    });

    console.log('Added institute:', riceInstitute.id);

    // Add Units
    const researchUnit = await addDoc(collection(db, 'units'), {
      name: 'Research Unit',
      instituteId: riceInstitute.id,
      createdAt: new Date()
    });

    console.log('Added unit:', researchUnit.id);

    // Add a sample contact
    const sampleContact = await addDoc(collection(db, 'contacts'), {
      title: 'Mr',
      fullName: 'John Doe',
      department: agricultureDept.id,
      institute: riceInstitute.id,
      unit: researchUnit.id,
      mobileNo1: '+94123456789',
      officeNo1: '+94123456780',
      officialEmail: 'john.doe@agriculture.gov',
      address: '123 Agriculture Road, Colombo',
      contactType: 'Person',
      contactStatus: 'OnDuty',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Added sample contact:', sampleContact.id);
    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase(); 