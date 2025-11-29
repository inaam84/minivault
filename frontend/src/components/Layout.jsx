// /src/components/Layout.jsx
export default function Layout({ children }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
        background: 'linear-gradient(to right, #6a11cb, #2575fc)',
        color: 'white',
      }}
    >
      <header style={{ padding: 16, textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>MiniVault</h1>
      </header>
      <main
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {children}
      </main>
      <footer style={{ padding: 16, textAlign: 'center' }}>© 2025 MiniVault</footer>
    </div>
  );
}
