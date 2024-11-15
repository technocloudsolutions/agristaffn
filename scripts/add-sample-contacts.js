const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');

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

// Sample data arrays
const firstNames = ['Amal', 'Kamal', 'Nimal', 'Sunil', 'Saman', 'Kumara', 'Pradeep', 'Chaminda', 'Nuwan', 'Lasith'];
const lastNames = ['Perera', 'Silva', 'Fernando', 'Dissanayake', 'Bandara', 'Rajapaksa', 'Gunawardena', 'Wickramasinghe', 'Jayasuriya', 'Herath'];
const titles = ['Mr', 'Mrs', 'Miss', 'Dr', 'Prof'];
const cities = ['Colombo', 'Kandy', 'Galle', 'Matara', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Ratnapura', 'Kurunegala', 'Jaffna'];
const contactTypes = ['Person', 'Institute'];
const contactStatuses = ['OnDuty', 'Retired', 'Transferred'];

// Function to generate random phone number
const generatePhoneNumber = () => {
  return `+94${Math.floor(Math.random() * 2) + 7}${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
};

// Function to generate random email
const generateEmail = (firstName, lastName, domain) => {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
};

async function addSampleContacts() {
  try {
    // Get existing departments and institutes
    const departmentsSnapshot = await getDocs(collection(db, 'departments'));
    const institutesSnapshot = await getDocs(collection(db, 'institutes'));
    const unitsSnapshot = await getDocs(collection(db, 'units'));

    const departments = departmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const institutes = institutesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const units = unitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Generate and add 100 contacts
    for (let i = 0; i < 100; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      const institute = institutes[Math.floor(Math.random() * institutes.length)];
      const unit = units[Math.floor(Math.random() * units.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];

      const contactData = {
        title: titles[Math.floor(Math.random() * titles.length)],
        fullName: `${firstName} ${lastName}`,
        department: department.id,
        institute: institute.id,
        unit: unit.id,
        mobileNo1: generatePhoneNumber(),
        mobileNo2: Math.random() > 0.5 ? generatePhoneNumber() : '',
        whatsAppNo: generatePhoneNumber(),
        officeNo1: `+9411${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
        officeNo2: Math.random() > 0.5 ? `+9411${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}` : '',
        faxNo1: Math.random() > 0.5 ? `+9411${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}` : '',
        faxNo2: Math.random() > 0.3 ? `+9411${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}` : '',
        personalEmail: generateEmail(firstName, lastName, 'gmail.com'),
        officialEmail: generateEmail(firstName, lastName, 'agriculture.gov.lk'),
        address: `${Math.floor(Math.random() * 200) + 1}, ${['Main St', 'Temple Rd', 'Station Rd', 'School Lane'][Math.floor(Math.random() * 4)]}, ${city}`,
        description: `${firstName} ${lastName} is a staff member at the ${institute.name} under the ${department.name}.`,
        contactType: contactTypes[Math.floor(Math.random() * contactTypes.length)],
        contactStatus: contactStatuses[Math.floor(Math.random() * contactStatuses.length)],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'contacts'), contactData);
      console.log(`Added contact ${i + 1}/100:`, contactData.fullName, docRef.id);
    }

    console.log('Successfully added 100 sample contacts');
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample contacts:', error);
    process.exit(1);
  }
}

// Run the script
console.log('Starting to add sample contacts...');
addSampleContacts(); 