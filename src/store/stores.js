import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Auth Store ──────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      allUsers: {},
      bannedUsers: [],

      login: (userInfo) => {
        const { allUsers } = get();
        const uid = userInfo.uid;
        const existing = allUsers[uid];
        const user = existing
          ? { ...existing, lastLogin: Date.now(), isAdmin: userInfo.isAdmin || existing.isAdmin || false }
          : {
              uid,
              displayName: userInfo.displayName,
              email: userInfo.email || null,
              phone: userInfo.phone || null,
              authMethod: userInfo.authMethod,
              isAdmin: userInfo.isAdmin || false,
              createdAt: Date.now(),
              lastLogin: Date.now(),
            };
        set((state) => ({
          currentUser: user,
          allUsers: { ...state.allUsers, [uid]: user },
        }));
      },

      logout: () => set({ currentUser: null }),

      updateUser: (updates) =>
        set((state) => {
          if (!state.currentUser) return state;
          const updated = { ...state.currentUser, ...updates };
          return {
            currentUser: updated,
            allUsers: { ...state.allUsers, [updated.uid]: updated },
          };
        }),

      banUser: (uid) =>
        set((state) => ({
          bannedUsers: [...new Set([...state.bannedUsers, uid])],
        })),

      unbanUser: (uid) =>
        set((state) => ({
          bannedUsers: state.bannedUsers.filter((id) => id !== uid),
        })),

      isUserBanned: (uid) => get().bannedUsers.includes(uid),
    }),
    { name: 'gg_auth' }
  )
);

// ─── Gym / Booking Store ──────────────────────────────────────────────────────
export const useGymStore = create(
  persist(
    (set, get) => ({
      selectedCity: null,
      selectedGym: null,
      selectedSlot: null,
      bookingTimestamp: null,

      // Simulated occupancy seed per gym+slot, stable within session
      occupancySeeds: {},

      setCity: (city) =>
        set({
          selectedCity: city,
          selectedGym: null,
          selectedSlot: null,
          bookingTimestamp: null,
        }),

      setGym: (gym) =>
        set({ selectedGym: gym, selectedSlot: null, bookingTimestamp: null }),

      bookSlot: (slot) =>
        set({ selectedSlot: slot, bookingTimestamp: Date.now() }),

      resetBooking: () =>
        set({
          selectedCity: null,
          selectedGym: null,
          selectedSlot: null,
          bookingTimestamp: null,
        }),

      // Call this from a useEffect (NOT during render) to initialize seeds
      initOccupancy: (gymId, slotId, capacity, peakFactor) => {
        const key = `${gymId}_${slotId}`;
        const seeds = get().occupancySeeds;
        if (seeds[key] !== undefined) return; // already seeded
        const seed = peakFactor * 0.6 + Math.random() * peakFactor * 0.4;
        const clampedSeed = Math.min(Math.max(seed, 0.1), 0.98);
        set((state) => ({
          occupancySeeds: { ...state.occupancySeeds, [key]: clampedSeed },
        }));
      },

      getOccupancy: (gymId, slotId, capacity) => {
        const key = `${gymId}_${slotId}`;
        const seed = get().occupancySeeds[key];
        if (seed === undefined) return null;
        return Math.round(seed * capacity);
      },
    }),
    { name: 'gg_gym' }
  )
);

// ─── Membership Store ─────────────────────────────────────────────────────────
export const useMembershipStore = create(
  persist(
    (set, get) => ({
      memberships: {}, // uid → membership object

      getMembership: (uid) => get().memberships[uid] || null,

      isActive: (uid) => {
        const m = get().memberships[uid];
        if (!m || m.status !== 'active') return false;
        return Date.now() < m.expiresAt;
      },

      subscribe: (uid, plan) => {
        const now = Date.now();
        const expiresAt = now + plan.durationDays * 24 * 60 * 60 * 1000;
        const membership = {
          uid,
          planId: plan.id,
          planName: plan.name,
          price: plan.price,
          startedAt: now,
          expiresAt,
          nextPayment: expiresAt,
          status: 'active',
        };
        set((state) => ({
          memberships: { ...state.memberships, [uid]: membership },
        }));
        return membership;
      },

      cancel: (uid) =>
        set((state) => {
          const m = state.memberships[uid];
          if (!m) return state;
          return {
            memberships: {
              ...state.memberships,
              [uid]: { ...m, status: 'cancelled' },
            },
          };
        }),
    }),
    { name: 'gg_membership' }
  )
);

// ─── Social Store ─────────────────────────────────────────────────────────────
export const useSocialStore = create(
  persist(
    (set, get) => ({
      usernames: {}, // uid → username
      posts: [], // array of post objects
      reports: [], // array of report objects

      setUsername: (uid, username) =>
        set((state) => ({
          usernames: { ...state.usernames, [uid]: username },
        })),

      isUsernameTaken: (username) =>
        Object.values(get().usernames).some(
          (u) => u.toLowerCase() === username.toLowerCase()
        ),

      createPost: (uid, username, caption, imageData) => {
        const post = {
          id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          uid,
          username,
          caption,
          imageData, // base64 or null
          likes: [],
          comments: [],
          createdAt: Date.now(),
          deleted: false,
        };
        set((state) => ({ posts: [post, ...state.posts] }));
        return post;
      },

      toggleLike: (postId, uid) =>
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id !== postId) return p;
            const liked = p.likes.includes(uid);
            return {
              ...p,
              likes: liked ? p.likes.filter((id) => id !== uid) : [...p.likes, uid],
            };
          }),
        })),

      addComment: (postId, uid, username, text) =>
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              comments: [
                ...p.comments,
                { id: `c_${Date.now()}`, uid, username, text, createdAt: Date.now() },
              ],
            };
          }),
        })),

      deletePost: (postId) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, deleted: true } : p
          ),
        })),

      reportPost: (postId, reporterUid) => {
        set((state) => ({
          reports: [
            ...state.reports,
            { postId, reporterUid, at: Date.now() },
          ],
        }));
      },

      deleteUserContent: (uid) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.uid === uid ? { ...p, deleted: true } : p
          ),
        })),
    }),
    { name: 'gg_social' }
  )
);

// ─── Health Store ─────────────────────────────────────────────────────────────
export const useHealthStore = create(
  persist(
    (set, get) => ({
      logs: {}, // uid → array of log entries

      getLogs: (uid) => get().logs[uid] || [],

      addLog: (uid, entry) => {
        const log = { id: `log_${Date.now()}`, ...entry, date: Date.now() };
        set((state) => ({
          logs: {
            ...state.logs,
            [uid]: [log, ...(state.logs[uid] || [])],
          },
        }));
      },

      deleteLog: (uid, logId) =>
        set((state) => ({
          logs: {
            ...state.logs,
            [uid]: (state.logs[uid] || []).filter((l) => l.id !== logId),
          },
        })),
    }),
    { name: 'gg_health' }
  )
);

// ─── Marketplace Store ────────────────────────────────────────────────────────
export const useMarketStore = create(
  persist(
    (set, get) => ({
      cart: [], // { productId, quantity }
      orders: {}, // uid → array of orders

      addToCart: (productId) =>
        set((state) => {
          const existing = state.cart.find((i) => i.productId === productId);
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { cart: [...state.cart, { productId, quantity: 1 }] };
        }),

      removeFromCart: (productId) =>
        set((state) => ({ cart: state.cart.filter((i) => i.productId !== productId) })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cart: quantity <= 0
            ? state.cart.filter((i) => i.productId !== productId)
            : state.cart.map((i) =>
                i.productId === productId ? { ...i, quantity } : i
              ),
        })),

      clearCart: () => set({ cart: [] }),

      getCartCount: () => get().cart.reduce((sum, i) => sum + i.quantity, 0),

      placeOrder: (uid, cartItems, deliveryGym, total) => {
        const order = {
          id: `ORD-${Date.now()}`,
          items: cartItems,
          deliveryGym,
          total,
          status: 'Confirmed',
          placedAt: Date.now(),
          estimatedDelivery: Date.now() + 5 * 24 * 60 * 60 * 1000,
        };
        set((state) => ({
          cart: [],
          orders: {
            ...state.orders,
            [uid]: [order, ...(state.orders[uid] || [])],
          },
        }));
        return order;
      },

      getOrders: (uid) => get().orders[uid] || [],
    }),
    { name: 'gg_market' }
  )
);
