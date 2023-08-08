import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

import { onAuthStateChanged, signOut as authSignOut } from "firebase/auth";
import { auth, db } from "@/firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clear = async () => {
    try {
      if(currentUser){
        await updateDoc(doc(db, "users", currentUser.uid),{
          isOnline : false
        });
      }
      setCurrentUser(null);
      setIsLoading(false);
      
    } catch (error) {
      console.error(error);
      
    }
  };

  const authStateChanged = async (user) => {
    setIsLoading(true);
    if (!user) {
      //if user is logged out then.
      clear();
      return;
    }

    const userDocExist = await getDoc(doc(db, "users", user.uid));
    if (userDocExist.exists()) {
      await updateDoc(doc(db, "users", user.uid),{
        isOnline : true
      });
    }

    const userDoc = await getDoc(doc(db, "users", user.uid), {});

    setCurrentUser(userDoc.data()); //if user is logged in then user will be set in setcurrentuser
    setIsLoading(false);
    // console.log(user);
  };

  const signOut = () => {
    authSignOut(auth).then(() => clear());
  };

  useEffect(() => {
    const unsubcribe = onAuthStateChanged(auth, authStateChanged);
    return () => unsubcribe();
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoading,
        setIsLoading,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => useContext(UserContext);
