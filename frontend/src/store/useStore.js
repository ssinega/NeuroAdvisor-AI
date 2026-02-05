import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getPatients, createPatient, createAnalysis, updateNotes, updatePatientAvatar } from '../api'

const useStore = create(
    persist(
        (set, get) => ({
            user: null,
            patients: [],
            isLoading: false,
            error: null,

            setUser: (user) => set({ user }),

            fetchPatients: async () => {
                set({ isLoading: true });
                try {
                    const patients = await getPatients();
                    set({ patients, isLoading: false });
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                }
            },

            addPatient: async (patient) => {
                set({ isLoading: true });
                try {
                    const newPatient = await createPatient(patient);
                    set((state) => ({
                        patients: [...state.patients, newPatient],
                        isLoading: false
                    }));
                    return newPatient;
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            addAnalysis: async (patientId, analysis) => {
                set({ isLoading: true });
                try {
                    const newAnalysis = await createAnalysis(patientId, analysis);
                    set((state) => ({
                        patients: state.patients.map((p) =>
                            p.id === patientId
                                ? { ...p, history: [newAnalysis, ...p.history], status: 'Verified' }
                                : p
                        ),
                        isLoading: false
                    }));
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                }
            },

            updatePatientNotes: async (patientId, notes) => {
                set({ isLoading: true });
                try {
                    await updateNotes(patientId, notes);
                    set((state) => ({
                        patients: state.patients.map((p) =>
                            p.id === patientId ? { ...p, notes } : p
                        ),
                        isLoading: false
                    }));
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                }
            },

            updateDoctorAvatar: async (avatar) => {
                const currentUser = get().user;
                if (!currentUser) return;

                const newUser = { ...currentUser, avatar };
                set({ user: newUser });

                // Persist to clarity_users in localStorage
                const users = JSON.parse(localStorage.getItem('clarity_users') || '[]');
                const updatedUsers = users.map(u => u.email === currentUser.email ? newUser : u);
                localStorage.setItem('clarity_users', JSON.stringify(updatedUsers));
            },

            updatePatientAvatar: async (patientId, avatar) => {
                set({ isLoading: true });
                try {
                    await updatePatientAvatar(patientId, avatar);
                    set((state) => ({
                        patients: state.patients.map((p) =>
                            p.id === patientId ? { ...p, avatar } : p
                        ),
                        isLoading: false
                    }));
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                }
            },

            updateUserProfile: async (updatedData) => {
                const currentUser = get().user;
                if (!currentUser) return;

                const newUser = { ...currentUser, ...updatedData };
                set({ user: newUser });

                // Persist to clarity_users in localStorage
                const users = JSON.parse(localStorage.getItem('clarity_users') || '[]');
                const updatedUsers = users.map(u => u.email === currentUser.email ? newUser : u);
                localStorage.setItem('clarity_users', JSON.stringify(updatedUsers));
            },

            logout: () => set({ user: null }),
        }),
        {
            name: 'clarity-storage',
            partialize: (state) => ({ user: state.user }) // Only persist user info in localStorage
        }
    )
)

export default useStore
