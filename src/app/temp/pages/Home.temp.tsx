import React from 'react'
import { Link } from 'react-router-dom'

export default function HomeTemp() {
  return (
    <div style={{padding:20}}>
      <h1>Home (temp)</h1>
      <p>This is a temporary home page used to prototype routing.</p>
      <nav>
        <Link to="/">Home</Link> {' | '}
        <Link to="/nonexistent">Broken link (NotFound)</Link>
      </nav>
      <section style={{marginTop:20}}>
        <p>Use this component to verify that React Router is wired correctly.</p>
      </section>
    </div>
  )
}
