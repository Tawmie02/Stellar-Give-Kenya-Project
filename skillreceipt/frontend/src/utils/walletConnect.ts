
import {
    isConnected,
    isAllowed,
    setAllowed,
    requestAccess,
  } from "@stellar/freighter-api";
  
  // 1. Check if the Freighter extension is installed in the browser
  export const checkFreighterInstallation = async (): Promise<boolean> => {
    try {
      const response = await isConnected();
      // The API returns an object { isConnected: boolean }, not a raw boolean
      return response.isConnected === true;
    } catch (error) {
      console.error("Freighter not detected:", error);
      return false;
    }
  };
  
  // 2. Request the user's wallet address (Triggers the Freighter popup)
  export const retrievePublicKey = async (): Promise<string | null> => {
    try {
      // requestAccess() prompts the user to share their public key
      const accessResponse = await requestAccess();
      
      if (accessResponse.error) {
        console.warn("User denied access or error occurred:", accessResponse.error);
        return null;
      }
      
      return accessResponse.address || null;
    } catch (error) {
      console.error("Failed to retrieve public key:", error);
      return null;
    }
  };
  
  // 3. Check if the user has previously authorized this app
  export const checkFreighterAuthorization = async (): Promise<boolean> => {
    try {
      const allowedResponse = await isAllowed();
      return allowedResponse.isAllowed === true;
    } catch (error) {
      return false;
    }
  };
  
  // 4. Force the authorization prompt if they haven't allowed it yet
  export const requestFreighterAuthorization = async (): Promise<boolean> => {
    try {
      const response = await setAllowed();
      return response.isAllowed === true;
    } catch (error) {
      console.error("Failed to set Freighter authorization:", error);
      return false;
    }
  };