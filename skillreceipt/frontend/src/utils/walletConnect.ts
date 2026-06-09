import {
  isConnected,
  isAllowed,
  setAllowed,
  requestAccess,
  getAddress,
  getNetwork,
} from "@stellar/freighter-api";

/**
 * Check if the Freighter browser extension is installed and reachable.
 */
export const checkFreighterInstallation = async (): Promise<boolean> => {
  try {
    const response = await isConnected();
    if (response.error) {
      console.warn("Freighter isConnected error:", response.error);
      return false;
    }
    return response.isConnected === true;
  } catch (error) {
    console.error("Freighter not detected:", error);
    return false;
  }
};

/**
 * Check if the user has previously authorized this app in Freighter.
 */
export const checkFreighterAuthorization = async (): Promise<boolean> => {
  try {
    const response = await isAllowed();
    if (response.error) return false;
    return response.isAllowed === true;
  } catch (error) {
    return false;
  }
};

/**
 * Get the active address from Freighter for an already-authorized app.
 * Use this on page load / reconnect — it does NOT trigger a Freighter popup.
 */
export const getFreighterAddress = async (): Promise<string | null> => {
  try {
    const response = await getAddress();
    if (response.error) {
      console.warn("getAddress error:", response.error);
      return null;
    }
    return response.address || null;
  } catch (error) {
    console.error("Failed to get address:", error);
    return null;
  }
};

/**
 * Request wallet access from the user — this triggers the Freighter popup.
 * Use this when the user explicitly clicks "Connect Wallet".
 */
export const requestWalletAccess = async (): Promise<string | null> => {
  try {
    const accessResponse = await requestAccess();

    if (accessResponse.error) {
      console.warn(
        "User denied access or error occurred:",
        accessResponse.error
      );
      return null;
    }

    return accessResponse.address || null;
  } catch (error) {
    console.error("Failed to request wallet access:", error);
    return null;
  }
};

/**
 * Prompt Freighter to authorize this app (sets app as "allowed").
 */
export const requestFreighterAuthorization = async (): Promise<boolean> => {
  try {
    const response = await setAllowed();
    if (response.error) {
      console.warn("setAllowed error:", response.error);
      return false;
    }
    return response.isAllowed === true;
  } catch (error) {
    console.error("Failed to set Freighter authorization:", error);
    return false;
  }
};

/**
 * Get the currently selected network from Freighter.
 */
export const getFreighterNetwork = async (): Promise<string | null> => {
  try {
    const response = await getNetwork();
    if (response.error) return null;
    return response.network || null;
  } catch (error) {
    return null;
  }
};