import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface LabPendingSample {
  productName: string
  productType: string
  extrusionBatchNo: string
  furnaceNo: string
  moldNo: string
  sampleCode: string
  sampleType: string
  frameNo?: string
  billetPosition: string
  extrusionMachine: string
  agingBatchNo: string
  agingFurnaceNo: string
  inFurnaceTime: string
  outFurnaceTime: string
  agingProgram: string
  cncReceiveTime?: string
  cncReceiver?: string
  cncPreparationFinishTime?: string
  preparationItems?: string
  sampleItemNo?: string
  preparationQty?: number
  labSampleStatus: string
  cncDeliveryTime?: string
}

export interface CncPreparationRecord {
  productName: string
  productType: string
  sampleType: string
  longSampleNo: string
  billetPosition: string
  preparationItems: string
  sampleItemNo: string
  preparationQty: number
  moldNo: string
  extrusionBatchNo: string
  extrusionMachine: string
  agingBatchNo: string
  agingFurnaceNo: string
  outTime: string
  cncReceiveTime: string
  cncReceiver: string
  cncPreparationFinishTime: string
  deliveryTime: string
}

export const useSampleFlowStore = defineStore('sampleFlow', () => {
  const labPendingData = ref<LabPendingSample[]>([
    {
      productName: 'FC31',
      productType: '手机类',
      extrusionBatchNo: 'JY20260415-005',
      furnaceNo: '26-415-05-08-01',
      moldNo: 'M11-1205-301',
      sampleCode: 'YP-JY20260415-005-1-T1',
      sampleType: 'B01-性能样',
      frameNo: 'CV-A-A-L6000*W1250*H650*0179',
      billetPosition: '头棒',
      extrusionMachine: 'JY-21',
      agingBatchNo: 'SX20260415008',
      agingFurnaceNo: '2#',
      inFurnaceTime: '2026-04-15 08:00:00',
      outFurnaceTime: '2026-04-15 10:00:00',
      agingProgram: '175℃*8h',
      labSampleStatus: '待收样'
    }
  ])

  const cncPreparationRecords = ref<CncPreparationRecord[]>([])

  const addToLabPending = (sample: LabPendingSample) => {
    labPendingData.value.unshift(sample)
  }

  const addToCncPreparationRecord = (record: CncPreparationRecord) => {
    cncPreparationRecords.value.unshift(record)
  }

  return {
    labPendingData,
    cncPreparationRecords,
    addToLabPending,
    addToCncPreparationRecord
  }
})
