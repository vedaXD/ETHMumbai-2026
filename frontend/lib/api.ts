// Mock API utility

function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
}

export const api = {
  get: async (url: string): Promise<any> => {
    // Return empty mock arrays so the ui doesn't crash from missing axios
    if (url.includes('/api/bots/assets/')) {
        return { data: { assets: [], totalUSD: 0 } }
    }
    return { data: { deals: [], stats: {}, orders: [], bot: null } }
  },
  post: async (url: string, data?: unknown): Promise<any> => {
    return { data: { success: true, address: '0xmock', name: 'mock.eth' } }
  },
  put: async (url: string, data?: unknown): Promise<any> => ({ data: {} }),
  delete: async (url: string): Promise<any> => ({ data: {} }),
}
