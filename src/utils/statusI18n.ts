export const statusKeyMap: Record<string, string> = {
  已完成: 'status.completed',
  未完成: 'status.pending',
  待班长审核: 'status.pendingLeaderReview',
  空闲中: 'status.idle',
  升温中: 'status.heating',
  保温中: 'status.holding',
  合格: 'status.pass',
  不合格: 'status.fail'
}

export const getStatusKey = (value: string) => statusKeyMap[value] ?? value
