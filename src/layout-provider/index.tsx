'use client'
import { usePathname } from 'next/navigation'
import React from 'react'
import PublicLayout from '../app/[locale]/(public)/publicLayout';
import PrivateLayout from '../app/[locale]/(private)/privateLayout';

export default async function CustomLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Ensure that the incoming `locale` is valid

    const pathname = usePathname();
    const isPrivate =
        pathname.startsWith('/user') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/seller') ||
        pathname.startsWith('/dashboard')

    if (isPrivate) {
        return <PrivateLayout>
            {children}
        </PrivateLayout>
    }

    return <PublicLayout>
        {children}
    </PublicLayout>

}

