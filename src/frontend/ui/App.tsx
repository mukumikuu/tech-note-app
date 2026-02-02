import Notebook from '../components/notebook'
import Sidebar from '../components/sidebar'

function App() {
  return (
    <div className='flex w-full flex-row'>
      <Sidebar></Sidebar>
      <div className='flex w-full flex-col px-4'>
        <Notebook></Notebook>
      </div>
    </div>
  )
}

export default App
