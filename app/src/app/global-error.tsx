'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
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
          <h1 style={{ fontSize: '4rem', margin: 0 }}>500</h1>
          <p style={{ fontSize: '1.5rem', color: '#666' }}>Something went wrong!</p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: '2rem',
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
