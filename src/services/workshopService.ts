
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, serverTimestamp, orderBy, limit, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Workshop, Lesson, Registration, Reflection, Progress, ReflectionStatus } from "@/lib/types";

// Collection references
const workshopsCollection = collection(db, "workshops");
const lessonsCollection = collection(db, "lessons");
const registrationsCollection = collection(db, "registrations");
const reflectionsCollection = collection(db, "reflections");
const progressCollection = collection(db, "progress");

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
    // First delete associated reflections and progress
    const reflectionsQuery = query(reflectionsCollection, where("lessonId", "==", lessonId));
    const progressQuery = query(progressCollection, where("lessonId", "==", lessonId));
    
    const reflectionSnapshots = await getDocs(reflectionsQuery);
    const progressSnapshots = await getDocs(progressQuery);
    
    const deleteReflectionPromises = reflectionSnapshots.docs.map((docSnapshot) => {
      return deleteDoc(doc(db, "reflections", docSnapshot.id));
    });
    
    const deleteProgressPromises = progressSnapshots.docs.map((docSnapshot) => {
      return deleteDoc(doc(db, "progress", docSnapshot.id));
    });
    
    await Promise.all([...deleteReflectionPromises, ...deleteProgressPromises]);
    
    // Then delete the lesson
    await deleteDoc(doc(db, "lessons", lessonId));
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting lesson:", error);
    throw error;
  }
};

// Registration operations
export const registerForWorkshop = async (workshopId: string, learnerId: string, learnerName?: string) => {
  try {
    // Check if already registered
    const q = query(
      registrationsCollection,
      where("workshopId", "==", workshopId),
      where("learnerId", "==", learnerId)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, alreadyRegistered: true };
    }
    
    const docRef = await addDoc(registrationsCollection, {
      workshopId,
      learnerId,
      learnerName,
      registeredAt: serverTimestamp()
    });
    
    return { id: docRef.id, alreadyRegistered: false };
  } catch (error) {
    console.error("Error registering for workshop:", error);
    throw error;
  }
};

export const getRegistrationsForWorkshop = async (workshopId: string) => {
  try {
    const q = query(
      registrationsCollection,
      where("workshopId", "==", workshopId),
      orderBy("registeredAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const registrations: Registration[] = [];
    
    querySnapshot.forEach((doc) => {
      registrations.push({ id: doc.id, ...doc.data() } as Registration);
    });
    
    return registrations;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error;
  }
};

export const getRegistrationsByLearner = async (learnerId: string) => {
  try {
    const q = query(
      registrationsCollection,
      where("learnerId", "==", learnerId),
      orderBy("registeredAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const registrations: Registration[] = [];
    
    querySnapshot.forEach((doc) => {
      registrations.push({ id: doc.id, ...doc.data() } as Registration);
    });
    
    return registrations;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error;
  }
};

// Reflection operations
export const submitReflection = async (lessonId: string, learnerId: string, content: string, learnerName?: string) => {
  try {
    const docRef = await addDoc(reflectionsCollection, {
      lessonId,
      learnerId,
      learnerName,
      content,
      submittedAt: serverTimestamp(),
      reviewed: false
    });
    
    // Also create a progress entry with pending status
    await addDoc(progressCollection, {
      lessonId,
      learnerId,
      reflectionId: docRef.id,
      reflectionStatus: "pending",
      points: 0,
      reviewedBy: "",
      reviewedAt: serverTimestamp()
    });
    
    return { id: docRef.id };
  } catch (error) {
    console.error("Error submitting reflection:", error);
    throw error;
  }
};

export const getReflectionsByLesson = async (lessonId: string) => {
  try {
    const q = query(
      reflectionsCollection,
      where("lessonId", "==", lessonId),
      orderBy("submittedAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const reflections: Reflection[] = [];
    
    querySnapshot.forEach((doc) => {
      reflections.push({ id: doc.id, ...doc.data() } as Reflection);
    });
    
    return reflections;
  } catch (error) {
    console.error("Error fetching reflections:", error);
    throw error;
  }
};

export const getReflectionsByLearner = async (learnerId: string) => {
  try {
    const q = query(
      reflectionsCollection,
      where("learnerId", "==", learnerId),
      orderBy("submittedAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const reflections: Reflection[] = [];
    
    querySnapshot.forEach((doc) => {
      reflections.push({ id: doc.id, ...doc.data() } as Reflection);
    });
    
    return reflections;
  } catch (error) {
    console.error("Error fetching reflections:", error);
    throw error;
  }
};

export const reviewReflection = async (
  reflectionId: string, 
  status: ReflectionStatus, 
  reviewerId: string
) => {
  try {
    // Get the reflection
    const reflectionRef = doc(db, "reflections", reflectionId);
    const reflectionSnap = await getDoc(reflectionRef);
    
    if (!reflectionSnap.exists()) {
      throw new Error("Reflection not found");
    }
    
    const reflection = { id: reflectionSnap.id, ...reflectionSnap.data() } as Reflection;
    
    // Update the reflection
    await updateDoc(reflectionRef, {
      reviewed: true
    });
    
    // Find existing progress document or create new one
    const progressQuery = query(
      progressCollection,
      where("reflectionId", "==", reflectionId)
    );
    
    const progressSnap = await getDocs(progressQuery);
    
    let points = 0;
    if (status === "approved") {
      points = 50;
    } else if (status === "rejected") {
      points = -30;
    }
    
    if (progressSnap.empty) {
      // Create new progress entry
      await addDoc(progressCollection, {
        lessonId: reflection.lessonId,
        learnerId: reflection.learnerId,
        reflectionId,
        reflectionStatus: status,
        points,
        reviewedBy: reviewerId,
        reviewedAt: serverTimestamp()
      });
    } else {
      // Update existing progress entry
      const progressRef = doc(db, "progress", progressSnap.docs[0].id);
      await updateDoc(progressRef, {
        reflectionStatus: status,
        points,
        reviewedBy: reviewerId,
        reviewedAt: serverTimestamp()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error reviewing reflection:", error);
    throw error;
  }
};

export const getLearnerProgress = async (learnerId: string) => {
  try {
    const q = query(
      progressCollection,
      where("learnerId", "==", learnerId)
    );
    
    const querySnapshot = await getDocs(q);
    const progress: Progress[] = [];
    
    querySnapshot.forEach((doc) => {
      progress.push({ id: doc.id, ...doc.data() } as Progress);
    });
    
    return progress;
  } catch (error) {
    console.error("Error fetching learner progress:", error);
    throw error;
  }
};

export const getTotalPoints = async (learnerId: string) => {
  try {
    const progress = await getLearnerProgress(learnerId);
    
    const totalPoints = progress.reduce((sum, item) => sum + item.points, 0);
    
    return totalPoints;
  } catch (error) {
    console.error("Error calculating total points:", error);
    throw error;
  }
};
