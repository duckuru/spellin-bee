import { LoaderIcon } from 'lucide-react'
function PageLoader() {
  return (
    <div className='flex items-center justify-center'>
      <LoaderIcon className='size-10 animate-spin'/>
    </div>
  )
}

export default PageLoader