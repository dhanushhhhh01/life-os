'use client'

export default function Home() {
  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(to bottom, #3b82f6, #a855f7)', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>Life OS</h1>
        <p style={{ fontSize: '20px', color: '#dbeafe', marginBottom: '32px' }}>Welcome to your application</p>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '32px', maxWidth: '448px' }}>
          <p style={{ color: '#1f2937', marginBottom: '16px' }}>Your app is now deployed and running!</p>
          <p style={{ color: '#4b5563' }}>Build amazing things here.</p>
        </div>
      </div>
    </main>
  )
}
