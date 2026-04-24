import { db, auth } from './firebase';
import { 
    collection, 
    getDocs, 
    addDoc, 
    query, 
    orderBy,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    updateProfile 
} from 'firebase/auth';

// --- Auth ---
export const signup = async (userData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    await updateProfile(userCredential.user, { displayName: userData.name });
    
    // Create a user document in Firestore (optional but good practice)
    await setDoc(doc(db, "users", userCredential.user.uid), {
        name: userData.name,
        email: userData.email,
        createdAt: new Date().toISOString()
    });

    return { 
        user: { 
            id: userCredential.user.uid, 
            name: userData.name, 
            email: userData.email 
        } 
    };
};

export const login = async (credentials) => {
    const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    return { 
        user: { 
            id: userCredential.user.uid, 
            name: userCredential.user.displayName || 'Admin', 
            email: userCredential.user.email 
        } 
    };
};

// --- Bookings ---
export const fetchBookings = async () => {
    const q = query(collection(db, "bookings"), orderBy("booking_date", "desc"));
    const querySnapshot = await getDocs(q);
    
    // We need hall details. If halls are dynamic, we would fetch them. 
    // Since halls are hardcoded/dummy, we will inject a dummy name if not stored.
    const bookings = [];
    querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() });
    });
    return bookings;
};

export const createBooking = async (bookingData) => {
    // Basic validation to prevent double booking on the same date for the same hall type
    const q = query(collection(db, "bookings"));
    const querySnapshot = await getDocs(q);
    
    for (let doc of querySnapshot.docs) {
        let b = doc.data();
        if (b.hall_type === bookingData.hall_type && b.function_date === bookingData.function_date) {
            throw new Error("This hall is already booked for this function date");
        }
    }

    const docRef = await addDoc(collection(db, "bookings"), {
        ...bookingData,
        createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...bookingData };
};

export const updateBooking = async (id, bookingData) => {
    const docRef = doc(db, "bookings", id);
    await updateDoc(docRef, { ...bookingData });
    return { id, ...bookingData };
};

export const deleteBooking = async (id) => {
    const docRef = doc(db, "bookings", id);
    await deleteDoc(docRef);
    return id;
};

// --- Billings ---
export const fetchBillings = async () => {
    const q = query(collection(db, "billings"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const billings = [];
    querySnapshot.forEach((doc) => {
        billings.push({ id: doc.id, ...doc.data() });
    });
    return billings;
};

export const createBilling = async (billingData) => {
    // We need to resolve booking_name from booking_id
    let booking_name = "Unknown Booking";
    try {
        const bDoc = await getDoc(doc(db, "bookings", billingData.booking_id));
        if (bDoc.exists()) {
            const data = bDoc.data();
            booking_name = data.user_name || "Booking " + data.function_date;
        }
    } catch(e) {}
    
    const docRef = await addDoc(collection(db, "billings"), {
        ...billingData,
        booking_name,
        createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...billingData };
};

export const updateBilling = async (id, billingData) => {
    // Re-resolve booking_name if booking_id changed
    let booking_name = billingData.booking_name;
    try {
        const bDoc = await getDoc(doc(db, "bookings", billingData.booking_id));
        if (bDoc.exists()) {
            const data = bDoc.data();
            booking_name = data.user_name || "Booking " + data.function_date;
        }
    } catch(e) {}

    const docRef = doc(db, "billings", id);
    await updateDoc(docRef, { 
        ...billingData,
        booking_name
    });
    return { id, ...billingData, booking_name };
};

export const deleteBilling = async (id) => {
    const docRef = doc(db, "billings", id);
    await deleteDoc(docRef);
    return id;
};

// --- Certificates ---
export const fetchCertificates = async () => {
    const q = query(collection(db, "certificates"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const certificates = [];
    querySnapshot.forEach((doc) => {
        certificates.push({ id: doc.id, ...doc.data() });
    });
    return certificates;
};

export const createCertificate = async (certificateData) => {
    const docRef = await addDoc(collection(db, "certificates"), {
        ...certificateData,
        createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...certificateData };
};

export const updateCertificate = async (id, certificateData) => {
    const docRef = doc(db, "certificates", id);
    await updateDoc(docRef, { ...certificateData });
    return { id, ...certificateData };
};

export const deleteCertificate = async (id) => {
    const docRef = doc(db, "certificates", id);
    await deleteDoc(docRef);
    return id;
};

// --- Halls ---
// Since we deleted the SQLite DB, we need to seed some dummy halls into Firestore if empty
export const fetchHalls = async () => {
    const q = query(collection(db, "halls"));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        // Seed dummy data
        const dummyHalls = [
            {
                name: "Grand Royal Ballroom", 
                description: "A luxurious and spacious hall perfect for grand weddings and large corporate events.", 
                capacity: 500, 
                price_per_day: 15000.00, 
                image_url: "https://images.unsplash.com/photo-1519167758481-83f5c40bc15d?q=80&w=1000&auto=format&fit=crop", 
                amenities: ["AC", "Catering", "DJ", "Parking"]
            },
            {
                name: "Elegant Banquet", 
                description: "Intimate setting with elegant decor, suitable for family gatherings and small parties.", 
                capacity: 150, 
                price_per_day: 5000.00, 
                image_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop", 
                amenities: ["AC", "Catering", "Decoration"]
            },
            {
                name: "Skyline Terrace", 
                description: "Open-air terrace with a stunning view of the city skyline, perfect for evening receptions.", 
                capacity: 300, 
                price_per_day: 8000.00, 
                image_url: "https://images.unsplash.com/photo-1533174000220-db26227038e8?q=80&w=1000&auto=format&fit=crop", 
                amenities: ["Open Air", "Bar", "DJ"]
            }
        ];

        for (let hall of dummyHalls) {
            await addDoc(collection(db, "halls"), hall);
        }

        // Fetch again after seeding
        const newSnapshot = await getDocs(q);
        const halls = [];
        newSnapshot.forEach((doc) => halls.push({ id: doc.id, ...doc.data() }));
        return halls;
    }

    const halls = [];
    querySnapshot.forEach((doc) => halls.push({ id: doc.id, ...doc.data() }));
    return halls;
};
