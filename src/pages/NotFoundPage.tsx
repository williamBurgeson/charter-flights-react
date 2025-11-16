import { Link } from 'react-router-dom'

export default function NotFoundTemp() {
  return (
    <div className="table-box">
      <div style={{padding:20}}>
        <h1>Page not found (temp)</h1>
        <p>The route you requested could not be found.</p>
        <nav>
          <Link to="/">Go home</Link>
        </nav>
      </div>
    </div>
  )
}