import { getFaqItems } from '../utils/repository'

export default defineEventHandler(async () => {
  const { data, source } = await getFaqItems()
  return { data, source }
})
