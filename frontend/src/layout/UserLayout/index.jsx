import NavbarComponent from '@/Component/Navbar'
import React from 'react'

export default function UserLayout({ children }) {
    return (
        <div>
            <NavbarComponent />
            {children}
        </div>
    )
}
