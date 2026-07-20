import React from 'react'
import './custom.scss'

// The Payload RootLayout is provided by ../layout.tsx. This nested layout only
// loads admin-specific custom styles and passes children through.
const Layout = ({ children }: { children: React.ReactNode }) => <>{children}</>

export default Layout
