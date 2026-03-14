export function cn(...inputs: any[]) {
  // Mock cn since tailwind-merge and clsx cannot be installed due to ENOSPC token limits
  return inputs.filter(Boolean).join(" ")
}
