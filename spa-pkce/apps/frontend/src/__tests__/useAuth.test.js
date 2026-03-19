import { beforeEach, describe, expect, it, vi } from "vitest";

const mockInitialize = vi.fn();
const mockGetAllAccounts = vi.fn().mockReturnValue([]);
const mockLoginRedirect = vi.fn();
const mockLogoutRedirect = vi.fn();
const mockAcquireTokenSilent = vi.fn();
const mockAcquireTokenRedirect = vi.fn();

vi.mock("../msalInstance.js", () => ({
  initializeMsal: (...args) => mockInitialize(...args),
  msalInstance: {
    getAllAccounts: mockGetAllAccounts,
    loginRedirect: mockLoginRedirect,
    logoutRedirect: mockLogoutRedirect,
    acquireTokenSilent: mockAcquireTokenSilent,
    acquireTokenRedirect: mockAcquireTokenRedirect,
  },
}));

const { useAuth } = await import("../composables/useAuth.js");

describe("useAuth (PKCE)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllAccounts.mockReturnValue([]);
    // Reset module-level state by setting through returned refs
    const { isAuthenticated, account } = useAuth();
    isAuthenticated.value = false;
    account.value = null;
  });

  describe("initialize", () => {
    it("sets authenticated state from redirect response", async () => {
      const mockAccount = { name: "Test User", username: "test@example.com" };
      mockInitialize.mockResolvedValue({ account: mockAccount });

      const { initialize, isAuthenticated, account } = useAuth();
      await initialize();

      expect(isAuthenticated.value).toBe(true);
      expect(account.value).toEqual(mockAccount);
    });

    it("falls back to getAllAccounts when no redirect response", async () => {
      const mockAccount = { name: "Cached User", username: "cached@example.com" };
      mockInitialize.mockResolvedValue(null);
      mockGetAllAccounts.mockReturnValue([mockAccount]);

      const { initialize, isAuthenticated, account } = useAuth();
      await initialize();

      expect(isAuthenticated.value).toBe(true);
      expect(account.value).toEqual(mockAccount);
    });

    it("leaves unauthenticated when no accounts exist", async () => {
      mockInitialize.mockResolvedValue(null);
      mockGetAllAccounts.mockReturnValue([]);

      const { initialize, isAuthenticated } = useAuth();
      await initialize();

      expect(isAuthenticated.value).toBe(false);
    });
  });

  describe("login", () => {
    it("calls loginRedirect with graph scopes", async () => {
      const { login } = useAuth();
      await login();

      expect(mockLoginRedirect).toHaveBeenCalledWith(
        expect.objectContaining({ scopes: expect.arrayContaining(["Sites.Read.All"]) })
      );
    });
  });

  describe("logout", () => {
    it("calls logoutRedirect", async () => {
      const { logout } = useAuth();
      await logout();

      expect(mockLogoutRedirect).toHaveBeenCalled();
    });
  });

  describe("acquireToken", () => {
    it("returns token from silent acquisition", async () => {
      mockGetAllAccounts.mockReturnValue([{ username: "test@example.com" }]);
      mockAcquireTokenSilent.mockResolvedValue({ accessToken: "test-token" });

      const { acquireToken } = useAuth();
      const token = await acquireToken();

      expect(token).toBe("test-token");
      expect(mockAcquireTokenSilent).toHaveBeenCalled();
    });

    it("falls back to redirect when silent fails", async () => {
      mockGetAllAccounts.mockReturnValue([{ username: "test@example.com" }]);
      mockAcquireTokenSilent.mockRejectedValue(new Error("interaction_required"));

      const { acquireToken } = useAuth();
      await acquireToken();

      expect(mockAcquireTokenRedirect).toHaveBeenCalled();
    });

    it("throws when no accounts exist", async () => {
      mockGetAllAccounts.mockReturnValue([]);

      const { acquireToken } = useAuth();
      await expect(acquireToken()).rejects.toThrow("No authenticated account");
    });
  });
});
