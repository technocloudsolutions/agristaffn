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
    const departments = [
      'Agriculture Department',
      'Irrigation Department',
      'Agrarian Services'
    ];

    const deptRefs = {};
    
    for (const dept of departments) {
      const deptRef = await addDoc(collection(db, 'departments'), {
        name: dept,
        createdAt: new Date()
      });
      console.log('Added department:', dept, deptRef.id);
      deptRefs[dept] = deptRef.id;
    }

    // Add Institutes
    const institutes = [
      { name: 'Rice Research Institute', department: 'Agriculture Department' },
      { name: 'Plant Genetic Resources Centre', department: 'Agriculture Department' },
      { name: 'Seed Certification Service', department: 'Agriculture Department' }
    ];

    const instRefs = {};

    for (const inst of institutes) {
      const instRef = await addDoc(collection(db, 'institutes'), {
        name: inst.name,
        departmentId: deptRefs[inst.department],
        createdAt: new Date()
      });
      console.log('Added institute:', inst.name, instRef.id);
      instRefs[inst.name] = instRef.id;
    }

    // Add Units
    const units = [
      { name: 'Research Unit', institute: 'Rice Research Institute' },
      { name: 'Development Unit', institute: 'Rice Research Institute' },
      { name: 'Admin Unit', institute: 'Rice Research Institute' }
    ];

    for (const unit of units) {
      const unitRef = await addDoc(collection(db, 'units'), {
        name: unit.name,
        instituteId: instRefs[unit.institute],
        createdAt: new Date()
      });
      console.log('Added unit:', unit.name, unitRef.id);
    }

    // Add sample contacts
    const sampleContacts = [
      {
        title: 'Mr',
        fullName: 'John Doe',
        department: deptRefs['Agriculture Department'],
        institute: instRefs['Rice Research Institute'],
        mobileNo1: '+94771234567',
        officeNo1: '+94112345678',
        officialEmail: 'john.doe@agriculture.gov.lk',
        address: '123 Agriculture Road, Colombo',
        contactType: 'Person',
        contactStatus: 'OnDuty'
      },
      {
        title: 'Mrs',
        fullName: 'Jane Smith',
        department: deptRefs['Agriculture Department'],
        institute: instRefs['Plant Genetic Resources Centre'],
        mobileNo1: '+94777654321',
        officeNo1: '+94112345679',
        officialEmail: 'jane.smith@agriculture.gov.lk',
        address: '456 Research Avenue, Kandy',
        contactType: 'Person',
        contactStatus: 'OnDuty'
      }
    ];

    for (const contact of sampleContacts) {
      const contactRef = await addDoc(collection(db, 'contacts'), {
        ...contact,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Added contact:', contact.fullName, contactRef.id);
    }

    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase(); 