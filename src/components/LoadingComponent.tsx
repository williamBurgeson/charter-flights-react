import AnimatedEllipsis from './AnimatedEllipsis'
import './LoadingComponent.css'

export function LoadingComponent() {
  return (
    <div className="table-box loading">
      <div style={{ paddingTop: '6em' }}>
        <h2 className='loading-text'>Loading<AnimatedEllipsis /></h2>
      </div>
    </div>
  )
}
