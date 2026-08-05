export const GENERATED_CALIBRATION_TASKS_KEY = 'mom_measuring_generated_calibration_tasks'

export interface GeneratedCalibrationTask {
  category: string
  usage: string
  manageClass: string
  certNo: string
  manageCode: string
  factoryCode: string
  inDate: string
  name: string
  spec: string
  range: string
  divValue: string
  material: string
  manufacturer: string
  cycle: string
  calibDate: string
  validDate: string
  calibOrg: string
  template: string
  method: string
  status: string
  department: string
  workshop: string
  team: string
  location: string
  owner: string
  warnDays: string
  remark: string
  calibCode: string
  temp: string
  humidity: string
  createTime: string
  result: string
  taskStatus: string
  auditor: string
  auditTime: string
}

interface LedgerTaskSource {
  category?: unknown
  usage?: unknown
  manageClass?: unknown
  manageCode?: unknown
  factoryCode?: unknown
  inDate?: unknown
  name?: unknown
  spec?: unknown
  range?: unknown
  divValue?: unknown
  material?: unknown
  manufacturer?: unknown
  cycle?: unknown
  calibDate?: unknown
  validDate?: unknown
  calibOrg?: unknown
  template?: unknown
  method?: unknown
  department?: unknown
  workshop?: unknown
  team?: unknown
  location?: unknown
  owner?: unknown
  warnDays?: unknown
  remark?: unknown
}

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

export const loadGeneratedCalibrationTasks = (): GeneratedCalibrationTask[] => {
  if (!canUseStorage()) return []

  try {
    const parsed = JSON.parse(window.localStorage.getItem(GENERATED_CALIBRATION_TASKS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const saveGeneratedCalibrationTasks = (tasks: GeneratedCalibrationTask[]) => {
  if (!canUseStorage()) return
  window.localStorage.setItem(GENERATED_CALIBRATION_TASKS_KEY, JSON.stringify(tasks))
}

const pad = (value: number) => String(value).padStart(2, '0')

export const createCalibrationTask = (
  source: LedgerTaskSource,
  sequence: number,
  createdAt = new Date()
): GeneratedCalibrationTask => {
  const datePart = `${String(createdAt.getFullYear()).slice(-2)}${pad(createdAt.getMonth() + 1)}${pad(createdAt.getDate())}`
  const timePart = `${pad(createdAt.getHours())}${pad(createdAt.getMinutes())}${pad(createdAt.getSeconds())}`
  const millisecondPart = String(createdAt.getMilliseconds()).padStart(3, '0')
  const text = (value: unknown, fallback = '-') => String(value ?? '').trim() || fallback

  return {
    category: text(source.category),
    usage: text(source.usage),
    manageClass: text(source.manageClass),
    certNo: '-',
    manageCode: text(source.manageCode),
    factoryCode: text(source.factoryCode),
    inDate: text(source.inDate),
    name: text(source.name),
    spec: text(source.spec),
    range: text(source.range),
    divValue: text(source.divValue),
    material: text(source.material),
    manufacturer: text(source.manufacturer),
    cycle: text(source.cycle),
    calibDate: text(source.calibDate),
    validDate: text(source.validDate),
    calibOrg: text(source.calibOrg),
    template: text(source.template),
    method: text(source.method),
    status: '校验中',
    department: text(source.department),
    workshop: text(source.workshop),
    team: text(source.team),
    location: text(source.location),
    owner: text(source.owner),
    warnDays: text(source.warnDays),
    remark: text(source.remark),
    calibCode: `JY${datePart}${timePart}${millisecondPart}${String(sequence + 1).padStart(2, '0')}`,
    temp: '-',
    humidity: '-',
    createTime: `${createdAt.getFullYear()}-${pad(createdAt.getMonth() + 1)}-${pad(createdAt.getDate())} ${pad(createdAt.getHours())}:${pad(createdAt.getMinutes())}:${pad(createdAt.getSeconds())}`,
    result: '-',
    taskStatus: '校验中',
    auditor: '-',
    auditTime: '-'
  }
}

export const appendGeneratedCalibrationTasks = (tasks: GeneratedCalibrationTask[]) => {
  saveGeneratedCalibrationTasks([...tasks, ...loadGeneratedCalibrationTasks()])
}
