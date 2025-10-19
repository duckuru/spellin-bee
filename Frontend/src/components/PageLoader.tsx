import { LoaderIcon } from 'lucide-react'
function PageLoader() {
  return (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
    <LoaderIcon className="w-10 h-10 text-white animate-spin" />
  </div>
  )
}

export default PageLoader