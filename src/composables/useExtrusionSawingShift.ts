import { ref } from 'vue'

export const extrusionSawingMachines = Array.from({ length: 8 }, (_, index) => String(index + 1))
export const extrusionSawingTeams = [
  ...Array.from({ length: 8 }, (_, index) => `A${String(index + 1).padStart(2, '0')}`),
  ...Array.from({ length: 8 }, (_, index) => `B${String(index + 1).padStart(2, '0')}`),
]

// 挤压与锯切属于同一班组：任一工作台上下班后，另一工作台同步反映状态。
const isClockedIn = ref(false)
const currentTeam = ref('')
const clockInTime = ref('')

export const useExtrusionSawingShift = () => ({ isClockedIn, currentTeam, clockInTime })
