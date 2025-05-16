
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, serverTimestamp, orderBy, limit, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Workshop, Lesson } from "@/lib/types";

// Workshop collection references
const workshopsCollection = collection(db, "workshops");
const lessonsCollection = collection(db, "lessons");

// Workshop CRUD operations
export const createWorkshop = async (workshopData: Omit<Workshop, "id" | "createdAt" | "updatedAt">) => {
  try {
    const docRef = await addDoc(workshopsCollection, {
      ...workshopData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { id: docRef.id };
  } catch (error) {
    console.error("Error creating workshop:", error);
    throw error;
  }
};

export const getWorkshopById = async (workshopId: string) => {
  try {
    const docRef = doc(db, "workshops", workshopId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Workshop;
    } else {
      throw new Error("Workshop not found");
    }
  } catch (error) {
    console.error("Error fetching workshop:", error);
    throw error;
  }
};

export const getWorkshopsByCreator = async (creatorId: string) => {
  try {
    const q = query(
      workshopsCollection, 
      where("creatorId", "==", creatorId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const workshops: Workshop[] = [];
    
    querySnapshot.forEach((doc) => {
      workshops.push({ id: doc.id, ...doc.data() } as Workshop);
    });
    
    return workshops;
  } catch (error) {
    console.error("Error fetching workshops by creator:", error);
    throw error;
  }
};

export const getAllWorkshops = async () => {
  try {
    const q = query(workshopsCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const workshops: Workshop[] = [];
    
    querySnapshot.forEach((doc) => {
      workshops.push({ id: doc.id, ...doc.data() } as Workshop);
    });
    
    return workshops;
  } catch (error) {
    console.error("Error fetching all workshops:", error);
    throw error;
  }
};

export const updateWorkshop = async (workshopId: string, workshopData: Partial<Workshop>) => {
  try {
    const workshopRef = doc(db, "workshops", workshopId);
    await updateDoc(workshopRef, {
      ...workshopData,
      updatedAt: serverTimestamp(),
    });
    
    return { id: workshopId };
  } catch (error) {
    console.error("Error updating workshop:", error);
    throw error;
  }
};

export const deleteWorkshop = async (workshopId: string) => {
  try {
    // First delete associated lessons
    const lessonsQuery = query(lessonsCollection, where("workshopId", "==", workshopId));
    const lessonSnapshots = await getDocs(lessonsQuery);
    
    const deleteLessonPromises = lessonSnapshots.docs.map((docSnapshot) => {
      return deleteDoc(doc(db, "lessons", docSnapshot.id));
    });
    
    await Promise.all(deleteLessonPromises);
    
    // Then delete the workshop
    await deleteDoc(doc(db, "workshops", workshopId));
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting workshop:", error);
    throw error;
  }
};

// Lesson CRUD operations
export const createLesson = async (lessonData: Omit<Lesson, "id" | "createdAt" | "updatedAt">) => {
  try {
    const docRef = await addDoc(lessonsCollection, {
      ...lessonData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { id: docRef.id };
  } catch (error) {
    console.error("Error creating lesson:", error);
    throw error;
  }
};

export const getLessonById = async (lessonId: string) => {
  try {
    const docRef = doc(db, "lessons", lessonId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Lesson;
    } else {
      throw new Error("Lesson not found");
    }
  } catch (error) {
    console.error("Error fetching lesson:", error);
    throw error;
  }
};

export const getLessonsByWorkshop = async (workshopId: string) => {
  try {
    const q = query(
      lessonsCollection, 
      where("workshopId", "==", workshopId),
      orderBy("order", "asc")
    );
    
    const querySnapshot = await getDocs(q);
    const lessons: Lesson[] = [];
    
    querySnapshot.forEach((doc) => {
      lessons.push({ id: doc.id, ...doc.data() } as Lesson);
    });
    
    return lessons;
  } catch (error) {
    console.error("Error fetching lessons by workshop:", error);
    throw error;
  }
};

export const updateLesson = async (lessonId: string, lessonData: Partial<Lesson>) => {
  try {
    const lessonRef = doc(db, "lessons", lessonId);
    await updateDoc(lessonRef, {
      ...lessonData,
      updatedAt: serverTimestamp(),
    });
    
    return { id: lessonId };
  } catch (error) {
    console.error("Error updating lesson:", error);
    throw error;
  }
};

export const deleteLesson = async (lessonId: string) => {
  try {
    await deleteDoc(doc(db, "lessons", lessonId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting lesson:", error);
    throw error;
  }
};
