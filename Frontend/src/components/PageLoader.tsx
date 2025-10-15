import { LoaderIcon } from 'lucide-react'
function PageLoader() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <LoaderIcon className='size-10 animate-spin'/>
    </div>
  )
}

export default PageLoader