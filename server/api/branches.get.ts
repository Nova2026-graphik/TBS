import { getBranches } from '../utils/repository'

export default defineEventHandler(async () => {
  const { data, source } = await getBranches()
  return { data, source }
})
