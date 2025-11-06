export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
          <p style={{ fontSize: '1.5rem', color: '#666' }}>Page Not Found</p>
          <a href="/" style={{ marginTop: '2rem', color: '#0070f3', textDecoration: 'none' }}>
            Return Home
          </a>
        </div>
      </body>
    </html>
  )
}
